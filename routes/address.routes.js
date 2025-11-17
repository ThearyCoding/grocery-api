const {
    createAddress,
    getAddresses
} = require("../controllers/address.controller");
const express = require("express");
const { AuthMiddleware } = require("../middlewares/auth");
const router = express.Router();

router.post("/", AuthMiddleware, createAddress);
router.get("/", AuthMiddleware, getAddresses);
module.exports = router;