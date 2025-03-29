const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");

// Add product to wishlist
router.post("/", wishlistController.addToWishlist);

// Get wishlist by user ID
router.get("/:userId", wishlistController.getWishlist);

// Remove a specific product from wishlist
router.delete("/:userId/:productId", wishlistController.removeFromWishlist);

// Clear entire wishlist
router.delete("/:userId", wishlistController.clearWishlist);

module.exports = router;