const CustomOrder = require('../models/CustomOrder');

exports.getCustomOrders = async (req, res) => {
  try {
    const customOrders = await CustomOrder.find().populate('user');
    res.json(customOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCustomOrder = async (req, res) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);

    const { name, designDescription, material, messageType, textMessage } = req.body;
    const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];
    const audioMessage = req.files['audioMessage'] ? req.files['audioMessage'][0].path : null;
    const videoMessage = req.files['videoMessage'] ? req.files['videoMessage'][0].path : null;

    if (!name || !designDescription) {
      return res.status(400).json({ error: "الاسم والوصف مطلوبان" });
    }

    let priceRange;
    switch (material) {
      case 'mosaic':
        priceRange = { min: 50, max: 150 };
        break;
      case 'charcoal':
        priceRange = { min: 20, max: 60 };
        break;
      case 'acrylic':
        priceRange = { min: 30, max: 90 };
        break;
      default:
        priceRange = { min: 20, max: 100 };
    }

    let message;
    if (messageType === 'text') {
      message = textMessage;
    } else if (messageType === 'audio' && audioMessage) {
      message = audioMessage;
    } else if (messageType === 'video' && videoMessage) {
      message = videoMessage;
    }

    const customOrder = new CustomOrder({
      user: req.user.id,
      name,
      designDescription,
      images,
      message,
      messageType,
      priceRange,
      status: 'Pending', // Changed to match schema
    });

    const newCustomOrder = await customOrder.save();
    console.log('Custom order saved:', newCustomOrder);
    res.status(201).json(newCustomOrder);
  } catch (error) {
    console.error('Create custom order error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateCustomOrder = async (req, res) => {
  try {
    const customOrder = await CustomOrder.findById(req.params.id);
    if (!customOrder) {
      return res.status(404).json({ error: 'Custom order not found' });
    }
    customOrder.designDescription = req.body.designDescription || customOrder.designDescription;
    customOrder.message = req.body.message || customOrder.message;
    customOrder.messageType = req.body.messageType || customOrder.messageType;
    customOrder.status = req.body.status || customOrder.status;
    if (req.files['images'] && req.files['images'].length > 0) {
      customOrder.images = req.files['images'].map(file => file.path);
    }
    if (req.files['audioMessage']) {
      customOrder.message = req.files['audioMessage'][0].path;
      customOrder.messageType = 'audio';
    }
    if (req.files['videoMessage']) {
      customOrder.message = req.files['videoMessage'][0].path;
      customOrder.messageType = 'video';
    }
    const updatedCustomOrder = await customOrder.save();
    res.json(updatedCustomOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCustomOrder = async (req, res) => {
  try {
    const customOrder = await CustomOrder.findById(req.params.id);
    if (!customOrder) {
      return res.status(404).json({ error: 'Custom order not found' });
    }
    await customOrder.remove();
    res.json({ message: 'Custom order deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};