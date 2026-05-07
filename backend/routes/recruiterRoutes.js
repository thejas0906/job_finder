const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getRecruiterProfile,
  updateRecruiterProfile,
  getRecruiterJobs,
} = require("../controllers/recruiterController");

// GET /api/recruiters/:id
router.get("/me", protect, getRecruiterProfile);

// PUT /api/recruiters/:id
router.put("/me", protect, updateRecruiterProfile);

// GET /api/recruiters/:id/jobs
router.get("/me/jobs", protect, getRecruiterJobs);

module.exports = router;