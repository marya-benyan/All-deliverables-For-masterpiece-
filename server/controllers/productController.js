const { Product, Category, Review } = require("../models");
const path = require("path");
const mongoose = require('mongoose');
const fs = require("fs").promises;

exports.getProducts = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const { category, price, search, sort, page = 1, limit = 6 } = req.query;

    let query = {};
    if (category) query.category_id = category;
    if (price && price !== "price-all") {
      const [minPrice, maxPrice] = price.split("-").map(Number);
      query.price = { $gte: minPrice, $lte: maxPrice };
    }
    if (search) query.name = { $regex: search, $options: "i" };

    let sortOption = {};
    switch (sort) {
      case "latest":
        sortOption = { createdAt: -1 };
        break;
      case "popularity":
        sortOption = { popularity: -1 };
        break;
      case "best rating":
        sortOption = { averageRating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate("category_id", "name");

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNum);

    res.json({
      products,
      totalPages,
      currentPage: pageNum,
      totalProducts,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Error fetching products" });
  }
};

exports.getJustArrived = async (req, res) => {
  try {
    // البحث عن فئة Home Decor
    const decorCategory = await Category.findOne({ name: "Home Decor" });
    if (!decorCategory) {
      return res.json([]); // لو مافيش فئة، نرجع مصفوفة فاضية
    }

    const products = await Product.find({ category_id: decorCategory._id })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("category_id", "name");

    res.json(products);
  } catch (error) {
    console.error("Get just arrived products error:", error);
    res.status(500).json({ error: "Error fetching new products" });
  }
};

exports.getTrandyProducts = async (req, res) => {
  try {
    // البحث عن فئة Wall Art
    const artCategory = await Category.findOne({ name: "Wall Art" });
    if (!artCategory) {
      return res.json([]); // لو مافيش فئة، نرجع مصفوفة فاضية
    }

    // جلب المنتجات من فئة Wall Art
    const products = await Product.find({ category_id: artCategory._id })
      .populate("category_id", "name");

    // جلب التقييمات لحساب averageRating
    const reviews = await Review.find().select('product rating');
    const productRatings = {};

    reviews.forEach((review) => {
      const productId = review.product.toString();
      if (!productRatings[productId]) {
        productRatings[productId] = { totalRating: 0, count: 0 };
      }
      productRatings[productId].totalRating += review.rating;
      productRatings[productId].count += 1;
    });

    // إضافة averageRating لكل منتج
    const productsWithRating = products.map((product) => {
      const productId = product._id.toString();
      const ratingData = productRatings[productId] || { totalRating: 0, count: 0 };
      const averageRating = ratingData.count > 0 
        ? ratingData.totalRating / ratingData.count 
        : 0;
      return {
        ...product.toObject(),
        averageRating,
      };
    });

    // ترتيب المنتجات حسب averageRating، ثم popularity، ثم createdAt
    const sortedProducts = productsWithRating
      .sort((a, b) => {
        const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        const popularityDiff = (b.popularity || 0) - (a.popularity || 0);
        if (popularityDiff !== 0) return popularityDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 8);

    res.json(sortedProducts);
  } catch (error) {
    console.error("Get trendy products error:", error);
    res.status(500).json({ error: "Error fetching trendy products" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category_id", "name");
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ error: "Error fetching product details" });
  }
};

exports.addProduct = async (req, res) => {
  try {
    console.log("addProduct - req.body:", req.body);
    console.log("addProduct - req.files:", req.files);
    console.log("addProduct - req.user:", req.user);

    const { name, description, price, category_id, stock } = req.body;
    const images = req.files && req.files.images 
      ? req.files.images.map((file) => path.join("Uploads", file.filename).replace(/\\/g, "/")) 
      : [];

    // Validate required fields
    if (!name || !price || stock === undefined || stock === "") {
      console.log("addProduct - Missing required fields:", { name, price, stock });
      return res.status(400).json({ error: "Name, price, and stock are required" });
    }

    // Validate stock
    const stockValue = parseInt(stock, 10);
    if (isNaN(stockValue) || stockValue < 0) {
      console.log("addProduct - Invalid stock value:", stock);
      return res.status(400).json({ error: "Stock must be a non-negative integer" });
    }

    // Validate price
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      console.log("addProduct - Invalid price value:", price);
      return res.status(400).json({ error: "Price must be a positive number" });
    }

    // Validate category_id if provided
    let validatedCategoryId = null;
    if (category_id) {
      if (!mongoose.Types.ObjectId.isValid(category_id)) {
        console.log("addProduct - Invalid category_id:", category_id);
        return res.status(400).json({ error: "Invalid category ID" });
      }
      const category = await Category.findById(category_id);
      if (!category) {
        console.log("addProduct - Category not found for ID:", category_id);
        return res.status(400).json({ error: "Category not found" });
      }
      validatedCategoryId = category_id;
    }

    // Create product
    const product = new Product({
      name,
      description,
      price: priceValue,
      category_id: validatedCategoryId,
      stock: stockValue,
      images,
      createdBy: req.user?.id || null,
    });

    // Save product
    const newProduct = await product.save();
    console.log("addProduct - New product saved:", newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("addProduct - Error:", error.message);
    console.error("addProduct - Stack:", error.stack);
    if (error.message.includes('Allowed file types')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: "Validation error: " + error.message });
    }
    res.status(500).json({ error: "Error adding product: " + error.message });
  }
};

