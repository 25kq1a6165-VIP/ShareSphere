# ShareSphere — “Share Resources. Unlock Possibilities.”

ShareSphere is a complete, full-stack, responsive, and secure web application designed for universities, colleges, and research institutes to easily share and book expensive laboratory equipment, instruments, meeting rooms, maker spaces, and classrooms.

---

## 🌟 Key Features

### 🎓 1. For Students & Researchers
* **Explore Catalog:** Search and filter active instruments and spaces by category, availability, and hourly rate.
* **Smart Booking Engine:** Instant conflict detection prevents double-booking. Duration limits and operating hours are enforced at the database level.
* **Session Lifecycle:** Track reservation status across all states (`Pending` → `Approved` → `Checked In` → `Completed`).
* **Condition Inspections:** Record equipment condition notes before use (Check-in) and after use (Check-out).
* **Incident Reporting:** File safety or hardware malfunction reports directly from active sessions.
* **In-App Notifications:** Real-time updates when booking requests are approved, declined, or need action.

### 🔬 2. For Resource Owners & Lab Directors
* **Listing Management:** Publish equipment with detailed rules, safety guidelines, training requirements, and operating schedules.
* **Approval Authority:** Review, approve, or reject student requests with custom feedback.
* **Availability Schedules:** Configure weekly operating hours and schedule maintenance blackout windows.
* **Condition & Incident Logs:** Inspect check-in reports and resolve reported faults.

### 🛡️ 3. For System Administrators
* **User Directory:** Search and manage researcher accounts with instant account suspension/activation.
* **Resource Moderation:** Review and moderate listed instruments across all departments.
* **Booking Oversight:** Global view of all reservations and active sessions across the campus.
* **Forensic Audit Trail:** Immutable log of authentication attempts, reservations, status transitions, and administrative operations.
* **System Telemetry:** Real-time diagnostic cards showing API health, database connectivity, and uptime.

---

## 🚀 Technology Stack

* **Frontend:** React 19, Vite, Tailwind CSS, Lucide React, React Router DOM v7, Axios.
* **Backend:** Node.js, Express.js, REST APIs, Zod, bcryptjs, JSON Web Tokens (JWT), Cookie-Parser, Helmet, CORS.
* **Database:** MySQL 8.0+ / MariaDB (fully compatible with MySQL Workbench), with SQL schema, constraints, indexes, and seed records.
* **Resilient Architecture:** Built-in dual-mode database adapter allows complete application execution out-of-the-box, seamlessly switching to live MySQL when running.

---

## 🔑 Demonstration Accounts

All demonstration accounts share the password: `Password123!`

The login page includes **1-Click Demonstration Buttons** to immediately sign in as any role:

| Role | Name | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Alex Rivera | `student@sharesphere.edu` | `Password123!` | Explore, Book, Check-in, Incident Report |
| **Student 2** | Emma Watson | `student2@sharesphere.edu` | `Password123!` | Explore, Book, Check-in |
| **Lab Owner** | Dr. Sarah Jenkins | `owner@sharesphere.edu` | `Password123!` | FE-SEM Lab, PCR, Request Approvals |
| **Owner 2** | Prof. Robert Vance | `owner2@sharesphere.edu` | `Password123!` | 3D Printer, Studio 402, GPU Cluster |
| **Administrator** | System Admin | `admin@sharesphere.edu` | `Password123!` | Full Moderation, Users, Audit Logs |

---

## 💻 Quick Start Guide (Easy Setup)

### 1. Prerequisites
* **Node.js:** v18.0.0 or later (Node v20+ recommended)
* **npm:** v9.0.0 or later
* *(Optional)* **MySQL:** MySQL Server 8.0+, XAMPP, or MySQL Workbench

### 2. Installation
Open your terminal in the `Wecoders` project directory and run:

```bash
# Install both backend and frontend dependencies in one command:
npm run setup
```

### 3. Start Development Servers
Start both the backend server and frontend interface simultaneously:

```bash
npm run dev
```

