const OrderController = require("../controllers/order.controller");
const express = require("express");
const { AuthMiddleware } = require("../middlewares/auth");
const router = express.Router();

router.post("/checkout",AuthMiddleware, OrderController.createOrder);
router.get("/my-orders",AuthMiddleware, OrderController.getMyOrders);
router.get("/my-orders/:orderId",AuthMiddleware, OrderController.getMyOrderDetails);
router.post("/admin/status", OrderController.updateOrderStatus);
module.exports = router;