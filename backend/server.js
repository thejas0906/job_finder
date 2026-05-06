const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:5173", // Vite dev server default
  credentials: true,
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
const authRoutes        = require("./routes/authRoutes");
const jobRoutes         = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const seekerRoutes      = require("./routes/seekerRoutes");
const recruiterRoutes   = require("./routes/recruiterRoutes");
const adminRoutes       = require("./routes/adminRoutes");

app.use("/api/auth",         authRoutes);
app.use("/api/jobs",         jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/seekers",      seekerRoutes);
app.use("/api/recruiters",   recruiterRoutes);
app.use("/api/admin",        adminRoutes);

// Keep legacy /api/register and /api/login paths that the frontend already uses
app.use("/api", authRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "Hirely API is running ✓" }));

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
