const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const auth = require("../middlewares/auth");

// Create or update a cart
router.post("/",auth.AuthMiddleware, cartController.createCart);

// Remove entire cart for a user
router.delete("/:userId", auth.AuthMiddleware, cartController.removeCart);

// Remove a specific item from the cart
router.delete("/items/:productId", auth.AuthMiddleware, cartController.removeCartItem);

// Update the quantity of a specific item in the cart
router.patch("/items/:productId", auth.AuthMiddleware, cartController.updateCartItemQuantity);

// Get cart details
router.get("/",auth.AuthMiddleware, cartController.getCart);

module.exports = router;
