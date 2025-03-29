const ShippingController = require("../controllers/shipping_address.controller");
const express = require("express");
const router = express.Router();

router.post("/", ShippingController.createShippingAddress);
module.exports = router;