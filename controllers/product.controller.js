const Product = require("../models/product");

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const {category,brand,minPrice,maxPrice,search,sort} = req.query;

    let filter = {};
    if(category) filter.category = category;
    if(brand) filter.brand = brand;
    if(minPrice || maxPrice){
      filter.price = {};
      if(minPrice) filter.price.$gte = parseFloat(minPrice);
      if(maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if(search){
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    let sortOption = {};

    if(sort === "price_asc") sortOption.price = 1;
    else if(sort === "price_desc")  sortOption.price = -1;
    else if(sort === "newest") sortOption.createdAt = -1;
    else if(sort === "best_selling") sortOption.sold = -1;
    else if(sort === "top_rated") sortOption.rating = -1;

    
    const skip = (page - 1) * limit;
    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("brand", "name")
      .skip(skip)
      .sort(sortOption)
      .limit(limit);
    const totalProducts = await Product.countDocuments();
    res.status(200).json({
      page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Erorr: " + error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: "Product saved successfully", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong saving the product" });
  }
};
