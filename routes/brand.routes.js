const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brand.controller");

// Get all brands
router.get("/", brandController.getAllBrands);

// Create a new brand
router.post("/", brandController.createBrand);

// Delete a brand
router.delete("/:id", brandController.deleteBrand);

// Update a brand
router.put("/:id", brandController.updateBrand);

module.exports = router;
