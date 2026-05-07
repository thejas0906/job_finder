const pool = require("../config/db");

// POST /api/applications — seeker applies to a job
const applyToJob = async (req, res) => {
  try {
    // jobId and seekerId come from the frontend body; seekerId also available via JWT
    const { jobId, seekerId } = req.body;

    const resolvedSeekerId = seekerId || req.user?.id;

    if (!jobId || !resolvedSeekerId) {
      return res.status(400).json({ message: "jobId and seekerId are required" });
    }

    // Check for duplicate application
    const [existing] = await pool.query(
      `SELECT 1 FROM applied_jobs
       WHERE job_id = UUID_TO_BIN(?) AND seeker_id = UUID_TO_BIN(?)`,
      [jobId, resolvedSeekerId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Already applied to this job" });
    }

    await pool.query(
      `INSERT INTO applied_jobs (job_id, seeker_id, status)
       VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), 'Pending')`,
      [jobId, resolvedSeekerId]
    );

    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/seekers/me/applications — all applications for a seeker
const getSeekerApplications = async (req, res) => {
  try {
    const id = req.user.id;

    const [rows] = await pool.query(
      `SELECT
        BIN_TO_UUID(aj.job_id)    AS id,
        BIN_TO_UUID(aj.job_id)    AS job_id,
        j.job_title               AS title,
        r.comp_name               AS company,
        aj.status
       FROM applied_jobs aj
       JOIN jobs j ON aj.job_id = j.job_id
       LEFT JOIN recruiter_info r ON j.comp_id = r.comp_id
       WHERE aj.seeker_id = UUID_TO_BIN(?)`,
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/jobs/:jobId/applications — all applicants for a job (recruiter view)
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const [rows] = await pool.query(
      `SELECT
        BIN_TO_UUID(aj.seeker_id) AS id,
        si.seeker_name            AS name,
        u.email,
        si.experience,
        aj.status,
        j.job_title               AS job,
        sr.resume                 AS resume
       FROM applied_jobs aj
       JOIN seeker_info si    ON aj.seeker_id = si.seeker_id
       JOIN users u           ON aj.seeker_id = u.user_id
       JOIN jobs j            ON aj.job_id = j.job_id
       LEFT JOIN seeker_resume sr ON aj.seeker_id = sr.seeker_id
       WHERE aj.job_id = UUID_TO_BIN(?)`,
      [jobId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/applications/:seekerId — single application detail (recruiter review page)
const getApplicationById = async (req, res) => {
  try {
    const { seekerId } = req.params;
    const { jobId } = req.query;

    let query = `
      SELECT
        BIN_TO_UUID(aj.seeker_id) AS id,
        si.seeker_name            AS name,
        u.email,
        si.experience,
        si.degree,
        si.field,
        aj.status,
        j.job_title               AS jobTitle,
        sr.resume
      FROM applied_jobs aj
      JOIN seeker_info si    ON aj.seeker_id = si.seeker_id
      JOIN users u           ON aj.seeker_id = u.user_id
      JOIN jobs j            ON aj.job_id    = j.job_id
      LEFT JOIN seeker_resume sr ON aj.seeker_id = sr.seeker_id
      WHERE aj.seeker_id = UUID_TO_BIN(?)
    `;
    const params = [seekerId];

    if (jobId) {
      query += " AND aj.job_id = UUID_TO_BIN(?)";
      params.push(jobId);
    }

    query += " LIMIT 1";

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/applications/:seekerId/status — accept or reject
const updateApplicationStatus = async (req, res) => {
  try {
    const { seekerId } = req.params;
    const { status, jobId } = req.body;

    const allowed = ["Pending", "Accepted", "Rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const [result] = await pool.query(
      `UPDATE applied_jobs
       SET status = ?
       WHERE seeker_id = UUID_TO_BIN(?)
         AND job_id = UUID_TO_BIN(?)`,
      [status, seekerId, jobId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: `Application marked as ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  applyToJob,
  getSeekerApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
};