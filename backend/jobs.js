const express = require('express');
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/jobs  — public, supports search & filter
// Query params: search, location, experience, salary
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { search, location, experience, salary } = req.query;

  let query = `SELECT j.*, u.name AS recruiter_name FROM jobs j
               JOIN users u ON j.posted_by = u.id
               WHERE j.status = 'Active'`;
  const params = [];

  if (search) {
    query += ' AND (j.title LIKE ? OR j.company LIKE ? OR j.tags LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (location) {
    query += ' AND j.location LIKE ?';
    params.push(`%${location}%`);
  }

  query += ' ORDER BY j.created_at DESC';

  try {
    const [rows] = await db.execute(query, params);
    // Convert tags string -> array
    const jobs = rows.map(job => ({
      ...job,
      tags: job.tags ? job.tags.split(',') : []
    }));
    return res.json(jobs);
  } catch (err) {
    console.error('Get jobs error:', err);
    return res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/jobs/:id  — single job details
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT j.*, u.name AS recruiter_name, u.company_name
       FROM jobs j JOIN users u ON j.posted_by = u.id
       WHERE j.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Job not found.' });

    const job = { ...rows[0], tags: rows[0].tags ? rows[0].tags.split(',') : [] };
    return res.json(job);
  } catch (err) {
    console.error('Get job error:', err);
    return res.status(500).json({ error: 'Failed to fetch job.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/jobs  — recruiter posts a new job
// ─────────────────────────────────────────────
router.post('/', verifyToken, requireRole('recruiter', 'admin'), async (req, res) => {
  const { title, location, salary, description, tags, company } = req.body;

  if (!title) return res.status(400).json({ error: 'Job title is required.' });

  const tagsString = Array.isArray(tags) ? tags.join(',') : (tags || '');

  try {
    const [result] = await db.execute(
      `INSERT INTO jobs (title, company, location, salary, description, tags, posted_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [
        title,
        company || req.user.company_name || 'Unknown',
        location || '',
        salary || '',
        description || '',
        tagsString,
        req.user.id
      ]
    );
    return res.status(201).json({ message: 'Job posted successfully.', jobId: result.insertId });
  } catch (err) {
    console.error('Post job error:', err);
    return res.status(500).json({ error: 'Failed to post job.' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/jobs/:id  — recruiter edits their job
// ─────────────────────────────────────────────
router.put('/:id', verifyToken, requireRole('recruiter', 'admin'), async (req, res) => {
  const { title, location, salary, description, tags, status } = req.body;
  const tagsString = Array.isArray(tags) ? tags.join(',') : (tags || '');

  try {
    const [rows] = await db.execute('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Job not found.' });

    // Only the poster or admin can edit
    if (req.user.role !== 'admin' && rows[0].posted_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this job.' });
    }

    await db.execute(
      `UPDATE jobs SET title=?, location=?, salary=?, description=?, tags=?, status=? WHERE id=?`,
      [title, location, salary, description, tagsString, status || rows[0].status, req.params.id]
    );
    return res.json({ message: 'Job updated successfully.' });
  } catch (err) {
    console.error('Update job error:', err);
    return res.status(500).json({ error: 'Failed to update job.' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/jobs/:id  — recruiter or admin deletes
// ─────────────────────────────────────────────
router.delete('/:id', verifyToken, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Job not found.' });

    if (req.user.role !== 'admin' && rows[0].posted_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this job.' });
    }

    await db.execute('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Job deleted successfully.' });
  } catch (err) {
    console.error('Delete job error:', err);
    return res.status(500).json({ error: 'Failed to delete job.' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/jobs/:id/report  — any logged-in user reports a job
// ─────────────────────────────────────────────
router.patch('/:id/report', verifyToken, async (req, res) => {
  try {
    await db.execute(`UPDATE jobs SET status = 'Reported' WHERE id = ?`, [req.params.id]);
    return res.json({ message: 'Job reported.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to report job.' });
  }
});

module.exports = router;
