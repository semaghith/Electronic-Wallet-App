import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { key } from "../../config";

const verifyAuth = async (
  req: Request,
  res: Response,
  next: any
): Promise<void> => {
  const bearerHeader = req.headers["authorization"];

  if (!bearerHeader) {
    res.status(401).json({ success: false, message: "Not authorized" });
    return;
  }

  const [, bearerToken] = bearerHeader.split(" ");

  try {
    const email = jwt.verify(bearerToken, key);
    // req.body.email = email;
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error in authenticating user" });
  }
  next();
};

export { verifyAuth };
