const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId:   { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    rating:  { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;