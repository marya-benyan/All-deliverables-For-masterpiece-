const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { isAuthenticated } = require("../middleware/authMiddleware");

// Middleware للتحقق من صلاحيات الـ Admin (اختياري)
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

router
  .route("/")
  .get(isAuthenticated, isAdmin, couponController.getCoupons) // جلب الكوبونات
  .post(isAuthenticated, isAdmin, couponController.addCoupon); // إضافة كوبون

router
  .route("/:id")
  .put(isAuthenticated, isAdmin, couponController.updateCoupon) // تحديث كوبون
  .delete(isAuthenticated, isAdmin, couponController.deleteCoupon); // حذف كوبون

router.route("/apply").post(isAuthenticated, couponController.applyCoupon); // تطبيق كوبون

module.exports = router;