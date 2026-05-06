const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getAllJobs,
  getJobById,
  createJob,
  deleteJob,
} = require("../controllers/jobController");
const {
  getJobApplications,
} = require("../controllers/applicationController");

// Public
router.get("/", getAllJobs);
router.get("/:id", getJobById);

// Protected
router.post("/", protect, createJob);
router.delete("/:id", protect, deleteJob);

// Recruiter: applicants for a specific job
router.get("/:jobId/applications", protect, getJobApplications);

module.exports = router;