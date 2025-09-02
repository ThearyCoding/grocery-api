const {
createAddress,
getAddresses
} = require("../controllers/address.controller");
const express = require("express");
const {authMedddleware} = require("../middlewares/auth");
const router = express.Router();

router.post("/",authMedddleware,createAddress);
router.get("/",authMedddleware,getAddresses);
module.exports = router;