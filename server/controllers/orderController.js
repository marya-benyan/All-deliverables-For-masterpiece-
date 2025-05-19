const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/couponModel');
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
  console.log('🔔 Request body:', req.body);

  try {
    const { items, shippingAddress, couponId, paymentMethod, transactionId } = req.body;
    const userId = req.user?.id;
    console.log('User ID:', userId);

    // Validate user
    if (!userId) {
      return res.status(401).json({ error: 'Please log in to create an order' });
    }

    // Validate basic data
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or invalid data' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country || !shippingAddress.postalCode) {
      return res.status(400).json({ error: 'Shipping address is incomplete' });
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: `Invalid product data: ${JSON.stringify(item)}` });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const price = product.discountApplied ? product.discountedPrice : product.price;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
      });

      totalAmount += price * item.quantity;

      console.log(`✅ ${product.name} - Requested: ${item.quantity}, Available: ${product.stock}`);
    }

    // Apply coupon if provided
    let discount = 0;
    let appliedCouponId = null;

    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        return res.status(400).json({ error: 'Coupon not found' });
      }
      if (coupon.expiryDate < new Date()) {
        return res.status(400).json({ error: 'Coupon has expired' });
      }
      appliedCouponId = coupon._id;
      discount = coupon.discount;
      totalAmount -= (totalAmount * discount) / 100;
    }

    // Create the order
    const order = new Order({
      user: mongoose.Types.ObjectId.createFromHexString(userId),
      items: orderItems,
      shippingAddress,
      totalAmount,
      discount,
      coupon: appliedCouponId,
      paymentMethod: paymentMethod || 'pending',
      transactionId: transactionId || null,
      status: transactionId ? 'processing' : 'pending',
      paymentStatus: transactionId ? 'completed' : 'pending',
    });
    await order.save();

    // Update product stock
    for (const item of items) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (updatedProduct.stock <= 0) {
        await Product.findByIdAndUpdate(item.productId, { inStock: false });
      }
    }

    // Send response
    res.status(201).json({
      orderId: order._id,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    console.error('❌ Create order error:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
    });

    res.status(500).json({ error: `Failed to create order: ${error.message}` });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user items.productId coupon');
    console.log('Orders fetched:', orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};