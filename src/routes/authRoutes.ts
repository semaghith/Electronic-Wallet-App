import { register, login } from "../controllers/authController";

const authRoutes = require("express").Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);

export { authRoutes };