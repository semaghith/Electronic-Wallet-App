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
    const id = req.params.id;
    const user = req.user;

    if (id != user._id) {
      res.status(403).json({ success: false, message: "" });
      return;
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ success: true, userID: id });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error while deleting account" });
  }
};

const getBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const user = req.user;

    if (id != user._id) {
      res.status(403).json({ success: false, message: "" });
      return;
    }

    const balance: Number = user.balance;

    res.status(200).json({ success: true, userBalance: balance });
  } catch (err) {
    res.status(500).json({ success: false, message: "Can't get balance" });
  }
};

const updateBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const { amount } = req.body;
    const user = req.user;

    if (id != user._id) {
      res.status(403).json({ success: false, message: "" });
      return;
    }

    const balance: Number = user.balance + +amount;
    user.updateOne({balance: balance});

    res.status(200).json({ success: true, userBalance: balance });
  } catch (err) {
    res.status(500).json({ success: false, message: "Can't update balance" });
  }
};

export { getUsers, deleteAccount, getBalance , updateBalance};