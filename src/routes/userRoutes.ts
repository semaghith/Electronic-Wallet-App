import router from "express";

import {
  getUsers,
  deleteAccount,
  getBalance,
} from "../controllers/userContoller";

const userRoutes = router.Router();

userRoutes.get("/", getUsers);
userRoutes.post("/balance", getBalance);
userRoutes.delete("/:email", deleteAccount);

export { userRoutes };
