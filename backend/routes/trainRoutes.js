

// const express = require("express");
// const router = express.Router();

// const trainController = require("../controllers/trainController");
// const { protect } = require("../middleware/authMiddleware");
// const { isAdmin } = require("../middleware/roleMiddleware");

// router.get("/", trainController.getTrains);
// router.get("/:id", trainController.getTrainById);

// router.post("/", protect, isAdmin, trainController.createTrain);
// router.put("/:id", protect, isAdmin, trainController.updateTrain);
// router.delete("/:id", protect, isAdmin, trainController.deleteTrain);

// module.exports = router;

const express = require("express");
const router = express.Router();

const trainController = require("../controllers/trainController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.get("/", trainController.getTrains);
router.get("/stations", trainController.getStations);
router.get("/search", trainController.searchTrains);
router.get("/:id", trainController.getTrainById);
router.get("/:trainId/booked-seats", trainController.getBookedSeats);
router.post("/:trainId/lock-seat", protect, trainController.lockSeat);

router.post("/", protect, isAdmin, trainController.createTrain);
router.put("/:id", protect, isAdmin, trainController.updateTrain);
router.delete("/:id", protect, isAdmin, trainController.deleteTrain);

module.exports = router;