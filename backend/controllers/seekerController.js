const pool = require("../config/db");

// GET /api/seekers/me
const getSeekerProfile = async (req, res) => {
  try {
    const id = req.user.id;   

    const [rows] = await pool.query(
      `SELECT
        BIN_TO_UUID(si.seeker_id) AS id,
        u.email,
        si.seeker_name             AS name,
        si.age,
        si.degree,
        si.experience,
        si.expected_salary,
        si.field,
        si.work_mode,
        si.location,
        sr.resume
       FROM seeker_info si
       JOIN users u ON si.seeker_id = u.user_id
       LEFT JOIN seeker_resume sr ON si.seeker_id = sr.seeker_id
       WHERE si.seeker_id = UUID_TO_BIN(?)`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Seeker not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/seekers/me
// JobSeekerDashboard sends: { name, email, skills, experience }
const updateSeekerProfile = async (req, res) => {
  try {
    const id = req.user.id;   // from JWT

    const {
      name,
      age,
      degree,
      experience,
      expected_salary,
      field,
      work_mode,
      location,
    } = req.body;

    const [existing] = await pool.query(
      "SELECT 1 FROM seeker_info WHERE seeker_id = UUID_TO_BIN(?)",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Seeker not found" });
    }

    await pool.query(
      `UPDATE seeker_info
       SET seeker_name    = ?,
           age            = ?,
           degree         = ?,
           experience     = ?,
           expected_salary= ?,
           field          = ?,
           work_mode      = ?,
           location       = ?
       WHERE seeker_id = UUID_TO_BIN(?)`,
      [name, age, degree, experience, expected_salary, field, work_mode, location, id]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/seekers/me/resume
const updateResume = async (req, res) => {
  try {
    const id = req.user.id;   
    const { resumePath } = req.body;

    if (!resumePath) {
      return res.status(400).json({ message: "resumePath is required" });
    }

    await pool.query(
      `INSERT INTO seeker_resume (seeker_id, resume)
       VALUES (UUID_TO_BIN(?), ?)
       ON DUPLICATE KEY UPDATE resume = VALUES(resume)`,
      [id, resumePath]
    );

    res.json({ message: "Resume updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getSeekerProfile, updateSeekerProfile, updateResume };