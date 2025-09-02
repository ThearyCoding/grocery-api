const OrderController = require("../controllers/order.controller");
const express = require("express");
const { authMedddleware } = require("../middlewares/auth");
const router = express.Router();

router.post("/checkout",authMedddleware, OrderController.createOrder);
router.get("/my-orders",authMedddleware, OrderController.getMyOrders);
router.get("/my-orders/:orderId",authMedddleware, OrderController.getMyOrderDetails);
module.exports = router;