const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json({ message: "Xóa user thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// cập nhật thông tin cá nhân (user)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const { name, email, password } = req.body;

    // check email trùng
    const existing = await User.findOne({ email });
    if (existing && existing._id.toString() !== userId.toString()) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const updateData = {
      name,
      email,
    };

    if (password) {
      const bcrypt = require("bcryptjs");
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};