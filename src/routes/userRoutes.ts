import {getUsers} from "../controllers/userContoller"

const Router = require("express").Router;
const userRoutes = Router();

userRoutes.get("/", getUsers);

export default userRoutes;