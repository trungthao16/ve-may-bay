// // const router = require("express").Router();


// // const adminController = require("../controllers/adminController");
// // const { protect } = require("../middleware/authMiddleware");
// // const { isAdmin } = require("../middleware/roleMiddleware");

// // router.get("/stats", protect, isAdmin, adminController.getStats);

// // module.exports = router;

// const express = require("express");
// const router = express.Router();

// const { getStats } = require("../controllers/adminController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// router.get("/stats", authMiddleware, roleMiddleware("admin"), getStats);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { getStats } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/stats", protect, admin, getStats);

module.exports = router;