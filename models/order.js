const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      subtotal: { 
        type: Number,
        required: true,
      },
    },
  ],
  // paymentId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Payment",
  // },
  promoCode: {
    type: String, 
    default: ""
  },
  discount: {
    type: Number,
    default: 0,
  },
  orderStatus: {
    type: String,
    enum: ["Pending","Accepted","Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  addressId: {
    type: mongoose.Types.ObjectId,
    ref: "Address",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
