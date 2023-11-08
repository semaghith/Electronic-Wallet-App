import router from "express";

import {
  getUsers,
  deleteAccount,
  getBalance,
  withdrawMoney,
  depositMoney,
  transferMoney,
  listTransactions,
} from "../controllers/userContoller";

const userRoutes = router.Router();

userRoutes.get("/", getUsers);
userRoutes.post("/balance", getBalance);
userRoutes.post("/deposit", depositMoney);
userRoutes.post("/withdraw", withdrawMoney);
userRoutes.post("/transfer", transferMoney);
userRoutes.post("/transactions", listTransactions);
userRoutes.delete("/:email", deleteAccount);

export { userRoutes };
