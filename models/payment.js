const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["ABA","KHQR","ACLEDA", "Cash on hand"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },
  transactionId: { type: String },
  amountPaid: { type: Number, required: true },
  paidAt: { type: Date },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
