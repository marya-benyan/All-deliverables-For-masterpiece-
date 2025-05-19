const express = require("express");
const router = express.Router();
const {
  getProducts,
  getJustArrived,
  getTrandyProducts,
  getProductById,
  addProduct,
  addCustomProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.get("/", getProducts);
router.get("/just-arrived", getJustArrived);
router.get("/trandy", getTrandyProducts);
router.get("/:id", getProductById);
router.post("/", isAuthenticated, isAdmin, upload, addProduct);
router.post("/custom", isAuthenticated, upload, addCustomProduct);
router.delete("/:id", isAuthenticated, isAdmin, deleteProduct);
router.put("/:id", isAuthenticated, isAdmin, upload, updateProduct);

module.exports = router;