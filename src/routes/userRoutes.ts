import router from "express";

import {
  getUsers,
  deleteAccount,
  getBalance,
  updateBalance,
} from "../controllers/userContoller";

const userRoutes = router.Router();

userRoutes.get("/", getUsers);
userRoutes.get("/:id/balance", getBalance);
userRoutes.post("/:id/balance", updateBalance);
userRoutes.delete("/:id", deleteAccount);

export { userRoutes };