const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.post('/', isAuthenticated, isAdmin, createCategory);
router.put('/:id', isAuthenticated, isAdmin, updateCategory);
router.delete('/:id', isAuthenticated, isAdmin, deleteCategory);

module.exports = router;