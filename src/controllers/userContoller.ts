import { Request, Response } from "express";

import { User } from "../models/User";
import { failure, success } from "../utilities";

async function paginationData(req: Request) {
  //TODO:condition first document & check next and prev limits

  const { cursor, limit } = req.query;
  const parsedLimit : number = parseInt(limit as string);

  const prev = await User.find({ _id: { $lt: cursor } })
      .sort({ _id: -1 })
      .limit(parsedLimit * 2),

    next = await User.find({ _id: { $gt: cursor } })
      .sort({ _id: 1 })
      .limit(parsedLimit);

  prev.reverse();

  return [prev, next];
}

const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const [prev, next] = await paginationData(req);

    const metadata = {
      prev_cursor: prev[0]._id,
      next_cursor: next[next.length - 1]._id,
    };

    console.log(metadata); //TODO:send in response

    res.status(200).json(success("users", next));
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
