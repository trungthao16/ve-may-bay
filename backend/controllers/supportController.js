const Support = require("../models/Support");

// User gửi hỗ trợ
exports.createSupport = async (req, res) => {
  try {
    const support = new Support({
      user: req.user.id,
      subject: req.body.subject,
      message: req.body.message,
    });

    await support.save();
    res.status(201).json({ message: "Gửi yêu cầu hỗ trợ thành công", support });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User xem hỗ trợ của mình
exports.getMySupports = async (req, res) => {
  try {
    const supports = await Support.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(supports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin xem tất cả
exports.getAllSupports = async (req, res) => {
  try {
    const supports = await Support.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(supports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin trả lời và đổi trạng thái
exports.replySupport = async (req, res) => {
  try {
    const { reply, status } = req.body;

    const support = await Support.findByIdAndUpdate(
      req.params.id,
      { reply, status },
      { new: true }
    );

    if (!support) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu hỗ trợ" });
    }

    res.json({ message: "Phản hồi thành công", support });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin xóa
exports.deleteSupport = async (req, res) => {
  try {
    const support = await Support.findByIdAndDelete(req.params.id);

    if (!support) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu hỗ trợ" });
    }

    res.json({ message: "Xóa yêu cầu hỗ trợ thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};