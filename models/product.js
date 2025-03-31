const mongoose = require("mongoose");

const exclusiveOfferSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: false,
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    originalPrice: {
      type: Number,
    },
    validUntil: {
      type: Date,
    },
    badgeText: {
      type: String,
      default: "Exclusive Offer",
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
    },
    description: {
      type: String,
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    exclusiveOffer: exclusiveOfferSchema,
  },
  { timestamps: true }
);

productSchema.methods.getCurrentPrice = function () {
  if (
    this.exclusiveOffer.isActive &&
    (!this.exclusiveOffer.validUntil ||
      this.exclusiveOffer.validUntil > new Date())
  ) {
    return this.price * (1 - this.exclusiveOffer.discountPercent / 100);
  }
  return this.price;
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
