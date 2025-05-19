const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Number }, // يجب أن يكون Number وليس Date
  lastLogin: { type: Date },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: { type: String, default: "" }, // Added for phone number
  address: { type: String, default: "" }, // Added for address
  bio: { type: String, default: "" }, // Added for bio
  photo: { type: String, default: "" }, // Added for profile picture (base64 string)
  events: [{ // Added for storing user events
    title: { type: String, required: true },
    date: { type: String, required: true }, // Using String for simplicity; could use Date
    location: { type: String, required: true },
    type: { type: String, enum: ["Workshop", "Class", "Event", "Delivery"], required: true },
    id: { type: Number, default: Date.now }, // Client-generated ID for simplicity
  }],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;