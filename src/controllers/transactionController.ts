import { Request, Response } from "express";

import { User } from "../models/User";
import { Transfer, Deposit, Withdraw } from "../models/Transaction";

const withdrawMoney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { withdrawAmount } = req.body;

    const user = req.user;

    if (+withdrawAmount < 0) {
      res
        .status(400)
        .json({ success: false, message: "Incorrect withdraw amount" });
      return;
    }

    let balance: number = user.balance;

    if (balance < withdrawAmount) {
      res.status(400).json({ success: false, message: "Not enough money" });
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

    res.status(200).json({ success: true, withdrawAmount: withdrawAmount });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to withdraw money" });
  }
};

const depositMoney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { depositAmount } = req.body;
    const user = req.user;

    if (+depositAmount < 0) {
      res
        .status(400)
        .json({ success: false, message: "Incorrect deposit amount" });
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

    res.status(200).json({ success: true, depositAmount: depositAmount });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to deposit money" });
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
      res
        .status(404)
        .json({ success: false, message: "Receiver ID not found" });
      return;
    }

    let senderBalance: number = sender.balance;
    let receiverBalance: number = receiver.balance;

    if (+transferAmount < 0) {
      res
        .status(400)
        .json({ success: false, message: "Incorrect transfer amount" });

      return;
    } else if (+transferAmount > senderBalance) {
      res.status(400).json({ success: false, message: "Not enough money" });

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
      receiverID: receiverID,
      transferAmount: transferAmount,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to transfer money" });
  }
};

const listTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    const transaction = user.transactions;

    if (!transaction.length) {
      res.status(200).json({ success: true, message: "No transactions found" });
      return;
    }

    res.status(200).json({ success: true, transactions: transaction });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to list transactions" });
  }
};

export { withdrawMoney, depositMoney, transferMoney, listTransactions };
