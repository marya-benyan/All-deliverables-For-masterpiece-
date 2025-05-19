const { Product, User, Review, Discount, ContactMessage, Message } = require('../models');
const nodemailer = require('nodemailer');

// Add a new product
// Add a new product
exports.addProduct = async (req, res) => {
    console.log('req.body:', req.body); // Debug log
    console.log('req.files:', req.files); // Debug log
    const { name, description, price, category_id, stock } = req.body;
  
    // Log individual fields
    console.log('name:', name);
    console.log('description:', description);
    console.log('price:', price);
    console.log('category_id:', category_id);
    console.log('stock:', stock);
  
    try {
      // Validate required fields
      if (!name || !price || !category_id || !stock) {
        console.log('Missing required fields:', { name, price, category_id, stock });
        return res.status(400).json({ 
          error: "جميع الحقول المطلوبة (name, price, category_id, stock) يجب أن تكون موجودة وغير فارغة" 
        });
      }
  
      const images = req.files ? req.files.map(file => file.path) : [];
      console.log('Images after mapping:', images);
  
      const product = new Product({
        name,
        description,
        price,
        category_id,
        stock,
        images,
      });
  
      const newProduct = await product.save();
      console.log('Product saved:', newProduct);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Add product error:", error);
      res.status(500).json({ error: "خطأ في إضافة المنتج" });
    }
  };

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category_id', 'name');
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "خطأ في جلب قائمة المنتجات" });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email createdAt');
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "خطأ في جلب قائمة المستخدمين" });
  }
};

// Get all reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name')
      .populate('user', 'name');
    res.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ error: "خطأ في جلب قائمة المراجعات" });
  }
};

// Add a discount
exports.addDiscount = async (req, res) => {
  const { product_id, category_id, discount_value, discount_type, start_date, end_date } = req.body;
  try {
    const discount = new Discount({
      product_id: product_id || null,
      category_id: category_id || null,
      discount_value,
      discount_type,
      start_date,
      end_date,
    });
    await discount.save();
    res.status(201).json(discount);
  } catch (error) {
    console.error("Add discount error:", error);
    res.status(500).json({ error: "خطأ في إضافة الخصم" });
  }
};

// Get all discounts
exports.getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find()
      .populate('product_id', 'name')
      .populate('category_id', 'name');
    res.json(discounts);
  } catch (error) {
    console.error("Get discounts error:", error);
    res.status(500).json({ error: "خطأ في جلب قائمة الخصومات" });
  }
};

// Get all Contact Us messages
exports.getContactMessages = async (req, res) => {
  try {
    const contactMessages = await ContactMessage.find();
    res.json(contactMessages);
  } catch (error) {
    console.error("Get contact messages error:", error);
    res.status(500).json({ error: "خطأ في جلب قائمة رسائل التواصل" });
  }
};

// Reply to a Contact Us message
exports.replyContactMessage = async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  try {
    const contactMessage = await ContactMessage.findById(id);
    if (!contactMessage) return res.status(404).json({ error: "الرسالة غير موجودة" });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contactMessage.sender_email,
      subject: `Re: ${contactMessage.subject}`,
      text: reply,
    };

    await transporter.sendMail(mailOptions);
    contactMessage.status = 'replied';
    await contactMessage.save();

    res.json({ message: "تم إرسال الرد بنجاح" });
  } catch (error) {
    console.error("Reply contact message error:", error);
    res.status(500).json({ error: "خطأ في إرسال الرد" });
  }
};

// Get all gift messages
exports.getGiftMessages = async (req, res) => {
  try {
    const giftMessages = await Message.find().populate({
      path: 'order',
      populate: [
        { path: 'user', select: 'name email' },
        { path: 'products', select: 'name' },
      ],
    });
    res.json(giftMessages);
  } catch (error) {
    console.error("Get gift messages error:", error);
    res.status(500).json({ error: "خطأ في جلب قائمة رسائل الهدايا" });
  }
};