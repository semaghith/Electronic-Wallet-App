import { Request, Response } from "express";

import { User } from "../models/User";
import { responseMessage, failure } from "../utilities";

async function paginationData(req: Request) {
  //TODO:condition first document & check next and prev limits
  //cursor string?

  const { cursor, limit } = req.query;
  const parsedLimit: number = parseInt(limit as string);

  let current;

  if (req.body.next) {
    current = await User.find({ _id: { $gt: cursor } })
      .sort({ _id: 1 })
      .limit(parsedLimit)
      .select({
        transactions: 0,
        password: 0,
        __v: 0,
      });
  } else {
    current = await User.find({ _id: { $lt: cursor } })
      .sort({ _id: -1 })
      .limit(parsedLimit)
      .select({
        transactions: 0,
        password: 0,
        __v: 0,
      });

    current.reverse();
  }

  const metadata = {
    prev_cursor: current[0]._id,
    next_cursor: current[current.length - 1]._id,
  };

  return { metadata, current };
}

const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { metadata, current } = await paginationData(req);

    // if (!current.length) {
    //   res.status(200).json(
    //     responseMessage({
    //       message: "No users found",
    //     })
    //   );
    //   return;
    // }

    res
      .status(200)
      .json(responseMessage({ users: current, metadata: metadata }));
  } catch (err) {
    //catch error in find:
    // if () {
    //   res.status(404).json(failure("User not found"));
    //   return;
    // }

    res.status(500).json(failure("Get users failed"));
  }
};

const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const user = req.user;

    if (id != user._id) {
      res.status(403).json(failure("Forbidden"));
      return;
    }

    await User.findByIdAndDelete(id);

    res.status(200).json(responseMessage({ user_id: id }));
  } catch (err) {
    res.status(500).json(failure("Delete account failed"));
  }
};

const getBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const user = req.user;

    if (id != user._id) {
      res.status(403).json(failure("Forbidden"));
      return;
    }

    const balance: Number = user.balance;

    res.status(200).json(responseMessage({ user_balance: balance }));
  } catch (err) {
    res.status(500).json(failure("Get balance failed"));
  }
};

const updateBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const user = req.user;
    const { newBalance } = req.body;

    if (id != user._id) {
      res.status(403).json(failure("Forbidden"));
      return;
    }
    await user.updateOne({ balance: newBalance });

    res.status(200).json(responseMessage({ user_balance: newBalance }));
  } catch (err) {
    res.status(500).json(failure("Update balance failed"));
  }
};

export { getUsers, deleteAccount, getBalance, updateBalance };
