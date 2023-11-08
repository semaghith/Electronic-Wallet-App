import express from "express";
import mongoose from "mongoose";

import { port, dbURI } from "./config";
import { userRoutes } from "./routes/userRoutes";
import { authRoutes } from "./routes/authRoutes";
import { verifyAuth } from "./middleware/authMiddleware"

const app = express();

mongoose
  .connect(dbURI)
  .then(() => {
    app.listen(Number(port), () => {
      console.log(`listening on port ${port}`);
    });
  })
  .catch(() => {
    console.log("Can't connect to Database");
    process.exit(1);
  });

app.use(express.json());

app.use("/", authRoutes);

app.use(verifyAuth);

app.use("/users", userRoutes);
