import { Request, Response } from "express";

import { User } from "../models/User";
import { failure, success } from "../utilities";

const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({});

    res.status(200).json(success("users", users));
  } catch (err) {
    res.status(500).json(failure("message", "Get users failed"));
  }
};

const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const user = req.user;

    if (id != user._id) {
      res.status(403).json(failure("message", "Forbidden"));
      return;
    }

    await User.findByIdAndDelete(id);

    res.status(200).json(success("user_id", id));
  } catch (err) {
    res.status(500).json(failure("message", "Delete account failed"));
  }
};

const getBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const user = req.user;

    if (id != user._id) {
      res.status(403).json(failure("message", "Forbidden"));
      return;
    }

    const balance: Number = user.balance;

    res.status(200).json(success("user_balance", balance));
  } catch (err) {
    res.status(500).json(failure("message", "Get balance failed"));
  }
};

const updateBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const user = req.user;
    const { amount } = req.body;

    if (id != user._id) {
      res.status(403).json(failure("message", "Forbidden"));
      return;
    }

    const balance: Number = user.balance + +amount;
    user.updateOne({ balance: balance });

    res.status(200).json(success("user_balance", balance));
  } catch (err) {
    res.status(500).json(failure("message", "Update balance failed"));
  }
};

export { getUsers, deleteAccount, getBalance, updateBalance };