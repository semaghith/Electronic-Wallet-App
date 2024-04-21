import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const envExist = (envVariable: string): string => {
  if (!process.env[envVariable]) {
    throw new Error("Environment variable: " + envVariable + " does not exist");
  }

  return process.env[envVariable] as string;
};

const port: string = envExist("PORT");
const dbURI: string = envExist("DBCONNECTION");
const tokenKey: string = envExist("TOKENKEY");
const conn = mongoose.connection;


export { port, dbURI, tokenKey, conn};