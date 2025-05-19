const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  sender_name: { type: String, required: true },
  sender_email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'replied'], default: 'pending' },
  reply: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);