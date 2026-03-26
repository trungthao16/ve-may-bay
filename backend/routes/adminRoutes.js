

// const express = require("express");
// const router = express.Router();
// const { getStats } = require("../controllers/adminController");
// const { protect, admin } = require("../middleware/authMiddleware");

// router.get("/stats", protect, admin, getStats);

// module.exports = router;

import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;