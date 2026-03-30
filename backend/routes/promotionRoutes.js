const express = require("express");
const router = express.Router();

const {
  getActivePromotions,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotionCode,
} = require("../controllers/promotionController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

// user
router.get("/", getActivePromotions);
router.post("/validate", validatePromotionCode);
// admin
router.get("/admin", protect, isAdmin, getAllPromotions);
router.post("/", protect, isAdmin, createPromotion);
router.put("/:id", protect, isAdmin, updatePromotion);
router.delete("/:id", protect, isAdmin, deletePromotion);

module.exports = router;