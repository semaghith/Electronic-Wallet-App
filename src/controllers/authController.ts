import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import { Request, Response } from "express";

import { User } from "../models/User";
import { tokenKey } from "../config";
import { failure, success } from "../utilities";

async function validateEmail(email: string) {
  try {
    const emailSchema = z.string().email();
    emailSchema.parse(email);

    return true;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return false;
    }
  }
}

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const validEmail = await validateEmail(email);

    if (!validEmail) {
      res.status(400).json(failure("message", "Invaild email"));
      return;
    }

    const emailExist = await User.findOne({ email: email });

    if (emailExist) {
      res.status(400).json(failure("message", "Email exist"));
      return;
    }

    const user = new User({ email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(200).json(success("user_id", user._id));
  } catch (err) {
    res.status(500).json(failure("message", "Register failed"));
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const validEmail = await validateEmail(email);

    if (!validEmail) {
      res.status(400).json(failure("message", "Invaild email"));
      return;
    }

    const emailExist = await User.findOne({ email });

    if (!emailExist) {
      res.status(404).json(failure("message", "Email not found"));
      return;
    }

    const auth = await bcrypt.compare(password, emailExist.password);

    if (!auth) {
      res
        .status(401)
        .json(failure("message", "Incorrect username or password"));
      return;
    }

    //TODO: change exp time
    const expirationTime = "1h";
    const token = jwt.sign({ userID: emailExist._id }, tokenKey, {
      expiresIn: expirationTime,
    });

    res.status(200).json(success("user_token", token));
  } catch (err) {
    res.status(500).json(failure("message", "Login failed"));
  }
};

export { register, login };