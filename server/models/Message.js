const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  text: { type: String },
  audio: { type: String },
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;