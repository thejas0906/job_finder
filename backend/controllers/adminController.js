const pool = require("../config/db");

// GET /api/admin/stats — platform statistics
const getStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query(
      "SELECT COUNT(*) AS totalUsers FROM users"
    );

    const [[{ totalJobs }]] = await pool.query(
      "SELECT COUNT(*) AS totalJobs FROM jobs"
    );

    const [[{ totalApplications }]] = await pool.query(
      "SELECT COUNT(*) AS totalApplications FROM applied_jobs"
    );

    const [[{ totalSeekers }]] = await pool.query(
      "SELECT COUNT(*) AS totalSeekers FROM users WHERE role = 'seeker'"
    );

    const [[{ totalRecruiters }]] = await pool.query(
      "SELECT COUNT(*) AS totalRecruiters FROM users WHERE role = 'recruiter'"
    );

    res.json({
      totalUsers,
      totalJobs,
      totalApplications,
      totalSeekers,
      totalRecruiters,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/users — list all users
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        BIN_TO_UUID(user_id) AS id,
        email,
        role
       FROM users
       ORDER BY role, email`
    );

    // Enrich seekers with their name
    const enriched = await Promise.all(
      rows.map(async (user) => {
        if (user.role === "seeker") {
          const [si] = await pool.query(
            "SELECT seeker_name AS name FROM seeker_info WHERE seeker_id = UUID_TO_BIN(?)",
            [user.id]
          );
          return { ...user, name: si[0]?.name || user.email };
        }
        if (user.role === "recruiter") {
          const [ri] = await pool.query(
            "SELECT comp_name AS name FROM recruiter_info WHERE comp_id = UUID_TO_BIN(?)",
            [user.id]
          );
          return { ...user, name: ri[0]?.name || user.email };
        }
        return { ...user, name: user.email };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/users/:id — remove a user and related data
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cascade-delete related rows (MySQL foreign keys may handle this,
    // but we do it explicitly for safety)
    await pool.query("DELETE FROM applied_jobs WHERE seeker_id = UUID_TO_BIN(?)", [id]);
    await pool.query("DELETE FROM seeker_resume WHERE seeker_id = UUID_TO_BIN(?)", [id]);
    await pool.query("DELETE FROM seeker_info WHERE seeker_id = UUID_TO_BIN(?)", [id]);

    // Delete jobs posted by this recruiter first
    const [jobs] = await pool.query(
      "SELECT BIN_TO_UUID(job_id) AS job_id FROM jobs WHERE comp_id = UUID_TO_BIN(?)",
      [id]
    );
    for (const job of jobs) {
      await pool.query(
        "DELETE FROM applied_jobs WHERE job_id = UUID_TO_BIN(?)",
        [job.job_id]
      );
    }
    await pool.query("DELETE FROM jobs WHERE comp_id = UUID_TO_BIN(?)", [id]);
    await pool.query("DELETE FROM recruiter_info WHERE comp_id = UUID_TO_BIN(?)", [id]);

    const [result] = await pool.query(
      "DELETE FROM users WHERE user_id = UUID_TO_BIN(?)",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/jobs — all jobs for moderation
const getAllJobsAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        BIN_TO_UUID(j.job_id)  AS id,
        j.job_title             AS title,
        r.comp_name             AS company,
        j.location,
        j.salary,
        (SELECT COUNT(*) FROM applied_jobs aj WHERE aj.job_id = j.job_id) AS applicants
       FROM jobs j
       LEFT JOIN recruiter_info r ON j.comp_id = r.comp_id
       ORDER BY j.job_id DESC`
    );

    res.json(rows.map((j) => ({ ...j, status: "Active" })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/jobs/:id — force delete a job
const forceDeleteJob = async (req, res) => {
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

    res.json({ message: "Job force-deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStats, getAllUsers, deleteUser, getAllJobsAdmin, forceDeleteJob };