const Cart = require("../models/cart");
const Product = require("../models/product");

exports.createCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Check if the user already has a cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // If the user doesn't have a cart, create a new one
      cart = new Cart({
        userId,
        items: [{ productId, quantity: 1 }],
      });
    } else {
      // If cart exists, check if the product is already in the cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        // If the item exists, increase the quantity by 1
        existingItem.quantity += 1;
      } else {
        // If the item doesn't exist, add it to the cart
        cart.items.push({ productId, quantity: 1 });
      }
    }

    await cart.save();
    res
      .status(200)
      .json({ message: "Cart created/updated successfully", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOneAndDelete({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    res.status(200).json({ message: "Cart removed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart." });
    }
    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({ message: "Cart item removed.", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const { quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!existingItem) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    existingItem.quantity = quantity;

    await cart.save();

    res.status(200).json({ message: "Cart item quantity updated.", cart });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name price images unit"
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }
    const cartResponse = {
      _id: cart._id,
      userId: cart.userId,
      items: cart.items.map((item) => ({
        _id: item._id,
        quantity: item.quantity,
        addedAt: item.addedAt,
        product: item.productId,
      })),
    };
    res.status(200).json(cartResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
