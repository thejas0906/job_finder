const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getStats,
  getAllUsers,
  deleteUser,
  getAllJobsAdmin,
  forceDeleteJob,
} = require("../controllers/adminController");

// All admin routes require authentication
// (In production, add a role-check middleware here)
router.use(protect);

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/jobs", getAllJobsAdmin);
router.delete("/jobs/:id", forceDeleteJob);

module.exports = router;