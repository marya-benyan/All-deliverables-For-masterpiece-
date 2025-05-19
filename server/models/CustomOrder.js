const mongoose = require("mongoose");

const customOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    designDescription: { type: String, required: true },
    giftType: { type: String, required: false }, // Changed to optional
    message: { type: String }, // Can be text or file path
    messageType: {
      type: String,
      enum: ["text", "image", "audio", "video"],
      default: "text",
    },
    priceRange: {
      min: { type: Number },
      max: { type: Number },
    },
    images: [{ type: String }], // Added to store image paths
    status: {
      type: String,
      enum: ["Pending", "Completed", "Canceled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomOrder", customOrderSchema);