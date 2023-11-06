import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { key } from "../../config";

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const emailExist = await User.findOne({ email: email });

  if (emailExist) {
    res.status(400).json({ success: false, message: "Email in use!" });
    return;
  }

  try {
    const user = new User({ email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.balance = 0;

    await user.save();

    res.status(200).json({ success: true, User: email });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error creating user account" });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const emailExist = await User.findOne({ email });

  if (!emailExist) {
    res
      .status(404)
      .json({ success: false, message: "Email is not registered" });
    return;
  }

  try {
    const auth = await bcrypt.compare(password, emailExist.password);
    if (!auth) {
      res
        .status(401)
        .json({ success: false, message: "Incorrect username or password" });
      return;
    }

    const token = jwt.sign({ email: email }, key);
    // console.log(token);
    req.headers["authorization"] = token;

    res.status(200).json({ success: true, User: email });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error in Login process" });
  }
};

export { register, login };
