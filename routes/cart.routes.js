const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const auth = require("../middlewares/auth");

// Create or update a cart
router.post("/",auth.authMedddleware, cartController.createCart);

// Remove entire cart for a user
router.delete("/:userId", cartController.removeCart);

// Remove a specific item from the cart
router.delete("/items/:userId/:productId", cartController.removeCartItem);

// Update the quantity of a specific item in the cart
router.patch("/items/:userId/:productId", cartController.updateCartItemQuantity);

// Get cart details
router.get("/",auth.authMedddleware, cartController.getCart);

module.exports = router;
