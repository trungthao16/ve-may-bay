const router = require("express").Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.put("/profile", protect, userController.updateProfile);

// lấy danh sách user (admin)
router.get("/", protect, isAdmin, userController.getUsers);

// đổi quyền user
router.put("/:id/role", protect, isAdmin, userController.updateUserRole);

// xóa user
router.delete("/:id", protect, isAdmin, userController.deleteUser);

// user tự cập nhật thông tin


module.exports = router;