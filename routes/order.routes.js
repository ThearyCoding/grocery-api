const OrderController = require("../controllers/order.controller");
const express = require("express");
const router = express.Router();

router.post("/", OrderController.createOrder);
router.get("/:userId", OrderController.getOrderByUser);
module.exports = router;