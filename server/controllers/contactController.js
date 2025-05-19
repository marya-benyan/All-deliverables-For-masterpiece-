const { ContactMessage } = require('../models');

// Submit a new Contact Us message
exports.submitContactMessage = async (req, res) => {
  const { sender_name, sender_email, subject, message } = req.body;

  try {
    // Validate required fields
    if (!sender_name || !sender_email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contactMessage = new ContactMessage({
      sender_name,
      sender_email,
      subject,
      message,
      status: 'pending', // Add default status
    });

    await contactMessage.save();
    res.status(201).json({ message: 'Message submitted successfully' });
  } catch (error) {
    console.error("Submit contact message error:", error);
    res.status(500).json({ message: "خطأ في إرسال الرسالة" });
  }
};

// Get all contact messages (for admin)
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find();
    res.json(messages);
  } catch (error) {
    console.error("Get contact messages error:", error);
    res.status(500).json({ error: "خطأ في جلب رسائل التواصل" });
  }
};

// Reply to a contact message (for admin)
exports.replyContactMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ error: "Reply is required" });
    }

    const message = await ContactMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "الرسالة غير موجودة" });
    }

    message.reply = reply;
    message.status = 'replied';
    await message.save();

    res.json({ message: "تم الرد على الرسالة بنجاح", data: message });
  } catch (error) {
    console.error("Reply contact message error:", error);
    res.status(500).json({ error: "خطأ في الرد على الرسالة" });
  }
};