* **Frontend Application:** [http://localhost:5173](http://localhost:5173)
* **Backend REST API:** [http://localhost:5000](http://localhost:5000)
* **API Health Telemetry:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🗄️ MySQL Database Setup (Optional for Local MySQL)

ShareSphere includes a resilient local database adapter that runs immediately without configuration. To connect your local MySQL server:

1. Ensure MySQL is running on port 3306.
2. Edit `.env` or create `server/.env` with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=sharesphere
   ```
3. Initialize the database schema and demonstration data:
   ```bash
   npm run db:init
   ```

You can also import `database/schema.sql` and `database/seed.sql` directly using **MySQL Workbench**.

---

## 🧪 Automated Testing

Run the automated integration test suite:

```bash
npm test
```

The automated test suite verifies:
* Account registration and login
* Password hashing and credential rejection
* Role authorization boundaries (preventing student access to admin areas)
* Resource creation, editing, and search filtering
* Booking request lifecycle
* Concurrency check: **Rejection of overlapping reservations (double-booking prevention)**
* Backend `/api/health` diagnostic checks

---

## 📁 Project Architecture

```
sharesphere/
├── client/                     # Frontend React + Vite
│   ├── src/
│   │   ├── components/         # Common, Resource, and Booking components
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── layouts/            # PublicLayout, DashboardLayout
│   │   ├── pages/
│   │   │   ├── public/         # Home, Explore, Details, About, Contact, Login, Register
│   │   │   ├── student/        # Dashboard, MyBookings, Details, Notifications, Profile
│   │   │   ├── owner/          # Dashboard, MyResources, Add, Edit, Requests, Availability
│   │   │   └── admin/          # Dashboard, Users, Moderation, Bookings, Incidents, Audit Logs
│   │   ├── routes/             # ProtectedRoute
│   │   └── services/           # Axios API Client
│   └── package.json
├── server/                     # Backend Node.js + Express
│   ├── src/
│   │   ├── config/             # Database connection pool & Environment config
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, Role, Validation, Rate Limiting, Error handling
│   │   ├── routes/             # Express API routers
│   │   ├── services/           # Business logic & Transactions
│   │   ├── utils/              # JWT signing, resilient DB adapter
│   │   ├── validators/         # Zod schemas
│   │   ├── app.js              # Express app
│   │   └── server.js           # Server entrypoint
│   ├── tests/                  # Integration test suite
│   └── package.json
├── database/
│   ├── schema.sql              # MySQL DDL with FKs, constraints, and indexes
│   └── seed.sql                # Demonstration records & pre-hashed passwords
├── scripts/
│   └── dev.js                  # Unified parallel dev server launcher
├── .env.example                # Environment variables template
├── .gitignore
├── package.json                # Root package with unified scripts
└── README.md
```

---

## 🌐 Production Deployment Guide

### Frontend Deployment (Vercel)
1. Push the repository to GitHub.
2. In Vercel, import the repository and set the Root Directory to `client`.
3. Set Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`.
4. Deploy.

### Backend Deployment (Render)
1. In Render, create a new Web Service and point to the repository.
2. Set Root Directory to `server`.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Set Environment Variables:
   * `NODE_ENV=production`
   * `JWT_SECRET=your_long_secure_secret_key`
   * `CLIENT_URL=https://your-frontend.vercel.app`
   * `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (from your hosted MySQL provider like Aiven, PlanetScale, or Railway).

---

## 📜 Demonstration Scenario Walkthrough

Follow this 5-minute walkthrough to demonstrate ShareSphere's complete workflow:

1. **Visit [http://localhost:5173](http://localhost:5173)** to see the homepage with real-time statistics and featured resources.
2. Click **Log In** and select **🔬 Lab Owner** (Dr. Sarah Jenkins).
3. From the **Owner Dashboard**, view pending booking requests and facility utilization.
4. Click **Log Out**, then select **🎓 Student** (Alex Rivera).
5. Navigate to **Explore Resources**, search for `Microscope`, and click on **Field Emission Scanning Electron Microscope**.
6. Select tomorrow's date, 10:00 to 12:00, enter a research purpose, and click **Submit Booking Request**.
7. Observe the confirmation alert and switch to **My Bookings** to see your booking in `Pending` status.
8. Switch back to the **Owner** account: Click **Booking Requests**, view the request, and click **Approve**.
9. Log back in as **Student**: Observe the booking is now `Approved`. Click **Record Check In** to record the initial condition report!
#   S h a r e S p h e r e  
 