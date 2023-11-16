import router from "express";

import {
  withdrawMoney,
  depositMoney,
  transferMoney,
  listTransactions,
} from "../controllers/transactionController";

const transactionRoutes = router.Router();

transactionRoutes.get("/", listTransactions);
transactionRoutes.post("/deposit", depositMoney);
transactionRoutes.post("/withdraw", withdrawMoney);
transactionRoutes.post("/transfer", transferMoney);

export { transactionRoutes };
