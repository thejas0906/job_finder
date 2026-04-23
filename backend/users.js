const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/users/me  — get logged-in user's profile
// ─────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, email, phone, role, age, degree, experience,
              expected_salary, company_name, location, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/users/me  — update profile
// ─────────────────────────────────────────────
router.put('/me', verifyToken, async (req, res) => {
  const { name, phone, age, degree, experience, expectedSalary, companyName, location } = req.body;

  try {
    await db.execute(
      `UPDATE users SET
         name = COALESCE(?, name),
         phone = COALESCE(?, phone),
         age = COALESCE(?, age),
         degree = COALESCE(?, degree),
         experience = COALESCE(?, experience),
         expected_salary = COALESCE(?, expected_salary),
         company_name = COALESCE(?, company_name),
         location = COALESCE(?, location)
       WHERE id = ?`,
      [name, phone, age, degree, experience, expectedSalary, companyName, location, req.user.id]
    );
    return res.json({ message: 'Profile updated.' });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/users/saved  — seeker's saved jobs
// ─────────────────────────────────────────────
router.get('/saved', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT j.* FROM saved_jobs s
       JOIN jobs j ON s.job_id = j.id
       WHERE s.user_id = ?
       ORDER BY s.saved_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch saved jobs.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/users/saved/:jobId  — save a job
// ─────────────────────────────────────────────
router.post('/saved/:jobId', verifyToken, async (req, res) => {
  try {
    await db.execute(
      'INSERT IGNORE INTO saved_jobs (user_id, job_id) VALUES (?, ?)',
      [req.user.id, req.params.jobId]
    );
    return res.json({ message: 'Job saved.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save job.' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/users/saved/:jobId  — unsave a job
// ─────────────────────────────────────────────
router.delete('/saved/:jobId', verifyToken, async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?',
      [req.user.id, req.params.jobId]
    );
    return res.json({ message: 'Job unsaved.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to unsave job.' });
  }
});

module.exports = router;
