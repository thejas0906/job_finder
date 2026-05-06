const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getSeekerProfile,
  updateSeekerProfile,
  updateResume,
} = require("../controllers/seekerController");
const {
  getSeekerApplications,
} = require("../controllers/applicationController");

// GET /api/seekers/:id
router.get("/:id", protect, getSeekerProfile);

// PUT /api/seekers/:id
router.put("/:id", protect, updateSeekerProfile);

// PUT /api/seekers/:id/resume
router.put("/:id/resume", protect, updateResume);

// GET /api/seekers/:id/applications
router.get("/:id/applications", getSeekerApplications);

module.exports = router;