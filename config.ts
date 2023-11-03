import dotenv from "dotenv";
dotenv.config();

const envExist = (envVariable: string) : string => {
  if (!process.env[envVariable]) {
    throw new Error("Environment variable" + envVariable + " does not exist");
  }

  return process.env[envVariable] as string;
}

export const port : string = envExist("PORT");
export const dbURI : string = envExist("DBCONNECTION");