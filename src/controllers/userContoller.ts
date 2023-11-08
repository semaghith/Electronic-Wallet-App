import { Request, Response } from "express";

import { User } from "../models/User";

const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({});

    res.status(200).json({ success: true, users: users });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, Message: "Server Error, can't get users!" });
  }
};

const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.params.email;

    await User.findOneAndDelete({ email: email });

    res.status(200).json({ success: true, userEmail: email });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error while deleting account" });
  }
};

const getBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const email: String = req.body.email;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, message: "Incorrect email" });
      return;
    }

    const balance: Number = user.balance;

    res.status(200).json({ success: true, userBalance: balance });
  } catch (err) {
    res.status(500).json({ success: false, message: "Can't get balance" });
  }
};

const withdrawMoney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, withdrawAmount } = req.body;

    const user = await User.findOne({ email });

    if (+withdrawAmount < 0) {
      res
        .status(400)
        .json({ success: false, message: "Incorrect withdraw amount" });
      return;
    }

    if (!user) {
      res.status(404).json({ success: false, message: "Incorrect email" });
      return;
    }

    let balance: number = await user.balance;

    if (balance < withdrawAmount) {
      res.status(406).json({ success: false, message: "Not enough money" });
      return;
    }

    balance -= withdrawAmount;
    await user.updateOne({ balance: balance });

    res.status(200).json({ success: true, withdrawAmount: withdrawAmount });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to withdraw money" });
  }
};

const depositMoney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, depositAmount } = req.body;

    if (+depositAmount < 0) {
      res
        .status(400)
        .json({ success: false, message: "Incorrect deposit amount" });
      return;
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(404).json({ success: false, message: "Incorrect email" });
      return;
    }

    let balance: number = user.balance + +depositAmount;

    await user.updateOne({ balance: balance });

    res.status(200).json({ success: true, depositAmount: depositAmount });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to deposit money" });
  }
};

const transferMoney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { senderEmail, receiverEmail, transferAmount } = req.body;

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });
    //sender = receiver?

    //TODO: change messages
    if (!sender) {
      res.status(404).json({ success: false, message: "Incorrect email" });
      return;
    }

    if (!receiver) {
      res
        .status(404)
        .json({ success: false, message: "Receiver email not found" });
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
      res.status(406).json({ success: false, message: "Not enough money" });
      return;
    }

    senderBalance -= +transferAmount;
    receiverBalance += +transferAmount;

    await sender.updateOne({ balance: senderBalance });
    await receiver.updateOne({ balance: receiverBalance });

    res.status(200).json({
      success: true,
      transferAmount: transferAmount,
      receiverEmail: receiverEmail,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to transfer money" });
  }
};

export {
  getUsers,
  deleteAccount,
  getBalance,
  withdrawMoney,
  depositMoney,
  transferMoney,
};