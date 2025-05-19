const Cart = require('../models/Cart');
const Product = require('../models/Product');

const formatCartItem = (item) => ({
  product: {
    _id: item.product._id,
    name: item.product.name,
    price: item.product.price,
    images: item.product.images || [],
    stock: item.product.stock,
    discountApplied: item.product.discountApplied || false,
    discountedPrice: item.product.discountedPrice || 0
  },
  quantity: item.quantity || 1
});

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images stock discountApplied discountedPrice'
      });

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    const formattedItems = cart.items.map(formatCartItem);
    res.status(200).json({ items: formattedItems });
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({ 
      error: 'Failed to get cart',
      details: error.message 
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ error: 'Invalid product or quantity' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.inStock || product.stock < quantity) {
      return res.status(400).json({ error: 'Product not available' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');

    const formattedItems = cart.items.map(formatCartItem);
    res.status(200).json({ items: formattedItems });
  } catch (error) {
    console.error('addToCart error:', error);
    res.status(500).json({ 
      error: 'Failed to add to cart',
      details: error.message 
    });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemToUpdate = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (!itemToUpdate) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.inStock || product.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    itemToUpdate.quantity = quantity;
    cart.items = cart.items.filter(item => item.quantity > 0);

    await cart.save();
    await cart.populate('items.product');

    const formattedItems = cart.items.map(formatCartItem);
    res.status(200).json({ items: formattedItems });
  } catch (error) {
    console.error('updateCartItem error:', error);
    res.status(500).json({ 
      error: 'Failed to update cart',
      details: error.message 
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { items: { product: productId } } },
      { new: true }
    ).populate('items.product');

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const formattedItems = cart.items.map(formatCartItem);
    res.status(200).json({ items: formattedItems });
  } catch (error) {
    console.error('removeFromCart error:', error);
    res.status(500).json({ 
      error: 'Failed to remove item',
      details: error.message 
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { new: true }
    );

    res.status(200).json({ items: [] });
  } catch (error) {
    console.error('clearCart error:', error);
    res.status(500).json({ 
      error: 'Failed to clear cart',
      details: error.message 
    });
  }
};