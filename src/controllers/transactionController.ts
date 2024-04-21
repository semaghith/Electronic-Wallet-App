import { z } from "zod";
import NodeCache from "node-cache";
import { Request, Response } from "express";

import { conn } from "../config";
import { User } from "../models/User";
import { responseMessage, failure } from "../utilities";
import { Transfer, Deposit, Withdraw } from "../models/Transaction";

const idempotencyKeys = new NodeCache({ stdTTL: 7500 }); //  2 H
const cache = new NodeCache({ stdTTL: 300 }); //  5 min

async function validateDate(startDate: Date, endDate: Date) {
  try {
    return (
      z.date().safeParse(startDate).success &&
      z.date().safeParse(endDate).success
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return false;
    }
  }
}

const depositMoney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { depositAmount } = req.body;
    const user = req.user;
    const idempotencyKey = req.header("Idempotency-Key");

    if (!idempotencyKey) {
      res.status(400).json(failure("Idempotency-Key missed"));
      return;
    }

    const keyExist = idempotencyKeys.has(idempotencyKey);

    if (keyExist) {
      res
        .status(200)
        .json(responseMessage({ message: "Request already processed" }));
      return;
    }

    if (depositAmount < 0) {
      res.status(400).json(failure("Amount must be greater than zero"));
      return;
    }

    const transaction = new Deposit({
      amount: depositAmount,
    });

    await user.updateOne({
      $inc: { balance: depositAmount },
      $push: { transactions: transaction },
    });

    //Add key to idempotencyKeys in cache
    idempotencyKeys.set(idempotencyKey, idempotencyKey);

    res.status(200).json(responseMessage({ deposit_amount: depositAmount }));
  } catch (err) {
    res.status(500).json(failure("Deposit failed"));
  }
};

const withdrawMoney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { withdrawAmount } = req.body;

    const user = req.user;

    if (withdrawAmount < 0) {
      res.status(400).json(failure("Amount must be greater than zero"));
      return;
    }

    if (user.balance < withdrawAmount) {
      res.status(400).json(failure("Low balance"));
      return;
    }

    const transaction = new Withdraw({
      amount: withdrawAmount,
    });

    await user.updateOne({
      $inc: { balance: -withdrawAmount },
      $push: { transactions: transaction },
    });

    res.status(200).json(responseMessage({ withdraw_amount: withdrawAmount }));
  } catch (err) {
    res.status(500).json(failure("Withdraw failed"));
  }
};

const transferMoney = async (req: Request, res: Response): Promise<void> => {
  const session = await conn.startSession();

  try {
    session.startTransaction();

    const { receiverID, transferAmount } = req.body;

    const sender = req.user;
    const receiver = await User.findById(receiverID, null, { session }).select({
      _id: 1,
      balance: 1,
    });

    //sender = receiver?

    if (!receiver) {
      res.status(404).json(failure("Receiver ID not found"));
      return;
    }

    if (transferAmount < 0) {
      res.status(400).json(failure("Amount must be greater than zero"));
      return;
    } else if (transferAmount > sender.balance) {
      res.status(400).json(failure("Low balance"));
      return;
    }

    const transaction = new Transfer({
      senderID: sender._id,
      receiverID: receiverID,
      amount: transferAmount,
    });

    await Promise.all([
      sender.updateOne(
        {
          $inc: { balance: -transferAmount },
          $push: { transactions: transaction },
        },
        null,
        { session }
      ),

      receiver.updateOne(
        {
          $inc: { balance: transferAmount },
          $push: { transactions: transaction },
        },
        { session }
      ),
    ]);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(
      responseMessage({
        receiver_id: receiverID,
        transfer_amount: transferAmount,
      })
    );
  } catch (err) {
    session.abortTransaction();
    session.endSession();
    res.status(500).json(failure("Transfer failed"));
  }
};

const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userID = req.user._id;
    const { page, limit } = req.query;

    const parsedPage: number = parseInt(page as string),
      parsedLimit: number = parseInt(limit as string);

    const cacheKey = `${userID}:${parsedPage}:${parsedLimit}`;
    const value = cache.get(`${cacheKey}`);

    if (value) {
      res.status(200).json(responseMessage({ transactions: value }));
      return;
    }

    const user = await User.findById(userID, {
      transactions: { $slice: [(parsedPage - 1) * parsedLimit, parsedLimit] },
    });

    if (!user) {
      res.status(404).json(failure("User not found"));
      return;
    }

    const transactions = user.transactions;
    //.slice((page - 1) * limit, page * limi);

    if (!transactions.length) {
      res
        .status(200)
        .json(responseMessage({ message: "No transactions found" }));
      return;
    }

    cache.set(`${cacheKey}`, transactions);

    res.status(200).json(responseMessage({ transactions: transactions }));
  } catch (err) {
    res.status(500).json(failure("list transactions failed"));
  }
};

const analyzeTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { month, year } = req.query;

    const parsedMonth: number = parseInt(month as string);
    const parsedYear: number = parseInt(year as string);

    let nextMonth = parsedMonth + 1;
    let nextYear = parsedYear;

    if (parsedMonth == 12) {
      nextMonth = 1;
      nextYear++;
    }

    const startDate = new Date(`${parsedYear}-${parsedMonth}`);
    const endDate = new Date(`${nextYear}-${nextMonth}`);

    const validDate = await validateDate(startDate, endDate);

    if (!validDate) {
      res.status(400).json(failure("Invaild date"));
      return;
    }

    const pipeline = [
      {
        $match: {
          _id: user._id,
        },
      },
      {
        $unwind: {
          path: "$transactions",
        },
      },
      {
        $match: {
          "transactions.date": {
            $gte: startDate,
            $lt: endDate,
            // $gte: new Date(`${parsedYear}-${parsedMonth}`),
            // $lt: new Date(`${nextYear}-${nextMonth}`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalDepositAmount: {
            $sum: {
              $cond: {
                if: {
                  $or: [
                    {
                      $eq: ["$transactions.category", "Deposit"],
                    },
                    {
                      $and: [
                        {
                          $eq: ["$transactions.category", "Transfer"],
                        },
                        {
                          $eq: ["$transactions.receiverID", user._id],
                        },
                      ],
                    },
                  ],
                },
                then: "$transactions.amount",
                else: 0,
              },
            },
          },
          totalWithdrawAmount: {
            $sum: {
              $cond: {
                if: {
                  $or: [
                    {
                      $eq: ["$transactions.category", "Withdraw"],
                    },
                    {
                      $and: [
                        {
                          $eq: ["$transactions.category", "Transfer"],
                        },
                        {
                          $eq: ["$transactions.senderID", user._id],
                        },
                      ],
                    },
                  ],
                },
                then: "$transactions.amount",
                else: 0,
              },
            },
          },
        },
      },
    ];

    const result = await User.aggregate(pipeline);

    if (!result[0]) {
      res
        .status(200)
        .json(responseMessage({ message: "No transactions in this month" }));
      return;
    }

    res.status(200).json(responseMessage({ result: result[0] }));
  } catch (err) {
    res.status(500).json(failure("Analyze transactions failed"));
  }
};

export {
  withdrawMoney,
  depositMoney,
  transferMoney,
  getTransactions,
  analyzeTransactions,
};