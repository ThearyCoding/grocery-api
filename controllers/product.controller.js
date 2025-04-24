const Product = require("../models/product");

exports.getProducts = async (req, res) => {
  try {
    const getCurrentPrice = (product) => {
      if (
        product.exclusiveOffer?.isActive &&
        (!product.exclusiveOffer.validUntil ||
          new Date(product.exclusiveOffer.validUntil) > new Date())
      ) {
        return (
          product.price * (1 - product.exclusiveOffer.discountPercent / 100)
        );
      }
      return product.price;
    };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category, brand, minPrice, maxPrice, search, sort, autocomplete } =
      req.query;

    let filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (autocomplete == "true") {
      const suggestions = await Product.find(
        filter,
        "_id name price unit images exclusiveOffer"
      )
        .sort({ name: 1 })
        .limit(10)
        .lean();
      const responseSuggestions = suggestions.map((product) => {
        const currentPrice = getCurrentPrice(product);
        const isOfferActive = product.exclusiveOffer?.isActive;
        const isOfferValid =
          !product.exclusiveOffer?.validUntil ||
          new Date(product.exclusiveOffer.validUntil) > new Date();
        return {
          _id: product._id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          images: product.images,
          exclusiveOffer: product.exclusiveOffer,
          currentPrice: currentPrice,
          hasActiveOffer: isOfferActive && isOfferValid
        }

      });

      return res.status(200).json({
        success: true,
        suggestions: responseSuggestions,
      });
    }

    let sortOption = {};
    switch (sort) {
      case "price_asc":
        sortOption.price = 1;
        break;
      case "price_desc":
        sortOption.price = -1;
        break;
      case "newest":
        sortOption.createdAt = -1;
        break;
      case "best_selling":
        sortOption.sold = -1;
        break;
      case "top_rated":
        sortOption.rating = -1;
        break;
      case "exclusive":
        sortOption["exclusiveOffer.discountPercent"] = -1;
        filter["exclusiveOffer.isActive"] = true;
        break;
      default:
        sortOption.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("brand", "name")
      .skip(skip)
      .sort(sortOption)
      .limit(limit)
      .lean();

    const enhancedProducts = products.map((product) => {
      const currentPrice = getCurrentPrice(product);
      const isOfferActive = product.exclusiveOffer?.isActive;
      const isOfferValid =
        !product.exclusiveOffer?.validUntil ||
        new Date(product.exclusiveOffer.validUntil) > new Date();

      return {
        ...product,
        currentPrice,
        hasActiveOffer: isOfferActive && isOfferValid,
      };
    });

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      products: enhancedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      brand,
      description,
      stock,
      unit,
      sku,
      images,
      exclusiveOffer,
    } = req.body;

    if (!name || !price || !unit || !sku) {
      return res.status(400).json({
        success: false,
        message: "Name, price, unit, and SKU are required fields",
      });
    }

    const productData = {
      name,
      price,
      category,
      brand,
      description,
      stock: stock || 0,
      unit,
      sku,
      images: images || [],
    };

    if (exclusiveOffer && typeof exclusiveOffer === "object") {
      productData.exclusiveOffer = {
        isActive: exclusiveOffer.isActive ?? false,
        discountPercent: exclusiveOffer.discountPercent ?? 0,
        validUntil: exclusiveOffer.validUntil ?? null,
        badgeText: exclusiveOffer.badgeText ?? "Exclusive Offer",
        originalPrice: price,
      };

      if (
        exclusiveOffer.discountPercent < 0 ||
        exclusiveOffer.discountPercent > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Discount percentage must be between 0 and 100",
        });
      }
    } else {
      productData.exclusiveOffer = { isActive: false, discountPercent: 0 };
    }

    const product = new Product(productData);
    await product.save();

    const productResponse = product.toObject();
    productResponse.currentPrice = product.getCurrentPrice();
    productResponse.hasActiveOffer =
      product.exclusiveOffer?.isActive &&
      (!product.exclusiveOffer.validUntil ||
        product.exclusiveOffer.validUntil > new Date());

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: productResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId)
      .populate("category", "name")
      .populate("brand", "name")
      .lean();

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const getCurrentPrice = (product) => {
      if (
        product.exclusiveOffer?.isActive &&
        (!product.exclusiveOffer.validUntil ||
          new Date(product.exclusiveOffer.validUntil) > new Date())
      ) {
        return (
          product.price * (1 - product.exclusiveOffer.discountPercent / 100)
        );
      }
      return product.price;
    };

    const currentPrice = getCurrentPrice(product);
    const isOfferActive = product.exclusiveOffer?.isActive;
    const isOfferValid =
      !product.exclusiveOffer?.validUntil ||
      new Date(product.exclusiveOffer.validUntil) > new Date();

    const enhancedProduct = {
      ...product,
      currentPrice,
      hasActiveOffer: isOfferActive && isOfferValid,
    };

    res.status(200).json({
      product: enhancedProduct,
    });
  } catch (error) {
    console.error("Error fetching single product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching single product",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
