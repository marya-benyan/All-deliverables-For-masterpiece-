// userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: "تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول، يرجى المحاولة مرة أخرى بعد 15 دقيقة",
});

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", loginLimiter, userController.loginUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

// Protected routes
router.get("/me", isAuthenticated, userController.getCurrentUser);
router.put("/me", isAuthenticated, userController.updateUser);
router.put("/me/password", isAuthenticated, userController.changePassword);
router.get("/:id", isAuthenticated, userController.getUserById);
router.post("/logout", isAuthenticated, userController.logout); // تعديل هنا: userController.logout

// Admin-only route
router.get("/admin/users", isAuthenticated, isAdmin, userController.getUsers);

module.exports = router;