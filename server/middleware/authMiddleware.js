// authMiddleware.js
const jwt = require("jsonwebtoken");

exports.isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  console.log("Token received in isAuthenticated:", token);

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: "الرجاء تسجيل الدخول" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    console.log("req.user set to:", req.user);
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "التوكن غير صالح" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "ممنوع: مطلوب صلاحيات إدارية" });
  }
  next();
};