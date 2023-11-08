import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  receiver: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

export { Transaction };
