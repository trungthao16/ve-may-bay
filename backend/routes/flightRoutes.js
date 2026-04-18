const express = require("express");
const router = express.Router();

const flightController = require("../controllers/flightController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.get("/", flightController.getFlights);
router.get("/airports", flightController.getAirports);
router.get("/search", flightController.searchFlights);
router.get("/:id", flightController.getFlightById);
router.get("/:flightId/booked-seats", flightController.getBookedSeats);
router.post("/:flightId/lock-seat", protect, flightController.lockSeat);

router.post("/", protect, isAdmin, flightController.createFlight);
router.put("/:id", protect, isAdmin, flightController.updateFlight);
router.delete("/:id", protect, isAdmin, flightController.deleteFlight);

module.exports = router;