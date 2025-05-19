const { Discount } = require('../models');

exports.getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find()
      .populate('product_id', 'name')
      .populate('category_id', 'name');
    res.json(discounts);
  } catch (error) {
    console.error("Get discounts error:", error);
    res.status(500).json({ error: "خطأ في جلب قائمة الخصومات" });
  }
};

exports.addDiscount = async (req, res) => {
  try {
    const { product_id, category_id, discount_value, discount_type, start_date, end_date } = req.body;

    if (!discount_value || !discount_type || !start_date || !end_date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!product_id && !category_id) {
      return res.status(400).json({ error: "Either product_id or category_id must be provided" });
    }

    const discount = new Discount({
      product_id: product_id || undefined,
      category_id: category_id || undefined,
      discount_value,
      discount_type,
      start_date,
      end_date,
    });

    const newDiscount = await discount.save();
    res.status(201).json(newDiscount);
  } catch (error) {
    console.error("Add discount error:", error);
    res.status(500).json({ error: "خطأ في إضافة الخصم" });
  }
};