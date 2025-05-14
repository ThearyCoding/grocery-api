const Product = require("../models/product");
// const { OpenAI } = require('openai');


// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   baseURL: "https://models.inference.ai.azure.com"
// });
// const { TfIdf, PorterStemmer } = require('natural');
// const mongoose = require("mongoose");
// const stopwords = require('natural').stopwords;

// // Helper functions
// function calculateCurrentPrice(product) {
//   return product.exclusiveOffer?.isActive && 
//     (!product.exclusiveOffer.validUntil || new Date(product.exclusiveOffer.validUntil) > new Date())
//     ? product.price * (1 - product.exclusiveOffer.discountPercent / 100)
//     : product.price;
// }

// function hasActiveOffer(product) {
//   return product.exclusiveOffer?.isActive && 
//     (!product.exclusiveOffer.validUntil || new Date(product.exclusiveOffer.validUntil) > new Date());
// }

// // Enhanced text processing
// function processText(text) {
//   if (!text) return '';
//   return text.toLowerCase()
//     .replace(/[^\w\s]/g, '') // Remove punctuation
//     .split(/\s+/)
//     .filter(token => token.length > 2 && !stopwords.includes(token))
//     .map(token => PorterStemmer.stem(token))
//     .join(' ');
// }

// exports.getRecommendedProducts = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const limit = parseInt(req.query.limit) || 5;
//     const startTime = Date.now();

//     // 1. Get the target product
//     const targetProduct = await Product.findById(productId)
//       .select('name category brand price exclusiveOffer description images')
//       .populate('category', 'name')
//       .populate('brand', 'name')
//       .lean();

//     if (!targetProduct) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found',
//       });
//     }

//     // 2. Get candidate products - start with same category
//     const candidateFilter = {
//       _id: { $ne: productId },
//       category: targetProduct.category._id,
//       price: {
//         $gte: targetProduct.price * 0.5,
//         $lte: targetProduct.price * 1.5
//       }
//     };

//     let candidates = await Product.find(candidateFilter)
//       .select('name category brand price exclusiveOffer description images')
//       .populate('category', 'name')
//       .populate('brand', 'name')
//       .limit(50)
//       .lean();

//     // 3. If not enough same-category candidates, supplement with others
//     if (candidates.length < 15) {
//       const additionalCandidates = await Product.find({
//         _id: { $ne: productId, $nin: candidates.map(c => c._id) },
//         price: {
//           $gte: targetProduct.price * 0.3,
//           $lte: targetProduct.price * 1.7
//         }
//       })
//       .select('name category brand price exclusiveOffer description images')
//       .populate('category', 'name')
//       .populate('brand', 'name')
//       .limit(30 - candidates.length) // Fill up to 30 total
//       .lean();

//       candidates.push(...additionalCandidates);
//     }

//     // 4. Prepare documents for enhanced TF-IDF with field weighting
//     const tfidf = new TfIdf();
//     const documents = [];
    
//     // Process target product with field weights
//     const targetFields = {
//       name: targetProduct.name || '',
//       category: targetProduct.category?.name || '',
//       brand: targetProduct.brand?.name || '',
//       description: targetProduct.description || ''
//     };
    
//     const targetText = [
//       ...Array(3).fill(targetFields.name), // 3x weight for name
//       ...Array(2).fill(targetFields.category), // 2x weight for category
//       targetFields.brand,
//       targetFields.description
//     ].join(' ');
    
//     const processedTarget = processText(targetText);
//     tfidf.addDocument(processedTarget);
//     documents.push({ 
//       id: targetProduct._id.toString(), 
//       isTarget: true,
//       price: targetProduct.price,
//       categoryId: targetProduct.category._id.toString()
//     });

//     // Process candidates
//     candidates.forEach(product => {
//       const candidateFields = {
//         name: product.name || '',
//         category: product.category?.name || '',
//         brand: product.brand?.name || '',
//         description: product.description || ''
//       };
      
//       const candidateText = [
//         ...Array(3).fill(candidateFields.name),
//         ...Array(2).fill(candidateFields.category),
//         candidateFields.brand,
//         candidateFields.description
//       ].join(' ');
      
//       const processedCandidate = processText(candidateText);
//       tfidf.addDocument(processedCandidate);
//       documents.push({ 
//         id: product._id.toString(), 
//         text: processedCandidate,
//         price: product.price,
//         categoryId: product.category._id.toString(),
//         productData: product // Store for later use
//       });
//     });

