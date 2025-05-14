const {
createAddress
} = require("../controllers/address.controller");
const express = require("express");
const {authMedddleware} = require("../middlewares/auth");
const router = express.Router();

router.post("/",authMedddleware,createAddress);

module.exports = router;