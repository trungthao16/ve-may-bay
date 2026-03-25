// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// exports.protect = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Chưa đăng nhập" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id).select("-password");

//     if (!user) {
//       return res.status(401).json({ message: "Người dùng không tồn tại" });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("AUTH ERROR:", error);
//     return res.status(401).json({ message: "Token không hợp lệ" });
//   }
// };

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Chưa xác thực người dùng" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền admin" });
  }

  next();
};

module.exports = { protect, admin };