const express = require('express');
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require login + admin role
router.use(verifyToken, requireRole('admin'));

// ─────────────────────────────────────────────
// GET /api/admin/stats  — platform statistics
// ─────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [[{ totalUsers }]]        = await db.execute('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalJobs }]]         = await db.execute('SELECT COUNT(*) AS totalJobs FROM jobs WHERE status = "Active"');
    const [[{ totalApplications }]] = await db.execute('SELECT COUNT(*) AS totalApplications FROM applications');
    const [[{ reportedJobs }]]      = await db.execute('SELECT COUNT(*) AS reportedJobs FROM jobs WHERE status = "Reported"');

    return res.json({ totalUsers, totalJobs, totalApplications, reportedJobs });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/users  — list all users
// ─────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, phone, role, company_name, location, created_at FROM users ORDER BY created_at DESC'
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/admin/users/:id  — remove a user
// ─────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own admin account.' });
  }
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    return res.json({ message: 'User removed.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove user.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/jobs  — all jobs including reported
// ─────────────────────────────────────────────
router.get('/jobs', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT j.*, u.name AS posted_by_name FROM jobs j
       JOIN users u ON j.posted_by = u.id
       ORDER BY j.created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/admin/jobs/:id  — force delete any job
// ─────────────────────────────────────────────
router.delete('/jobs/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Job force deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete job.' });
  }
});

module.exports = router;
