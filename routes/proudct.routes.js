const exprees = require("express");
const Product = require("../models/product");
const productController = require("../controllers/product.controller");
const router = exprees.Router();

router.get("/",productController.getProducts);
router.post("/", productController.createProduct);

module.exports = router;
