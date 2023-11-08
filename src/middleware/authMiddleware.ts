import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { tokenKey } from "../config";

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

    jwt.verify(bearerToken, tokenKey);

    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Error in authenticating user" });
  }
};

export { verifyAuth };
