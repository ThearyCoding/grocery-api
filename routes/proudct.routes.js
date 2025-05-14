const exprees = require("express");
const Product = require("../models/product");
const productController = require("../controllers/product.controller");
const router = exprees.Router();

router.get("/",productController.getProducts);
router.post("/", productController.createProduct);
router.get("/:id", productController.getSingleProduct);
router.put("/:id",productController.updateProduct);
router.delete("/:id",productController.deleteProduct);
//router.get("/recommendation/:productId",productController.getRecommendedProducts);
module.exports = router;
