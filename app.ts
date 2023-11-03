import express from "express";
import mongoose from "mongoose";
import {port, dbURI} from "./config"
import userRoutes from "./src/routes/userRoutes"

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

app.use("/users", userRoutes)