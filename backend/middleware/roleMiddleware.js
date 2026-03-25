exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }

  next();
};