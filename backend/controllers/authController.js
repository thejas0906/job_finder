const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const generateToken = require("../utils/generateToken");


// REGISTER
const register = async (req, res) => {

  try {

    const {
      email,
      password,
      role,
      seeker_name,
      age,
      degree,
      experience,
      expected_salary,
      field,
      work_mode,
      location
    } = req.body;

    // check if user exists
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate uuid
    const user_id = uuidv4();

    // insert into users table
    await pool.query(
      `INSERT INTO users (user_id, email, password, role)
       VALUES (UUID_TO_BIN(?), ?, ?, ?)`,
      [user_id, email, hashedPassword, role]
    );

    // insert into seeker_info if role = seeker
    if (role === "seeker") {

      await pool.query(
        `INSERT INTO seeker_info
        (seeker_id, seeker_name, age, degree, experience, expected_salary, field, work_mode, location)
        VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          seeker_name,
          age,
          degree,
          experience,
          expected_salary,
          field,
          work_mode,
          location
        ]
      );

    }

    // insert into recruiter_info if recruiter
    if (role === "recruiter") {

      await pool.query(
        `INSERT INTO recruiter_info
        (comp_id)
        VALUES (UUID_TO_BIN(?))`,
        [user_id]
      );

    }

    const token = generateToken(user_id);

    res.json({
      message: "User registered successfully",
      token
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};



// LOGIN
const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const [users] = await pool.query(
      `SELECT BIN_TO_UUID(user_id) as user_id, email, password, role
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = generateToken(user.user_id);

    res.json({
      message: "Login successful",
      role: user.role,
      token
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};



// FORGOT PASSWORD (basic placeholder)
const forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    const [users] = await pool.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Password reset feature coming soon"
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};


module.exports = {
  register,
  login,
  forgotPassword
};