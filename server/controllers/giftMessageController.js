const { GiftMessage } = require('../models');

exports.getGiftMessages = async (req, res) => {
  try {
    const giftMessages = await GiftMessage.find()
      .populate({
        path: 'order',
        populate: [
          { path: 'user', select: 'name email' },
          { path: 'products', select: 'name' },
        ],
      });
    res.json(giftMessages);
  } catch (error) {
    console.error("Get gift messages error:", error);
    res.status(500).json({ error: "خطأ في جلب رسائل الهدايا" });
  }
};