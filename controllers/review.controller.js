const Order = require("../models/order");
const Product = require("../models/product");
const Review = require("../models/review");


exports.createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId, productId, rating, comment } = req.body;

        if (!orderId) return res.status(400).json({ status: false, message: "orderId is required." });
        if (!productId) return res.status(400).json({ status: false, message: "productId is required." });
        if (!rating) return res.status(400).json({ status: false, message: "rating is required." });

        const order = await Order.findOne({ _id: orderId, userId });

        if (!order) {
            return res.status(404).json({ status: false, message: "Order Not Found." });
        }
        const orderStatus = order.orderStatus.toLowerCase();

        if (orderStatus !== "delivered") {
            return res.status(400).json({ status: false, message: "You can review this order only delivered" });
        }

        const item = order.items.find((it) => String(it.productId) === String(productId));

        if (item.reviewed == true) {
            return res.status(400).json({ status: false, message: "You already reviewed this product." });
        }

        const review = await Review.findOne({ orderId, productId, userId });

        if (review) {
            return res.status(400).json({ status: false, message: "You already reviewed this product." });
        }

        const product = await Product.findById(productId).select("rating ratingCount");

        if (!product) {
            return res.status(404).json({ status: false, message: "Product Not Found." });
        }


        const oldCount = Number(product.ratingCount || 0);
        const oldRating = Number(product.rating || 0);

        const newCount = oldCount + 1;

        const newAvg = Math.round(((oldCount * oldRating + Number(rating) / newCount) * 10)) / 10;


        await Product.updateOne({ _id: productId }, {

            $set: {
                rating: newAvg,
                ratingCount: newCount,
            }

        });

        await Order.updateOne({_id: orderId,userId, "items.productId": productId},{
            $set: {
               
                "items.$.reviewed": true,
            }
        });

        await Review.create({
            userId,
            orderId,
            productId,
            rating,
            comment,
        });

        return res.status(201).json({ status: true, message: "Review submitted successfully." });

    } catch (e) {
        return res.status(500).json({ status: false, message: "Server error: " + e.message });
    }
}