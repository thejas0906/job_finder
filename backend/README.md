# Hirely Backend — Setup Guide

## Folder Structure
```
hirely-backend/
├── server.js              # Entry point
├── db.js                  # MySQL connection pool
├── schema.sql             # Run this FIRST to create DB + tables
├── package.json
├── .env.example           # Copy to .env and fill values
├── middleware/
│   └── auth.js            # JWT verify + role guard
├── routes/
│   ├── auth.js            # /api/register  /api/login
│   ├── jobs.js            # /api/jobs
│   ├── applications.js    # /api/applications
│   ├── admin.js           # /api/admin/*
│   └── users.js           # /api/users/*
└── uploads/
    └── resumes/           # PDF resumes saved here (auto-created)
```

---

## Step-by-Step Setup

### Step 1 — Install MySQL
- Download MySQL Community Server from https://dev.mysql.com/downloads/
- Remember the root password you set during install

### Step 2 — Create the Database
Open MySQL terminal or MySQL Workbench and run:
```bash
mysql -u root -p < schema.sql
```
This creates `hirely_db` with all tables + seed data (admin + sample recruiter + sample job).

### Step 3 — Clone / Copy this backend folder into your project
Your repo structure should look like:
```
hirely/
├── hirely-frontend/   (your existing React app)
└── hirely-backend/    (this folder)
```

### Step 4 — Install dependencies
```bash
cd hirely-backend
npm install
```

### Step 5 — Configure environment variables
```bash
cp .env.example .env
```
Open `.env` and set your MySQL password:
```
DB_PASSWORD=your_actual_mysql_password
JWT_SECRET=any_long_random_string_you_choose
```

### Step 6 — Start the server
```bash
npm run dev      # development (auto-restarts on file change)
# or
npm start        # production
```
You should see: `Server running on http://localhost:5000`

### Step 7 — Test it's working
Open browser and go to: http://localhost:5000/api/health
You should see: `{"status":"OK","message":"Hirely API running"}`

---

## API Endpoints Quick Reference

### Auth
| Method | URL | Body | Auth |
|--------|-----|------|------|
| POST | /api/register | name, email, password, phone, role, ... | No |
| POST | /api/login | emailOrPhone, password | No |

### Jobs
| Method | URL | Auth |
|--------|-----|------|
| GET | /api/jobs | No |
| GET | /api/jobs/:id | No |
| POST | /api/jobs | Recruiter |
| PUT | /api/jobs/:id | Recruiter/Admin |
| DELETE | /api/jobs/:id | Recruiter/Admin |

### Applications
| Method | URL | Auth |
|--------|-----|------|
| POST | /api/applications | Seeker |
| GET | /api/applications/my | Seeker |
| GET | /api/applications/job/:jobId | Recruiter |
| GET | /api/applications/:id | Seeker/Recruiter |
| PATCH | /api/applications/:id/status | Recruiter |

### Admin
| Method | URL | Auth |
|--------|-----|------|
| GET | /api/admin/stats | Admin |
| GET | /api/admin/users | Admin |
| DELETE | /api/admin/users/:id | Admin |
| GET | /api/admin/jobs | Admin |
| DELETE | /api/admin/jobs/:id | Admin |

### Users
| Method | URL | Auth |
|--------|-----|------|
| GET | /api/users/me | Any |
| PUT | /api/users/me | Any |
| GET | /api/users/saved | Seeker |
| POST | /api/users/saved/:jobId | Seeker |
| DELETE | /api/users/saved/:jobId | Seeker |

---

## Seed Credentials (for testing)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hirely.com | password |
| Recruiter | hr@techflow.com | password |

---

## Frontend Changes Needed
After login, save the JWT token to localStorage:
```js
// In Login.jsx and Register.jsx — after successful response:
localStorage.setItem('token', data.token);
localStorage.setItem('userId', data.userId);
localStorage.setItem('userRole', data.role);
```

Send the token with every protected API call:
```js
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/jobs', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```
