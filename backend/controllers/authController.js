const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// đăng ký
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // 🔥 mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await user.save();

    res.status(201).json({
      message: "Đăng ký thành công",
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

// đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
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