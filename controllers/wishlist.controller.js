const Product = require("../models/product");
const Wishlist = require("../models/wishlist");


// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const {  productId } = req.body;
    const userId = req.user.id;
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [{ productId }] });
    } else {
      const exists = wishlist.items.find(
        (item) => item.productId.toString() === productId
      );
      if (exists) {
        return res
          .status(400)
          .json({ message: "Product already in wishlist." });
      }
      wishlist.items.push({ productId });
    }

    await wishlist.save();
    res.status(201).json({ message: "Product added to wishlist.", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId  = req.user.id;
    const wishlist = await Wishlist.findOne({ userId }).populate(
      "items.productId",
      "name price images unit"
    );

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found." });
    }
    const wishlistResonse = wishlist.items.map(item => ({
      ...item._doc,
      product: item.productId,
      productId: undefined,
    }));



    res.status(200).json({ 
      _id: wishlist._id,
      userId: wishlist.userId,
      items: wishlistResonse
     });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
};

// Remove a product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found." });
    }

    res
      .status(200)
      .json({ message: "Product removed from wishlist.", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId  = req.user.id;
    const wishlist = await Wishlist.findOneAndDelete({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found." });
    }

    res.status(200).json({ message: "Wishlist cleared successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
};

// Check if a product is in the user's wishlist
exports.isInWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne(
      {
        userId,
        "items.productId": productId
      },
      { _id: 1 }
    );

    const isInWishlist = !!wishlist;

    res.status(200).json(isInWishlist);
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
};

