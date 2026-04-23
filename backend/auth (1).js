const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();
const SALT_ROUNDS = 10;

// ─────────────────────────────────────────────
// POST /api/register
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const {
    name, email, password, phone, role,
    age, degree, experience, expectedSalary,
    companyName, location
  } = req.body;

  if (!name || !email || !password || !phone || !role) {
    return res.status(400).json({ error: 'Name, email, password, phone and role are required.' });
  }

  const validRoles = ['seeker', 'recruiter', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  try {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await db.execute(
      `INSERT INTO users
        (name, email, phone, password_hash, role, age, degree, experience, expected_salary, company_name, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, email, phone, password_hash, role,
        age || null,
        degree || null,
        experience || null,
        expectedSalary || null,
        companyName || null,
        location || null
      ]
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, role, name, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ userId, role, token, name });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email or phone already registered.' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/login
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: 'Email/phone and password are required.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      [emailOrPhone, emailOrPhone]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ userId: user.id, role: user.role, token, name: user.name });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

module.exports = router;
