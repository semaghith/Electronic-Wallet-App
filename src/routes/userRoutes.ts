import { getUsers } from "../controllers/userContoller";

const userRoutes = require("express").Router();

userRoutes.get("/", getUsers);

export { userRoutes };
