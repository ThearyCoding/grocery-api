const Order = require("../models/order");
const Product = require("../models/product");
const Address = require("../models/address");
const PromoCode = require("../models/promoCode");
const Cart = require("../models/cart");
const { sendToToken } = require("../services/fcm.service");
exports.createOrder = async (req, res) => {
  try {
    const { items, paymentId, promoCode, totalAmount, addressId } = req.body;
    const userId = req.user.id;

    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length != items.length) {
      return res.status(400).json({ success: false, message: "One or more products are invalid" });
    }
    let calculatedTotal = 0;
    const validatedItems = items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) {
        throw new Error("Product not found: " + item.productId);
      }
      const price = product.price;
      const subtotal = price * item.quantity;
      calculatedTotal += subtotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        subtotal
      };
    });
    let discount = 0;

    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode, isActive: true });
      if (!promo) {
        return res.status(400).json({ success: false, message: "Invalid promo code" });
      }

      if (promo.expiryDate < new Date()) {
        return res.status(400).json({ success: false, message: "Promo code has expired" });
      }
      if (promo.usedCount >= promo.usageLimit) {
        return res.status(400).json({ success: false, message: "Promo code usage limit reached" });
      }
      if (promo.discountType == "percentage") {
        discount = (promo.discountValue / 100) * calculatedTotal;
      } else if (promo.discountType == "fixed") {
        discount = promo.discountValue;
      }
      promo.usedCount += 1;
      promo.usedBy.push(userId);
      await promo.save();
    }

    const shipping = 0;
    const estimatedTaxes = 0;
    const otherFee = 3.0;

    const finalTotal = calculatedTotal - discount + shipping + estimatedTaxes + otherFee;
    console.log("Final Total:", finalTotal, "Provided TotalAmount:", totalAmount, "Discount:", discount);
    if (Math.abs(finalTotal - totalAmount) > 0.01) {
      return res.status(400).json({ success: false, message: "Total amount mismatch" });
    }

    const order = new Order({
      userId,
      items: validatedItems,
      // paymentId,
      promoCode: promoCode || null,
      discount,
      orderStatus: "Pending",
      totalAmount: finalTotal,
      addressId
    });
    await order.save();

    await Cart.deleteMany({ userId });
    res.status(201).json({ success: true, message: "Order created successfully", orderId: order._id });

  } catch (e) {
    res.status(500).json({ success: false, message: "Error creating order" + e.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: no user" });
    }
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate("items.productId", "name price images unit")
      .lean();
    if (!orders.length) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }

    const data = orders.map((o) => {

      const items = o.items.map((it) => {
        return {
          id: it.productId ? it.productId._id : null,
          name: it.productId ? it.productId.name : "Product not found",
          image: it.productId && it.productId.images && it.productId.images.length > 0 ? it.productId.images[0] : "",
          unit: it.productId ? it.productId.unit : "",
          quantity: Number(it.quantity || 0),
          price: Number(it.price || 0),
        };
      });

      return {
        id: o._id,
        userId: o.userId,
        orderStatus: o.orderStatus,
        totalAmount: Number(o.totalAmount || 0),
        createdAt: o.createdAt,
        items
      };
    })

    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error fetching order: " + error.message });
  }
};


exports.getMyOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    const order = await Order.findOne({ _id: orderId, userId }).populate([
      {
        path: "items.productId",
        model: "Product",
        select: "name images unit"
      },
      {
        path: "addressId",
        model: "Address",
        select: "detail address userId",
        match: { userId }
      }
    ]);

    const address = order.addressId ? order.addressId.detail + ", " + order.addressId.address : "Address not found";
    const data = order.items.map((it) => {
      const p = it.productId || {};

      return {
        id: p._id,
        name: p.name,
        image: p.images && p.images.length > 0 ? p.images[0] : "",
        unit: p.unit,
        quantity: it.quantity,
        price: it.price,
        subtotal: it.subtotal
      }
    })
    res.status(200).json({
      success: true, data: {
        
        id: order._id,
        createdAt: order.createdAt,
        discount: order.discount,
        promoCode: order.promoCode != null ? order.promoCode : "",
        tax: 0,
        otherFee: 3.0,
        address,
        subtotal: data.reduce((acc, item) => acc + item.subtotal, 0),
        items: data, orderStatus: order.orderStatus, totalAmount: order.totalAmount,

      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: "Error get order details" + e.message });
  }
}

exports.updateOrderStatus = async (req,res)=> {
  try{
    const {id,orderStatus,token,title,body,route_name} = req.body;

    const order = await Order.updateOne({_id: id},{orderStatus});
await sendToToken({token,title,body,route_name,id});
    res.status(200).json({message: "Order updated succssfully."});

  }catch(e){
    res.status(500).json({message: "Error Update order status: " + e.message});
  }
}