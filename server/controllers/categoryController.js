const { Category } = require('../models');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'خطأ في جلب قائمة الأصناف' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'اسم الصنف مطلوب' });
    }
    const category = new Category({ name, description });
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(400).json({ error: 'خطأ في إضافة الصنف' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    console.log('updateCategory - req.body:', req.body);
    console.log('updateCategory - Category ID:', req.params.id);
    const { name, description } = req.body;

    if (!name) {
      console.log('updateCategory - Missing name field');
      return res.status(400).json({ error: 'اسم الصنف مطلوب' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      console.log('updateCategory - Category not found:', req.params.id);
      return res.status(404).json({ error: 'الصنف غير موجود' });
    }

    category.name = name;
    category.description = description || category.description;

    const updatedCategory = await category.save();
    console.log('updateCategory - Category updated:', updatedCategory);
    res.json(updatedCategory);
  } catch (error) {
    console.error('updateCategory - Error:', error);
    res.status(500).json({ error: 'خطأ في تحديث الصنف' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    console.log('deleteCategory - Category ID:', req.params.id);
    const category = await Category.findById(req.params.id);
    if (!category) {
      console.log('deleteCategory - Category not found:', req.params.id);
      return res.status(404).json({ error: 'الصنف غير موجود' });
    }

    // Optional: Check if category is used by products
    const products = await require('../models').Product.find({ category_id: req.params.id });
    if (products.length > 0) {
      console.log('deleteCategory - Category in use by products:', products.length);
      return res.status(400).json({ error: 'لا يمكن حذف الصنف لأنه مستخدم في منتجات' });
    }

    await Category.findByIdAndDelete(req.params.id);
    console.log('deleteCategory - Category deleted:', req.params.id);
    res.json({ message: 'تم حذف الصنف بنجاح' });
  } catch (error) {
    console.error('deleteCategory - Error:', error);
    res.status(500).json({ error: 'خطأ في حذف الصنف' });
  }
};