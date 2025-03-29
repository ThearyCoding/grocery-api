const Order = require("../models/order");
const Product = require("../models/product");
const ShippingAddress = require("../models/shipping_address");
exports.createOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddressId, totalAmount } = req.body;

    const shippingAddress = await ShippingAddress.findById(shippingAddressId);
    if (!shippingAddress) {
      return res.status(404).json({ message: "Shipping address not found" });
    }

    let calculatedTotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId}` });
      }
      calculatedTotal += product.price * item.quantity;
    }

    if (calculatedTotal !== totalAmount) {
      return res.status(400).json({ message: "Total amount mismatch" });
    }

    const order = new Order({
      userId,
      items,
      shippingAddressId,
      totalAmount,
    });

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate(
      "items.productId",
      "name price"
    );
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      userId: order.userId,
      items: order.items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      orderStatus: order.orderStatus,
      totalAmount: order.totalAmount,
      shippingAddressId: order.shippingAddressId,
    }));
    res.status(200).json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order" + error.message });
  }
};
