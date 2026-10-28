# Hotelier — Hotel Management Platform

Hotelier is a customized full-stack hotel management and reservation project built with the MERN stack: MongoDB, Express.js, React, and Node.js. The application combines a guest-facing hotel browsing and booking experience with role-based tools for administration, front-desk operations, housekeeping, and room turnover.

> **Project status:** This is a development/demo project. Successful local login and frontend build have been verified by the maintainer, but not every workflow has been tested end to end. Review the production-readiness notes before using real customer data or accepting payments.

## Highlights

- **Guest experience:** hotel and room browsing, room details, availability search, registration/login, booking history, and booking flows.
- **Role-based workspaces:** guest, staff, and administrator routes and dashboards.
- **Booking logic:** date-overlap checks intended to prevent conflicting reservations, booking status management, cancellations, and check-in/check-out workflows.
- **Housekeeping and maintenance:** housekeeping task tracking, room-turnover prioritization, and safeguards that keep a room from being released as available while active maintenance work remains.
- **Payments:** Razorpay integration hooks plus a separately gated simulated-payment mode for development/testing. Simulated payments are not real transactions.
- **Operational tools:** in-app notifications, reviews, service requests, invoice/receipt views, and administrative reporting.
- **Security-related changes:** centralized JWT configuration and startup validation, role-aware authorization, and demo-payment restrictions for production environments.

Some features depend on database records and environment configuration. The contact form and newsletter are demo interactions and do not send or persist submissions.

## Technology

### Frontend
- React and Vite
- React Router
- Bootstrap and custom CSS
- Axios
- Recharts
- Lucide React and React Toastify

### Backend
- Node.js and Express
- MongoDB and Mongoose
- JWT authentication and bcrypt password hashing
- Helmet, CORS configuration, and rate limiting
- express-validator
- Multer for uploads
- Nodemailer integration (SMTP must be configured for actual email delivery)

## Repository structure

```text
Hotelier/
├── backend/
│   ├── config/          # Database, JWT and payment-mode configuration
│   ├── controllers/     # API handlers
│   ├── middleware/      # Authentication and request middleware
│   ├── models/          # MongoDB/Mongoose models
│   ├── routes/          # Express routes
│   ├── services/        # Booking, payment and turnover logic
│   ├── tests/           # Backend tests
│   ├── utils/           # Database seeding utilities
│   ├── .env.example
│   └── index.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Requirements

Install the following before running the app:

- Node.js 18 or newer (Node.js 24 has been used during local development)
- npm
- A reachable MongoDB database: either a local MongoDB Community Server or a MongoDB Atlas connection string

The app will not have database-backed functionality unless `MONGODB_URI` points to a running, reachable database. If MongoDB Server is not installed locally, use a configured Atlas URI or install/start MongoDB before running the backend.

## Local setup on Windows

Run commands in separate PowerShell commands/windows. Do not start the launcher more than once while the frontend and backend are already running.

### 1. Configure the backend

```powershell
cd "C:\path\to\Hotelier\backend"
npm install
Copy-Item .env.example .env
```

Open `backend/.env` and set the required values. At minimum, set a reachable MongoDB URI and a unique JWT secret.

Generate a JWT secret locally:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Copy the generated value into `JWT_SECRET` in `backend/.env`. Do not commit `.env` or paste the generated secret into issues, screenshots, or this README.

Typical local backend values:

```dotenv
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/hotelpro
JWT_SECRET=<replace-with-a-unique-generated-secret>
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
DEMO_PAYMENT_MODE=false
UPLOAD_STORAGE_MODE=local
```

The `hotelpro` segment in the default MongoDB URI is just a database name; it does not need to match the visible Hotelier brand. Keep any additional email/Razorpay settings from `backend/.env.example` as needed. Never use placeholder payment keys for real checkout.

Start the backend:

```powershell
npm start
```

The API is expected at `http://localhost:5000` when the configured port is 5000. Check the terminal for both the database connection message and server startup message.

### 2. Configure the frontend

Open a second PowerShell window:

```powershell
cd "C:\path\to\Hotelier\frontend"
npm install
Copy-Item .env.example .env
```

The local frontend environment typically uses:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder
```

Start Vite:

```powershell
npm run dev
```

Open `http://localhost:5173`.

### 3. Optional database seeding

If you need sample hotel/room data and your environment provides the seed script, review `backend/utils/seed.js` first, then run:

```powershell
cd "C:\path\to\Hotelier\backend"
node utils/seed.js
```

**Warning:** Seeding may create, update, or reset sample records. Do not run it against a database containing data you need to preserve. Use a dedicated development database.

## Payment and demo behavior

- `DEMO_PAYMENT_MODE` should remain `false` unless you are deliberately testing simulated payments.
- Simulated payments are only intended for `NODE_ENV=development` or `test`, and the application is designed to block this mode in production.
- A successful demo payment does not charge money and is not proof that a live payment integration is production-ready.
- Use Razorpay test credentials for testing the real gateway flow. Keep all payment secrets in environment variables.

**Before accepting real payments:** verify the Razorpay order and payment on the server, including captured/paid status, expected order ownership, amount, and currency. Signature verification alone should not be treated as full payment settlement verification. Complete integration tests with test credentials before enabling live payments.

## Tests and build

Run backend tests from the backend directory:

```powershell
cd "C:\path\to\Hotelier\backend"
npm test
```

Build the frontend for production:

```powershell
cd "C:\path\to\Hotelier\frontend"
npm run build
```

A successful frontend build checks compilation, not every user journey. Before submission or deployment, manually test registration/login, room browsing, booking, role-specific access, maintenance release behavior, and payment-mode restrictions.

## Configuration and privacy

- `.env`, `backend/.env`, and `frontend/.env` are local configuration files and must not be committed.
- Keep `.env.example` limited to blank values and clearly fake placeholders.
- Never publish JWT secrets, database credentials, SMTP passwords, or Razorpay secrets.
- The contact form and newsletter are demo-only interactions; they do not deliver or save messages.
- Do not use real personal/customer data in the demo environment.
- The seeded/demo credentials, if enabled by the local seed script, are for local testing only. Change or remove them before any shared deployment.

## Current limitations / production checklist

Before using Hotelier as a live service:

1. Complete server-side payment/order reconciliation and test the failure, retry, refund, amount, currency, and captured-status paths.
2. Configure production MongoDB, TLS, CORS origins, JWT secret, SMTP, uploads/storage, and hosting environment variables.
3. Replace demo-only contact/newsletter interactions with real form handling, validation, persistence, and spam protection—or keep them clearly labeled as non-functional.
4. Test all guest, staff, and administrator workflows, including authorization boundaries.
5. Review logging, error handling, backups, monitoring, and data-retention requirements.
6. Confirm licensing/permission for the upstream project before redistribution.

## Attribution

This customized project is based on the publicly accessible [HotelPro repository by 12HarshPatidar](https://github.com/12HarshPatidar/HotelPro), with additional local changes and Hotelier branding. Please review the upstream repository's licensing and obtain any required permission before redistributing the derivative work. This README does not claim a separate license for upstream code.

---

Hotelier is a learning and demonstration project. Feature descriptions are not a guarantee that every workflow is production-ready.
