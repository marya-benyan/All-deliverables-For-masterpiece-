const mongoose = require('mongoose');

const giftMessageSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  text: { type: String },
  audio: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GiftMessage', giftMessageSchema);