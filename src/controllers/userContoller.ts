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

export {
  getUsers,
  deleteAccount,
  getBalance,
};