import { Request, Response } from "express";
import { User } from "../models/User";

const getUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await User.find({});

  try {
    res.status(200).json({ success: true, Users: users });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, Message: "Server Error, can't get users!" });
  }
};

export { getUsers };