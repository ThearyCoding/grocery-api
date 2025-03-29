const Brand = require("../models/brand");

// Get all brands
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new brand
exports.createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    const brandExisting = await Brand.findOne({ name });
    if (brandExisting) {
      return res.status(400).json({ message: "Brand already exists." });
    }

    const newBrand = new Brand(req.body);
    const brand = await newBrand.save();
    res.status(201).json({ message: "Brand saved successfully.", brand: brand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a brand
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brandExisting = await Brand.findByIdAndDelete(id);

    if (!brandExisting) {
      return res.status(400).json({ message: "Brand does not exist." });
    }

    res.status(200).json({ message: "Brand deleted successfully.", brand: brandExisting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a brand
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brandExisting = await Brand.findByIdAndUpdate(id, req.body, { new: true });
    if (!brandExisting) {
      return res.status(400).json({ message: "Brand does not exist." });
    }

    res.status(200).json({ message: "Brand updated successfully.", brand: brandExisting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
