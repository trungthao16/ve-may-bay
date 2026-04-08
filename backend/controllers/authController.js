const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendOTPVerificationEmail, sendForgotPasswordEmail } = require("../utils/emailService");

// đăng ký
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      } else {
        // Xóa user chưa xác thực để đăng ký lại
        await User.deleteOne({ email });
      }
    }

    // 🔥 mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      isVerified: true // Xác thực ngay, bỏ qua OTP
    });

    await user.save();

    res.status(201).json({
      message: "Đăng ký thành công! Bạn có thể đăng nhập ngay.",
      email: user.email
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);

    // Xử lý lỗi trùng lặp email từ MongoDB (E11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." });
    }

    res.status(500).json({ message: error.message });
  }
};

// đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Tài khoản chưa được xác thực email", email: user.email, notVerified: true });
    }

    // 🔥 so sánh password đúng chuẩn
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ message: "Vui lòng cung cấp email và mã OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Tài khoản đã được xác thực" });
    }

    if (user.otpCode !== otpCode) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Xác thực email thành công! Bạn có thể đăng nhập ngay." });
  } catch (error) {
    console.error("Lỗi xác thực OTP:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi xác thực OTP" });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Tài khoản đã được xác thực" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    res.json({ message: "Mã OTP mới đã được gửi đến email của bạn." });

    sendOTPVerificationEmail(email, otpCode).catch(err => {
      console.error("Lỗi gửi lại OTP email:", err.message);
    });
  } catch (error) {
    console.error("Lỗi gửi lại OTP:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi gửi lại OTP" });
  }
};

// User: kiểm tra mã khuyến mãi
exports.validatePromotionCode = async (req, res) => {
  try {
    const { code, orderValue } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Vui lòng nhập mã khuyến mãi" });
    }

    const promotion = await Promotion.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!promotion) {
      return res.status(404).json({ message: "Mã khuyến mãi không tồn tại" });
    }

    const now = new Date();

    if (promotion.startDate > now) {
      return res.status(400).json({ message: "Mã khuyến mãi chưa bắt đầu" });
    }

    if (promotion.endDate < now) {
      return res.status(400).json({ message: "Mã khuyến mãi đã hết hạn" });
    }

    if ((orderValue || 0) < promotion.minOrderValue) {
      return res.status(400).json({
        message: `Đơn hàng tối thiểu phải từ ${Number(
          promotion.minOrderValue
        ).toLocaleString("vi-VN")}đ`,
      });
    }

    let discountAmount = 0;

    if (promotion.discountType === "percent") {
      discountAmount = ((orderValue || 0) * promotion.discountValue) / 100;

      if (promotion.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, promotion.maxDiscount);
      }
    } else if (promotion.discountType === "fixed") {
      discountAmount = promotion.discountValue;
    }

    const finalPrice = Math.max((orderValue || 0) - discountAmount, 0);

    return res.json({
      message: "Áp mã thành công",
      promotion: {
        _id: promotion._id,
        code: promotion.code,
        title: promotion.title,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        minOrderValue: promotion.minOrderValue,
        maxDiscount: promotion.maxDiscount,
      },
      discountAmount,
      finalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Quên mật khẩu - Bước 1: Gửi OTP qua email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });

    // Không gửi email, trả lời ngay để cho phép đặt lại mật khẩu
    res.json({ message: "Xác nhận email thành công. Vui lòng đặt mật khẩu mới.", email });
  } catch (error) {
    console.error("Lỗi forgotPassword:", error);
    res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại." });
  }
};

// Quên mật khẩu - Bước 2: Đặt mật khẩu mới trực tiếp (không cần OTP)
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay." });
  } catch (error) {
    console.error("Lỗi resetPassword:", error);
    res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại." });
  }
};
