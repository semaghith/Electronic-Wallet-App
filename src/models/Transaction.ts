import mongoose from "mongoose";

const baseOptions = {
  discriminatorKey: "category",
};

const TransactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  baseOptions
);

const Transaction = mongoose.model("Transaction", TransactionSchema);

const Transfer = Transaction.discriminator(
  "Transfer",
  new mongoose.Schema({
    senderID: { type: String, required: true },
    receiverID: { type: String, required: true },
  })
);

const Deposit = Transaction.discriminator("Deposit", new mongoose.Schema({}));

const Withdraw = Transaction.discriminator("Withdraw", new mongoose.Schema({}));

export { Transfer, Deposit, Withdraw };