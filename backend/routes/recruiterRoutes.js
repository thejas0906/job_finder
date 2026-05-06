const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getRecruiterProfile,
  updateRecruiterProfile,
  getRecruiterJobs,
} = require("../controllers/recruiterController");

// GET /api/recruiters/:id
router.get("/:id", protect, getRecruiterProfile);

// PUT /api/recruiters/:id
router.put("/:id", protect, updateRecruiterProfile);

// GET /api/recruiters/:id/jobs
router.get("/:id/jobs", protect, getRecruiterJobs);

module.exports = router;