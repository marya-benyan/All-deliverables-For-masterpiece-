const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    validate: {
      validator: async function(value) {
        const product = await mongoose.model("Product").findById(value);
        return product !== null;
      },
      message: props => `Product ${props.value} does not exist`
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
    validate: {
      validator: async function(value) {
        const product = await mongoose.model("Product").findById(this.product);
        return product && product.stock >= value;
      },
      message: "Quantity exceeds available stock"
    }
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  items: {
    type: [cartItemSchema],
    default: [],
    validate: {
      validator: function(items) {
        const productIds = items.map(item => item.product.toString());
        return new Set(productIds).size === productIds.length;
      },
      message: "Cart cannot contain duplicate products"
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

cartSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model("Cart", cartSchema);