const Wishlist = require("../models/Wishlist");

exports.getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.id }).populate("products");
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ error: "خطأ في جلب قائمة الرغبات." });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        let wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user.id, products: [] });
        }

        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
        }

        res.json({ message: "تمت إضافة المنتج إلى قائمة الرغبات." });
    } catch (error) {
        res.status(500).json({ error: "خطأ في إضافة المنتج." });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        await Wishlist.findOneAndUpdate(
            { user: req.user.id },
            { $pull: { products: productId } },
            { new: true }
        );

        res.json({ message: "تمت إزالة المنتج من قائمة الرغبات." });
    } catch (error) {
        res.status(500).json({ error: "خطأ في إزالة المنتج." });
    }
};
