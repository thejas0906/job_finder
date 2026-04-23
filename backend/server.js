const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded resumes statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Hirely API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
