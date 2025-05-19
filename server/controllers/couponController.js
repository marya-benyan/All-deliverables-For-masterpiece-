const Coupon = require("../models/couponModel");

const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(400).json({ error: "Invalid or inactive coupon" });
    }

    const now = new Date();
    if (coupon.expiryDate < now) {
      return res.status(400).json({ error: "Coupon has expired" });
    }

    // التأكد من إن الـ discount عدد
    const discount = parseFloat(coupon.discount);
    if (isNaN(discount) || discount < 0) {
      return res.status(500).json({ error: "Invalid discount value" });
    }

    res.status(200).json({
      couponId: coupon._id.toString(), // التأكد من إن couponId نص
      discount: discount, // التأكد من إن discount عدد
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    res.status(500).json({ error: "Failed to apply coupon" });
  }
};

// بقية الدوال (getCoupons, addCoupon, إلخ) زي ما هي
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({ error: "خطأ في جلب الكوبونات" });
  }
};

const addCoupon = async (req, res) => {
  try {
    const { code, discount, expiryDate } = req.body;
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ error: "الكوبون موجود بالفعل" });
    }
    const coupon = new Coupon({
      code: code.toUpperCase(),
      discount: parseFloat(discount),
      expiryDate: new Date(expiryDate),
      isActive: true,
    });
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    console.error("Add coupon error:", error);
    res.status(500).json({ error: "خطأ في إضافة الكوبون" });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discount, expiryDate, isActive } = req.body;
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { code: code.toUpperCase(), discount: parseFloat(discount), expiryDate: new Date(expiryDate), isActive },
      { new: true, runValidators: true }
    );
    if (!coupon) {
      return res.status(404).json({ error: "كوبون غير موجود" });
    }
    res.json(coupon);
  } catch (error) {
    console.error("Update coupon error:", error);
    res.status(500).json({ error: "خطأ في تحديث الكوبون" });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ error: "كوبون غير موجود" });
    }
    res.json({ message: "تم حذف الكوبون بنجاح" });
  } catch (error) {
    console.error("Delete coupon error:", error);
    res.status(500).json({ error: "خطأ في حذف الكوبون" });
  }
};

module.exports = { applyCoupon, getCoupons, addCoupon, updateCoupon, deleteCoupon };