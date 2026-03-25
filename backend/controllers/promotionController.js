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