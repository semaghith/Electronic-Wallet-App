import { Request, Response } from "express";

import { User } from "../models/User";
import { Transfer, Deposit, Withdraw } from "../models/Transaction";
import { success, failure } from "../utilities";

const withdrawMoney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { withdrawAmount } = req.body;

    const user = req.user;

    if (+withdrawAmount < 0) {
      res
        .status(400)
        .json(failure("message", "Amount must be greater than zero"));
      return;
    }

    let balance: number = user.balance;

    if (balance < withdrawAmount) {
      res.status(400).json(failure("message", "Low balance"));
      return;
    }

    balance -= withdrawAmount;

    const transaction = new Withdraw({
      amount: withdrawAmount,
    });

    await user.updateOne({
      balance: balance,
      $push: { transactions: transaction },
    });

    res.status(200).json(success("withdraw_amount", withdrawAmount));
  } catch (err) {
    res.status(500).json(failure("message", "Withdraw failed"));
  }
};

const depositMoney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { depositAmount } = req.body;
    const user = req.user;

    if (+depositAmount < 0) {
      res
        .status(400)
        .json(failure("message", "Amount must be greater than zero"));
      return;
    }

    const balance: number = user.balance + +depositAmount;

    const transaction = new Deposit({
      amount: depositAmount,
    });

    await user.updateOne({
      balance: balance,
      $push: { transactions: transaction },
    });

    res.status(200).json(success("deposit_amount", depositAmount));
  } catch (err) {
    res.status(500).json(failure("message", "Deposit failed"));
  }
};

const transferMoney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiverID, transferAmount } = req.body;

    const sender = req.user;
    const receiver = await User.findById(receiverID);

    //TODO: change messages
    //sender = receiver?

    if (!receiver) {
      res.status(404).json(failure("message", "Receiver ID not found"));
      return;
    }

    let senderBalance: number = sender.balance;
    let receiverBalance: number = receiver.balance;

    if (+transferAmount < 0) {
      res
        .status(400)
        .json(failure("message", "Amount must be greater than zero"));

      return;
    } else if (+transferAmount > senderBalance) {
      res.status(400).json(failure("message", "Low balance"));

      return;
    }

    senderBalance -= +transferAmount;
    receiverBalance += +transferAmount;

    const transaction = new Transfer({
      senderID: sender._id,
      receiverID: receiverID,
      amount: transferAmount,
    });

    await sender.updateOne({
      balance: senderBalance,
      $push: { transactions: transaction },
    });

    await receiver.updateOne({
      balance: receiverBalance,
      $push: { transactions: transaction },
    });

    res.status(200).json({
      success: true,
      receiver_id: receiverID,
      transfer_amount: transferAmount,
    });
  } catch (err) {
    res.status(500).json(failure("message", "Transfer failed"));
  }
};

const listTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    const page: number = 1,
      limit: number = 3;

    const transaction = user.transactions.slice(
      (page - 1) * limit,
      page * limit
    );

    if (!transaction.length) {
      res.status(200).json(success("message", "No transactions found"));
      return;
    }

    res.status(200).json(success("transactions", transaction));
  } catch (err) {
    res.status(500).json(failure("message", "list transactions failed"));
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

    const pipeline = [
      {
        $match: {
          $and: [
            {
              _id: user._id,
            },
            {
              "transactions.date": {
                $gte: new Date(`${parsedYear}-${parsedMonth}`),
                $lt: new Date(`${nextYear}-${nextMonth}`),
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$transactions",
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
                          $eq: ["$transactions.receiverID", `${user._id}`],
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
                          $eq: ["$transactions.senderID", `${user._id}`],
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
      res.status(200).json(success("message", "No transactions in this month"));
      return;
    }

    res.status(200).json(success("result", result[0]));
  } catch (err) {
    res.status(500).json(failure("message", "Analyze transactions failed"));
  }
};

export {
  withdrawMoney,
  depositMoney,
  transferMoney,
  listTransactions,
  analyzeTransactions,
};
