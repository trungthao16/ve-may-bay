const express = require("express");
const router = express.Router();

const {
  createSupport,
  getMySupports,
  getAllSupports,
  replySupport,
  deleteSupport,
} = require("../controllers/supportController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.post("/", protect, createSupport);
router.get("/my", protect, getMySupports);

router.get("/admin", protect, isAdmin, getAllSupports);
router.put("/:id/reply", protect, isAdmin, replySupport);
router.delete("/:id", protect, isAdmin, deleteSupport);

module.exports = router;