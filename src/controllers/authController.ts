import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

import { User } from "../models/User";
import { tokenKey } from "../config";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const emailExist = await User.findOne({ email: email });

    if (emailExist) {
      res.status(400).json({ success: false, message: "Email in use!" });
      return;
    }

    const user = new User({ email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(200).json({ success: true, userEmail: email });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error while creating user account" });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const emailExist = await User.findOne({ email });

    if (!emailExist) {
      res
        .status(404)
        .json({ success: false, message: "Email is not registered" });

      return;
    }

    const auth = await bcrypt.compare(password, emailExist.password);

    if (!auth) {
      res
        .status(401)
        .json({ success: false, message: "Incorrect username or password" });

      return;
    }

    const token = jwt.sign({ email: email }, tokenKey);

    res.status(200).json({ success: true, userToken: token });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error in Login process" });
  }
};

export { register, login };
