const pool          = require("../config/db");
const bcrypt        = require("bcryptjs");
const { v4: uuidv4} = require("uuid");
const generateToken = require("../utils/generateToken");
const nodemailer    = require("nodemailer");

// ─── In-memory OTP store  { email → { otp, expiresAt } } ─────────────────────
const otpStore = new Map();

// Nodemailer transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,          // SSL on port 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ─── REGISTER ────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const {
      // Frontend sends "name" not "seeker_name", and "companyName" for recruiter
      name,
      email,
      password,
      phone,
      role,
      // Seeker-specific
      age,
      degree,
      experience,
      expectedSalary,   // frontend key: expectedSalary
      skills,           // frontend key: skills
      // Recruiter-specific
      companyName,      // frontend key: companyName
      location,
      workMode,         // frontend key: workMode
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password and role are required" });
    }

    // Check duplicate
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user_id = uuidv4();

    // Insert into users
    await pool.query(
      `INSERT INTO users (user_id, email, password, role)
       VALUES (UUID_TO_BIN(?), ?, ?, ?)`,
      [user_id, email, hashedPassword, role]
    );

    // Insert role-specific info
    if (role === "seeker") {
      await pool.query(
        `INSERT INTO seeker_info
         (seeker_id, seeker_name, age, degree, experience, expected_salary, location, work_mode)
         VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          name || null,
          age || null,
          degree || null,
          experience || null,
          expectedSalary || null,   // map frontend key → DB column
          location || null,
          workMode || null,
        ]
      );

      // Insert skills into seeker_info (skills column) if provided
      if (skills) {
        await pool.query(
          `UPDATE seeker_info SET field = ? WHERE seeker_id = UUID_TO_BIN(?)`,
          [skills, user_id]
        );
      }

      // Insert uploaded resume filename into seeker_resume
      if (req.file) {
        const resumeFilename = req.file.filename;
        await pool.query(
          `INSERT INTO seeker_resume (seeker_id, resume)
           VALUES (UUID_TO_BIN(?), ?)
           ON DUPLICATE KEY UPDATE resume = VALUES(resume)`,
          [user_id, resumeFilename]
        );
      }
    }

    if (role === "recruiter") {
      await pool.query(
        `INSERT INTO recruiter_info (comp_id, comp_name, phone, location)
         VALUES (UUID_TO_BIN(?), ?, ?, ?)`,
        [user_id, companyName || name || null, phone || null, location || null]
      );
    }

    const token = generateToken(user_id, role);

    // Frontend reads: data.userId  and  data.role
    res.json({
      message: "User registered successfully",
      token,
      userId: user_id,
      role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [users] = await pool.query(
      `SELECT BIN_TO_UUID(user_id) AS user_id, email, password, role
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.user_id, user.role);

    // Frontend reads: data.userId  and  data.role
    res.json({
      message: "Login successful",
      token,
      userId: user.user_id,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── FORGOT PASSWORD — Step 1: send OTP ──────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const [users] = await pool.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );
    if (users.length === 0)
      return res.status(404).json({ error: "No account found with that email" });

    // Generate 6-digit OTP and store it for 10 minutes
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    console.log(`\n=========================================`);
    console.log(`OTP for ${email}: ${otp}`);
    console.log(`=========================================\n`);

    // Send OTP email (wrap in its own try/catch so it doesn't block the flow if it fails)
    try {
      await transporter.sendMail({
        from: `"Hirely" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Your Hirely Password Reset OTP",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e2e8f0">
            <h2 style="color:#6366f1">Hirely — Password Reset</h2>
            <p>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
            <div style="font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#1e293b;text-align:center;padding:24px 0">${otp}</div>
            <p style="color:#64748b;font-size:0.9rem">If you did not request this, ignore this email.</p>
          </div>`,
      });
      console.log("Email sent successfully.");
    } catch (emailError) {
      console.error("Failed to send email, but OTP was generated and logged to console:", emailError.message);
      // We don't throw here, so the user can still proceed with the OTP from the console!
    }

    res.json({ message: "OTP sent to your email (or check server console)" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── VERIFY OTP — Step 2 ──────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    const record = otpStore.get(email);
    if (!record)       return res.status(400).json({ error: "OTP not found. Request a new one." });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP expired. Request a new one." });
    }
    if (record.otp !== otp.trim())
      return res.status(400).json({ error: "Incorrect OTP" });

    // OTP valid — mark as verified (keep in store for reset step)
    otpStore.set(email, { ...record, verified: true });
    res.json({ message: "OTP verified" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── RESET PASSWORD — Step 3 ──────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ error: "Email and new password are required" });

    const record = otpStore.get(email);
    if (!record || !record.verified)
      return res.status(403).json({ error: "OTP not verified. Start the process again." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE email = ?", [hashed, email]);

    // Clean up OTP store
    otpStore.delete(email);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { register, login, forgotPassword, verifyOtp, resetPassword };