//     // 5. Calculate cosine similarities with price and category factors
//     const similarities = [];
//     const targetVector = {};
//     const targetPrice = targetProduct.price;
//     const targetCategoryId = targetProduct.category._id.toString();
    
//     // Get TF-IDF vector for target
//     tfidf.tfidfs(processedTarget, (index, measure) => {
//       targetVector[index] = measure;
//     });

//     // Compare with candidates
//     documents.filter(doc => !doc.isTarget).forEach(doc => {
//       // Text similarity (cosine)
//       let dotProduct = 0;
//       let candidateMagnitude = 0;
//       const candidateVector = {};
      
//       tfidf.tfidfs(doc.text, (index, measure) => {
//         candidateVector[index] = measure;
//         if (targetVector[index]) {
//           dotProduct += targetVector[index] * measure;
//         }
//         candidateMagnitude += measure * measure;
//       });

//       const targetMagnitude = Object.values(targetVector)
//         .reduce((sum, val) => sum + val * val, 0);
      
//       const textSimilarity = dotProduct / 
//         (Math.sqrt(targetMagnitude) * Math.sqrt(candidateMagnitude)) || 0;

//       // Price similarity (0-1 scale)
//       const priceDiff = Math.abs(doc.price - targetPrice);
//       const maxPriceDiff = targetPrice * 0.5; // Max we consider relevant
//       const priceSimilarity = Math.max(0, 1 - (priceDiff / maxPriceDiff));

//       // Category bonus
//       const categoryBonus = doc.categoryId === targetCategoryId ? 0.2 : 0;

//       // Combined score (60% text, 30% price, 10% category)
//       const combinedSimilarity = 
//         (0.6 * textSimilarity) + 
//         (0.3 * priceSimilarity) + 
//         (0.1 * categoryBonus);

//       similarities.push({
//         id: doc.id,
//         similarity: combinedSimilarity,
//         productData: doc.productData
//       });
//     });

//     // 6. Sort by combined similarity and get top recommendations
//     const recommendedProducts = similarities
//       .sort((a, b) => b.similarity - a.similarity)
//       .slice(0, limit)
//       .map(item => ({
//         ...item.productData,
//         currentPrice: calculateCurrentPrice(item.productData),
//         hasActiveOffer: hasActiveOffer(item.productData),
//         similarityScore: item.similarity // Include for debugging
//       }));

//     // 7. Prepare response
//     const response = {
//       success: true,
//       originalProduct: {
//         ...targetProduct,
//         currentPrice: calculateCurrentPrice(targetProduct),
//         hasActiveOffer: hasActiveOffer(targetProduct)
//       },
//       recommendedProducts,
//       processingTime: Date.now() - startTime
//     };

//     if (process.env.NODE_ENV === 'production') {
//       response.recommendedProducts.forEach(p => delete p.similarityScore);
//     }

//     res.status(200).json(response);

//   } catch (error) {
//     console.error('Error getting recommendations:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error getting recommendations',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };
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

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      price,
      categoryId,
      brand,
      description,
      stock,
      unit,
      sku,
      images,
      exclusiveOffer,
    } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Basic validation
    if (!name || !price || !unit || !sku) {
      return res.status(400).json({
        success: false,
        message: "Name, price, unit, and SKU are required fields",
      });
    }

    // Update base fields
    product.name = name;
    product.price = price;
    product.category = categoryId;
    product.brand = brand;
    product.description = description;
    product.stock = stock ?? 0;
    product.unit = unit;
    product.sku = sku;
    product.images = images || [];

    // Update exclusive offer logic
    if (exclusiveOffer && typeof exclusiveOffer === "object") {
      if (
        exclusiveOffer.discountPercent < 0 ||
        exclusiveOffer.discountPercent > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Discount percentage must be between 0 and 100",
        });
      }

      product.exclusiveOffer = {
        isActive: exclusiveOffer.isActive ?? false,
        discountPercent: exclusiveOffer.discountPercent ?? 0,
        validUntil: exclusiveOffer.validUntil ?? null,
        badgeText: exclusiveOffer.badgeText ?? "Exclusive Offer",
        originalPrice: price,
      };
    } else {
      product.exclusiveOffer = { isActive: false, discountPercent: 0 };
    }

    await product.save();

    const productObj = product.toObject();
    productObj.currentPrice = product.getCurrentPrice();
    productObj.hasActiveOffer =
      product.exclusiveOffer?.isActive &&
      (!product.exclusiveOffer.validUntil ||
        new Date(product.exclusiveOffer.validUntil) > new Date());

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: productObj,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};
