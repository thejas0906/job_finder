const express = require("express");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");

// ── Multer setup for resume uploads ─────────────────────────────────────────
const uploadsDir = path.join(__dirname, "../uploads/resumes");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single("resume");
  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: "File is too large. Maximum size is 5MB." });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// ── Routes ───────────────────────────────────────────────────────────────────
router.post("/register",       handleUpload, register);
router.post("/login",          login);
router.post("/forgot-password",forgotPassword);
router.post("/verify-otp",     verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;