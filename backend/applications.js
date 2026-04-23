const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── Multer config for resume uploads ─────────────────
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // e.g. resume_userId_timestamp.pdf
    const safeName = `resume_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed.'));
  }
});

// ─────────────────────────────────────────────
// POST /api/applications  — seeker applies to a job
// Form-data: job_id, cover_letter (text), resume (file)
// ─────────────────────────────────────────────
router.post('/', verifyToken, requireRole('seeker'), upload.single('resume'), async (req, res) => {
  const { job_id, cover_letter } = req.body;

  if (!job_id) return res.status(400).json({ error: 'job_id is required.' });

  const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : null;

  try {
    // Check job exists
    const [jobRows] = await db.execute('SELECT id FROM jobs WHERE id = ? AND status = "Active"', [job_id]);
    if (jobRows.length === 0) return res.status(404).json({ error: 'Job not found or no longer active.' });

    // Insert application (UNIQUE key prevents duplicates)
    await db.execute(
      `INSERT INTO applications (job_id, user_id, resume_path, cover_letter, status)
       VALUES (?, ?, ?, ?, 'Pending')`,
      [job_id, req.user.id, resumePath, cover_letter || null]
    );

    // Increment applicant count on job
    await db.execute('UPDATE jobs SET applicants = applicants + 1 WHERE id = ?', [job_id]);

    return res.status(201).json({ message: 'Application submitted successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You have already applied to this job.' });
    }
    console.error('Apply error:', err);
    return res.status(500).json({ error: 'Failed to submit application.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/applications/my  — seeker's own applications
// ─────────────────────────────────────────────
router.get('/my', verifyToken, requireRole('seeker'), async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.*, j.title AS job_title, j.company, j.location
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.user_id = ?
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    console.error('Get my applications error:', err);
    return res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/applications/job/:jobId  — recruiter sees applicants for their job
// ─────────────────────────────────────────────
router.get('/job/:jobId', verifyToken, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.*, u.name, u.email, u.experience, u.degree
       FROM applications a
       JOIN users u ON a.user_id = u.id
       WHERE a.job_id = ?
       ORDER BY a.applied_at DESC`,
      [req.params.jobId]
    );
    return res.json(rows);
  } catch (err) {
    console.error('Get job applications error:', err);
    return res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/applications/:id  — get one application detail
// ─────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.*, u.name, u.email, u.experience, u.degree,
              j.title AS job_title, j.company
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN jobs  j ON a.job_id  = j.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Application not found.' });

    const app = rows[0];
    // Only the applicant or the recruiter (who posted) or admin can view
    if (req.user.role === 'seeker' && app.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    return res.json(app);
  } catch (err) {
    console.error('Get application error:', err);
    return res.status(500).json({ error: 'Failed to fetch application.' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/applications/:id/status  — recruiter accepts or rejects
// Body: { status: 'Accepted' | 'Rejected' }
// ─────────────────────────────────────────────
router.patch('/:id/status', verifyToken, requireRole('recruiter', 'admin'), async (req, res) => {
  const { status } = req.body;

  if (!['Accepted', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Accepted or Rejected.' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM applications WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Application not found.' });

    await db.execute('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    return res.json({ message: `Application ${status}.` });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ error: 'Failed to update status.' });
  }
});

module.exports = router;
