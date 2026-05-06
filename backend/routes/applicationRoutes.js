const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  applyToJob,
  getApplicationById,
  updateApplicationStatus,
} = require("../controllers/applicationController");

// POST /api/applications
router.post("/", applyToJob);

// GET /api/applications/:seekerId  (recruiter review page — id from URL param)
router.get("/:seekerId", protect, getApplicationById);

// PATCH /api/applications/:seekerId/status
router.patch("/:seekerId/status", protect, updateApplicationStatus);

module.exports = router;