require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// Request logging
app.use(morgan("dev"));

// Parse cookies
app.use(cookieParser());

// Connect to the database
connectDB();

// Import routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const customOrderRoutes = require("./routes/customOrderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactMessageRoutes");
const giftMessageRoutes = require("./routes/giftMessageRoutes");
const couponRoutes = require("./routes/couponRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/custom-orders", customOrderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/gift-messages", giftMessageRoutes);
app.use("/api/coupons", couponRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "خطأ في التحقق من البيانات", details: err.message });
  }

  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(400).json({ error: "البيانات مكررة (مثلاً: البريد الإلكتروني مستخدم بالفعل)" });
  }

  res.status(err.status || 500).json({
    error: err.status ? err.message : "حدث خطأ في الخادم",
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));