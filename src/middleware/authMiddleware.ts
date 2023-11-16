import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { tokenKey } from "../config";
import { User } from "../models/User";

const verifyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bearerHeader = req.headers["authorization"];

    if (!bearerHeader) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    const [, bearerToken] = bearerHeader.split(" ");

    const userID = (jwt.verify(bearerToken, tokenKey) as { userID: string }).userID;

    req.user = await User.findById(userID);

    if (!req.user) {
      res.status(404).json({ success: false, message: "Account not found" });
      return;
    }

    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Error in authenticating user" });
  }
};

export { verifyAuth };
