const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Get user's cart
router.get("/", isAuthenticated, getCart);

// Add item to cart
router.post("/add", isAuthenticated, addToCart);

// Update cart item quantity
router.patch("/update", isAuthenticated, updateCartItem);

// Remove item from cart
router.delete("/remove/:productId", isAuthenticated, removeFromCart);

// Clear entire cart
router.delete("/clear", isAuthenticated, clearCart);

module.exports = router;