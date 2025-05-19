const express = require("express");
const router = express.Router();
const {
  getCustomOrders,
  createCustomOrder,
  updateCustomOrder,
  deleteCustomOrder,
} = require("../controllers/customOrderController");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");
const upload = require('../middleware/upload');

router.get("/", isAuthenticated, isAdmin, getCustomOrders);
router.post("/", isAuthenticated, upload, createCustomOrder);
router.put("/:id", isAuthenticated, isAdmin, updateCustomOrder);
router.delete("/:id", isAuthenticated, isAdmin, deleteCustomOrder);

module.exports = router;