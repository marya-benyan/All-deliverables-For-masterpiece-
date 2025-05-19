const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  discountApplied: { type: Boolean, default: false },
  images: [{ type: String }],
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  stock: { type: Number, required: true, default: 0 },
  popularity: { type: Number, default: 0 }, // عدد المبيعات أو الشعبية
  rating: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 }, // متوسط التقييم
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);