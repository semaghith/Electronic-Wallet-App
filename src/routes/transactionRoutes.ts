import router from "express";

import {
  withdrawMoney,
  depositMoney,
  transferMoney,
  getTransactions,
  analyzeTransactions,
} from "../controllers/transactionController";

const transactionRoutes = router.Router();

transactionRoutes.get("/", getTransactions);
transactionRoutes.get("/analyze", analyzeTransactions);
transactionRoutes.post("/deposit", depositMoney);
transactionRoutes.post("/withdraw", withdrawMoney);
transactionRoutes.post("/transfer", transferMoney);

export { transactionRoutes };