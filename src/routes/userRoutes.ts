import router from "express";

import {
  getUsers,
  deleteAccount,
  getBalance,
  withdrawMoney,
  depositMoney,
  transferMoney,
} from "../controllers/userContoller";

const userRoutes = router.Router();

userRoutes.get("/", getUsers);
userRoutes.post("/balance", getBalance);
userRoutes.post("/deposit", depositMoney);
userRoutes.post("/withdraw", withdrawMoney);
userRoutes.post("/transfer", transferMoney);
userRoutes.delete("/:email", deleteAccount);

export { userRoutes };
