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
router.get("/me", protect, getSeekerProfile);

// PUT /api/seekers/:id
router.put("/me", protect, updateSeekerProfile);

// PUT /api/seekers/:id/resume
router.put("/me/resume", protect, updateResume);

// GET /api/seekers/:id/applications
router.get("/me/applications", protect, getSeekerApplications);

module.exports = router;