const mongoose = require('mongoose');

// Import all model schemas
const cartSchema = require('./Cart');
const categorySchema = require('./Category');
const customOrderSchema = require('./CustomOrder');
const messageSchema = require('./Message'); // Gift messages
const contactMessageSchema = require('./contactMessages'); // Contact Us messages
const orderSchema = require('./Order');
const paymentSchema = require('./Payment');
const productSchema = require('./Product');
const reviewSchema = require('./Review');
const userSchema = require('./User');
const wishlistSchema = require('./Wishlist');
const discountSchema = require('./discount');

// Export all models, ensuring they are compiled only once
module.exports = {
  Cart: mongoose.models.Cart || mongoose.model('Cart', cartSchema),
  Category: mongoose.models.Category || mongoose.model('Category', categorySchema),
  CustomOrder: mongoose.models.CustomOrder || mongoose.model('CustomOrder', customOrderSchema),
  Message: mongoose.models.Message || mongoose.model('Message', messageSchema),
  ContactMessage: mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema),
  Order: mongoose.models.Order || mongoose.model('Order', orderSchema),
  Payment: mongoose.models.Payment || mongoose.model('Payment', paymentSchema),
  Product: mongoose.models.Product || mongoose.model('Product', productSchema),
  Review: mongoose.models.Review || mongoose.model('Review', reviewSchema),
  User: mongoose.models.User || mongoose.model('User', userSchema),
  Wishlist: mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema),
  Discount: mongoose.models.Discount || mongoose.model('Discount', discountSchema),
};