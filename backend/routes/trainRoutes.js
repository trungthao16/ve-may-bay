// const express = require("express");
// const router = express.Router();

// const trainController = require("../controllers/trainController");
// const { protect } = require("../middleware/authMiddleware");
// const { isAdmin } = require("../middleware/roleMiddleware");

// // xem danh sách tàu
// router.get("/", trainController.getTrains);

// // xem chi tiết 1 tàu
// router.get("/:id", trainController.getTrainById);

// // admin thêm tàu
// router.post("/", protect, isAdmin, trainController.createTrain);

// // admin sửa tàu
// router.put("/:id", protect, isAdmin, trainController.updateTrain);

// // admin xóa tàu
// router.delete("/:id", protect, isAdmin, trainController.deleteTrain);

// module.exports = router;

const express = require("express");
const router = express.Router();

const trainController = require("../controllers/trainController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.get("/", trainController.getTrains);
router.get("/:id", trainController.getTrainById);

router.post("/", protect, isAdmin, trainController.createTrain);
router.put("/:id", protect, isAdmin, trainController.updateTrain);
router.delete("/:id", protect, isAdmin, trainController.deleteTrain);

module.exports = router;