const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  discount_value: { type: Number, required: true },
  discount_type: { type: String, enum: ['percent', 'fixed'], required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Discount', discountSchema);