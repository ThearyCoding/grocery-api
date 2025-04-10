const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const auth = require("../middlewares/auth");
// Add product to wishlist
router.post("/",auth.authMedddleware, wishlistController.addToWishlist);

// Get wishlist by user ID
router.get("/", auth.authMedddleware, wishlistController.getWishlist);

// Remove a specific product from wishlist
router.delete("/:productId",auth.authMedddleware, wishlistController.removeFromWishlist);

// Clear entire wishlist
router.delete("/",auth.authMedddleware, wishlistController.clearWishlist);

// Check if a specific product is in the user's wishlist
router.get("/is-in-wishlist/:productId", auth.authMedddleware, wishlistController.isInWishlist);

module.exports = router;