exports.addCustomProduct = async (req, res) => {
 const { name, designDescription, message, material } = req.body;
     const images = req.files ? req.files.map(file => file.path) : [];
 try {
     console.log('req.body:', req.body);
     console.log('req.files:', req.files);
 
     
     if (!name || !designDescription) {
       return res.status(400).json({ error: "الاسم والوصف مطلوبان" });
     }
 
     let priceRange;
     switch (material) {
       case 'mosaic':
         priceRange = { min: 50, max: 150 };
         break;
       case 'charcoal':
         priceRange = { min: 20, max: 60 };
         break;
       case 'acrylic':
         priceRange = { min: 30, max: 90 };
         break;
       default:
         priceRange = { min: 20, max: 100 };
     }
 
     const customOrder = new CustomOrder({
       user: req.user.id,
       name,
       designDescription,
       images,
       message,
       priceRange,
       status: 'قيد التنفيذ',
     });
 
     const newCustomOrder = await customOrder.save();
     console.log('Custom order saved:', newCustomOrder);
     res.status(201).json(newCustomOrder);
   } catch (error) {
     console.error('Create custom order error:', error);
     res.status(400).json({ error: error.message });
   }
 };
 

exports.deleteProduct = async (req, res) => {
  try {
    console.log("deleteProduct - Product ID:", req.params.id);
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log("deleteProduct - Product not found:", req.params.id);
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        const imagePath = path.join(__dirname, "..", image);
        console.log("deleteProduct - Attempting to delete image:", imagePath);
        try {
          await fs.access(imagePath);
          await fs.unlink(imagePath);
          console.log("deleteProduct - Deleted image:", imagePath);
        } catch (error) {
          console.warn("deleteProduct - Image not found or error deleting:", imagePath, error);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    console.log("deleteProduct - Product deleted:", req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("deleteProduct - Error:", error);
    res.status(500).json({ error: "Error deleting product" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    console.log("updateProduct - req.body:", req.body);
    console.log("updateProduct - req.files:", req.files);
    console.log("updateProduct - Product ID:", req.params.id);
    const { name, description, price, category_id, stock } = req.body;
    const newImages = req.files ? req.files.map((file) => path.join("Uploads", file.filename).replace(/\\/g, "/")) : [];

    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log("updateProduct - Product not found:", req.params.id);
      return res.status(404).json({ error: "Product not found" });
    }

    if (!name || !price || !category_id || stock === undefined || stock === "") {
      console.log("updateProduct - Missing fields:", { name, price, category_id, stock });
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    const stockValue = parseInt(stock, 10);
    if (isNaN(stockValue) || stockValue < 0) {
      console.log("updateProduct - Invalid stock value:", stock);
      return res.status(400).json({ error: "Stock must be a non-negative integer" });
    }

    const category = await Category.findById(category_id);
    if (!category) {
      console.log("updateProduct - Category not found:", category_id);
      return res.status(400).json({ error: "Category not found" });
    }

    product.name = name;
    product.description = description || product.description;
    product.price = parseFloat(price);
    product.category_id = category_id;
    product.stock = stockValue;

    if (newImages.length > 0) {
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          const imagePath = path.join(__dirname, "..", image);
          console.log("updateProduct - Attempting to delete old image:", imagePath);
          try {
            await fs.access(imagePath);
            await fs.unlink(imagePath);
            console.log("updateProduct - Deleted old image:", imagePath);
          } catch (error) {
            console.warn("updateProduct - Old image not found or error deleting:", imagePath, error);
          }
        }
      }
      product.images = newImages;
    }

    const updatedProduct = await product.save();
    console.log("updateProduct - Product updated:", updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    console.error("updateProduct - Error:", error);
    res.status(500).json({ error: "Error updating product" });
  }
};