const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// GET /api/jobs — fetch all jobs
const getAllJobs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        BIN_TO_UUID(j.job_id)   AS id,
        BIN_TO_UUID(j.comp_id)  AS comp_id,
        j.job_title              AS title,
        j.job_desc               AS description,
        j.salary                 AS salary_lpa,
        j.location,
        j.experience,
        j.skills                AS skills,
        r.comp_name             AS company_name
      FROM jobs j
      LEFT JOIN recruiter_info r ON j.comp_id = r.comp_id
      ORDER BY j.job_id DESC
    `);

    // Normalise for the frontend's JobContext formatter
    const jobs = rows.map((job) => ({
      ...job,
      salary_lpa: job.salary_lpa ? Number(job.salary_lpa) : null,
      tags: job.skills ? job.skills.split(",").map((s) => s.trim()) : [],
    }));

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/jobs/:id — single job
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
        BIN_TO_UUID(j.job_id)  AS id,
        BIN_TO_UUID(j.comp_id) AS comp_id,
        j.job_title             AS title,
        j.job_desc              AS description,
        j.salary                AS salary_lpa,
        j.location,
        j.experience,
        j.skills                AS skills,
        r.comp_name             AS company_name
      FROM jobs j
      LEFT JOIN recruiter_info r ON j.comp_id = r.comp_id
      WHERE j.job_id = UUID_TO_BIN(?)`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    const job = rows[0];
    job.tags = job.skills ? job.skills.split(",").map((s) => s.trim()) : [];

    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/jobs — recruiter posts a new job (protected)
const createJob = async (req, res) => {
  try {
    const recruiterId = req.user.id; // from JWT middleware
    const { title, description, salary, location, skills, experience } = req.body;

    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: "Only recruiters can post jobs" });
    }

    if (!title || !location) {
      return res.status(400).json({ message: "Title and location are required" });
    }

    const job_id = uuidv4();

    await pool.query(
      `INSERT INTO jobs (job_id, comp_id, job_title, job_desc, salary, location, skills, experience)
       VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)`,
      [job_id, recruiterId, title, description || "", salary || null, location, skills || "", experience || ""]
    );

    res.status(201).json({ message: "Job posted successfully", jobId: job_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/jobs/:id — recruiter or admin deletes a job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM applied_jobs WHERE job_id = UUID_TO_BIN(?)", [id]);
    const [result] = await pool.query(
      "DELETE FROM jobs WHERE job_id = UUID_TO_BIN(?)",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/jobs/:id — recruiter updates a job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user.id;
    const { title, description, salary, location, skills, experience } = req.body;

    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: "Only recruiters can update jobs" });
    }

    const [result] = await pool.query(
      `UPDATE jobs 
       SET job_title = ?, job_desc = ?, salary = ?, location = ?, skills = ?, experience = ?
       WHERE job_id = UUID_TO_BIN(?) AND comp_id = UUID_TO_BIN(?)`,
      [title, description || "", salary || null, location, skills || "", experience || "", id, recruiterId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    res.json({ message: "Job updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllJobs, getJobById, createJob, deleteJob, updateJob };