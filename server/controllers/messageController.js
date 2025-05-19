const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        const newMessage = new Message({ name, email, message });
        await newMessage.save();

        res.status(201).json({ message: "تم إرسال الرسالة بنجاح" });
    } catch (error) {
        res.status(500).json({ error: "خطأ في إرسال الرسالة" });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "خطأ في جلب الرسائل" });
    }
};
