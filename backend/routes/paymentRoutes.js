const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  createVNPayPayment,
  vnpayReturn,
} = require("../controllers/paymentController");

router.post("/create-vnpay", protect, createVNPayPayment);
router.get("/vnpay-return", vnpayReturn);

module.exports = router;