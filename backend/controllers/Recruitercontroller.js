const pool = require("../config/db");

// GET /api/recruiters/me
const getRecruiterProfile = async (req, res) => {
  try {
    const id = req.user.id;   // from JWT

    const [rows] = await pool.query(
      `SELECT
        BIN_TO_UUID(r.comp_id) AS id,
        u.email,
        r.comp_name,
        r.phone,
        r.location
       FROM recruiter_info r
       JOIN users u ON r.comp_id = u.user_id
       WHERE r.comp_id = UUID_TO_BIN(?)`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/recruiters/me
const updateRecruiterProfile = async (req, res) => {
  try {
    const id = req.user.id;   // from JWT — was wrongly using req.params.id
    const { comp_name, phone, location } = req.body;

    const [existing] = await pool.query(
      "SELECT 1 FROM recruiter_info WHERE comp_id = UUID_TO_BIN(?)",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    await pool.query(
      `UPDATE recruiter_info
       SET comp_name = ?, phone = ?, location = ?
       WHERE comp_id = UUID_TO_BIN(?)`,
      [comp_name, phone, location, id]
    );

    res.json({ message: "Recruiter profile updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/recruiters/me/jobs
const getRecruiterJobs = async (req, res) => {
  try {
    const id = req.user.id;   // from JWT — was wrongly using req.params.id

    const [rows] = await pool.query(
      `SELECT
        BIN_TO_UUID(j.job_id)  AS id,
        j.job_title             AS title,
        j.job_desc              AS description,
        j.salary                AS salary_lpa,
        j.location,
        j.skillls               AS skills,
        r.comp_name             AS company_name,
        (SELECT COUNT(*) FROM applied_jobs aj WHERE aj.job_id = j.job_id) AS applicants
       FROM jobs j
       LEFT JOIN recruiter_info r ON j.comp_id = r.comp_id
       WHERE j.comp_id = UUID_TO_BIN(?)
       ORDER BY j.job_id DESC`,
      [id]
    );

    const jobs = rows.map((job) => ({
      ...job,
      tags: job.skills ? job.skills.split(",").map((s) => s.trim()) : [],
      status: "Active",
    }));

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getRecruiterProfile, updateRecruiterProfile, getRecruiterJobs };