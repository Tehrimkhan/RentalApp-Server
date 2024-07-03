import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  totalamount: { type: Number, required: true },
  percentage: { type: Number, required: true },
  currency: { type: String, required: true },
  productName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PaymentTransactionModel = mongoose.model(
  "PaymentTransaction",
  paymentTransactionSchema
);

export default PaymentTransactionModel;
