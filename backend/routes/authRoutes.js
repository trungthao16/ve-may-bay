const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

console.log("AUTH CONTROLLER:", authController);
console.log("REGISTER TYPE:", typeof authController.register);
console.log("LOGIN TYPE:", typeof authController.login);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;