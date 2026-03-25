// const express = require("express");
// const router = express.Router();

// const {
//   createTicket,
//   getMyTickets,
//   cancelTicket,
//   deleteTicket,
//   getAllTickets,
// } = require("../controllers/ticketController");

// const { protect } = require("../middleware/authMiddleware");
// const { isAdmin } = require("../middleware/roleMiddleware");

// router.post("/", protect, createTicket);
// router.get("/my", protect, getMyTickets);
// router.put("/:id/cancel", protect, cancelTicket);

// router.get("/", protect, isAdmin, getAllTickets);
// router.delete("/:id", protect, isAdmin, deleteTicket);

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createTicket,
  getMyTickets,
  cancelTicket,
  deleteTicket,
  getAllTickets,
} = require("../controllers/ticketController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.post("/", protect, createTicket);
router.get("/my", protect, getMyTickets);
router.put("/:id/cancel", protect, cancelTicket);

router.get("/", protect, isAdmin, getAllTickets);
router.delete("/:id", protect, isAdmin, deleteTicket);

module.exports = router;