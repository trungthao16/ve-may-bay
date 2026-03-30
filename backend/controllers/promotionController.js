const Promotion = require("../models/Promotion");

// User: lấy khuyến mãi đang hoạt động
exports.getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ createdAt: -1 });

    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: lấy tất cả
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: thêm
exports.createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json({ message: "Tạo khuyến mãi thành công", promotion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: sửa
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }

    res.json({ message: "Cập nhật thành công", promotion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: xóa
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }

    res.json({ message: "Xóa khuyến mãi thành công" });
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

    res.json({
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