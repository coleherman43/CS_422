# Flock Manager - UOSW Membership Tracking System

A comprehensive full-stack web application for managing University of Oregon Student Workers Union (UOSW) membership, events, attendance tracking, and communications.

**🌐 Live Application:** [https://frontend-production-cbc3.up.railway.app](https://frontend-production-cbc3.up.railway.app)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Features in Detail](#features-in-detail)
- [Deployment](#deployment)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

Flock Manager is a membership management system designed specifically for the UO Student Workers Union. It provides tools for:

- **Member Management**: Registration, profile management, and status tracking
- **Event Management**: Create, organize, and track union events and meetings
- **Attendance Tracking**: QR code-based check-in system for events
- **Communication**: Email notifications and bulk email capabilities
- **Reporting**: Statistics and reports on membership and event attendance

The application uses a modern tech stack with a React frontend and Node.js/Express backend, connected to a PostgreSQL database.

---

## ✨ Features

### Member Management
- Member registration with comprehensive profiles
- Search and filter members by workplace, status, dues, and more
- Edit and update member information
- Track membership status (active, inactive, graduated, suspended)
- Track dues status (paid, unpaid, exempt)
- Member statistics and analytics

### Event Management
- Create and manage events with details (title, date, location, description)
- View upcoming and past events
- Event attendance tracking
- Generate QR codes for event check-ins
- Event statistics and attendance summaries

### Attendance System
- QR code generation for events
- Public check-in page accessible via QR code scan
- Name-based and UO ID-based check-in
- Time-limited QR codes with expiration
- Prevent duplicate check-ins
- Automatic email confirmations

### Communication
- Email notifications for member registration
- Check-in confirmation emails
- Bulk email to filtered member groups
- Filter by workplace, dues status, membership status, or search
- HTML email templates with professional styling
- Support for multiple email providers (SMTP, SendGrid, Resend)

### Reporting & Analytics
- Membership statistics dashboard
- Event attendance summaries
- Member activity reports
- Workplace distribution analytics

### Authentication & Security
- Magic link authentication via email
- Firebase authentication integration
- JWT token-based sessions
- Protected routes and API endpoints
- Role-based access control (ready for implementation)

---

## 🛠 Tech Stack

### Frontend
- **React 18.3** - UI framework
- **React Router 7** - Client-side routing
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Firebase** - Authentication

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Firebase Admin SDK** - Server-side authentication
- **JWT** - Token-based authentication
- **Nodemailer** - Email service
- **QRCode** - QR code generation

### Infrastructure
- **Railway** - Hosting and deployment
- **PostgreSQL** - Database hosting (Railway)
- **Docker** - Containerization support

---

## 📁 Project Structure

```
CS_422/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── routes/        # Route configuration
│   │   ├── styles/        # CSS stylesheets
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── config.js      # Configuration
│   ├── Dockerfile         # Docker configuration
│   └── package.json
│
├── server/                 # Node.js backend API
│   ├── config/            # Configuration files
│   │   ├── db.js          # Database connection
│   │   └── firebase.js    # Firebase configuration
│   ├── controllers/       # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API route definitions
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utility functions
│   │   ├── emailService.js
│   │   ├── qrCodeService.js
│   │   └── validateInput.js
│   ├── db/                # Database files
│   │   ├── schema.sql     # Database schema
│   │   ├── seed.sql       # Seed data
│   │   ├── migrations/    # Database migrations
│   │   └── data-dictionary.md
│   ├── scripts/           # Utility scripts
│   ├── tests/             # Test files
│   ├── Dockerfile         # Docker configuration
│   ├── server.js          # Main server file
│   └── package.json
│
├── .gitignore
├── README.md              # This file
└── package.json           # Root package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **PostgreSQL** 12 or higher (for local development)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CS_422
   ```

2. **Install dependencies**
   
   Install all dependencies (root, server, and client):
   ```bash
   npm run install:all
   ```
   
   Or install separately:
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   
   **Server** (`server/.env`):
   ```bash
   cp server/.env-example server/.env
   ```
   
   Edit `server/.env` and configure:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/flock_manager
   
   # Server
   NODE_ENV=development
   PORT=5000
   
   # Authentication (optional for local dev)
   JWT_SECRET=your-secret-key-here
   QR_CODE_SECRET=your-secret-key-here
   
   # Firebase (optional for local dev)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   
   # Email (optional - see EMAIL_SETUP.md)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=UOSW Administration <your-email@gmail.com>
   
   # Optional: Email service APIs (overrides SMTP)
   SENDGRID_API_KEY=your-sendgrid-api-key
   RESEND_API_KEY=your-resend-api-key
   ```

   **Client** (`client/.env` or environment variables):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   ```

4. **Set up the database**
   
   See detailed instructions in [DATABASE_SETUP.md](server/DATABASE_SETUP.md)
   
   Quick setup:
   ```bash
   # Create database
   createdb flock_manager
   
   # Run schema
   psql -U postgres -d flock_manager -f server/db/schema.sql
   
   # (Optional) Seed with sample data
   psql -U postgres -d flock_manager -f server/db/seed.sql
   ```

5. **Start the development servers**
   
   **Option 1: Run separately**
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev
   
   # Terminal 2 - Start frontend
   cd client
   npm start
   ```
   
   **Option 2: Use root scripts**
   ```bash
   # Start backend
   npm run server:dev
   
   # Start frontend (in another terminal)
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

---

## ⚙️ Configuration

### Database Configuration

See [server/DATABASE_SETUP.md](server/DATABASE_SETUP.md) for detailed database setup instructions.

**Key points:**
- PostgreSQL database required
- Connection string format: `postgresql://user:password@host:port/database`
- Schema is in `server/db/schema.sql`
- Seed data available in `server/db/seed.sql`

### Email Configuration

See [server/EMAIL_SETUP.md](server/EMAIL_SETUP.md) for detailed email setup instructions.

**Supported providers:**
- **Gmail**: SMTP with app password
- **SendGrid**: API key (recommended for production)
- **Resend**: API key (recommended for production)
- **Any SMTP provider**: Generic SMTP configuration

**Email features:**
- Member registration confirmations
- Check-in confirmations
- Bulk emails to filtered member groups
- HTML templates with fallback to plain text
- Graceful fallback to console logging if not configured

### Firebase Authentication

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Email/Password authentication
3. Generate a service account key
4. Add credentials to `server/.env`:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   ```
5. Add Firebase config to client environment variables

---

## 📡 API Documentation

### Base URL
- Local: `http://localhost:5000/api`
- Production: `https://your-backend-url.railway.app/api`

### Authentication

Most endpoints require authentication via Bearer token:
```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/request-login` - Request magic link login
- `POST /api/auth/verify` - Verify login token
- `GET /api/auth/me` - Get current user (authenticated)

#### Members (`/api/members`)
- `GET /api/members` - List all members (with optional filters)
  - Query params: `workplace_id`, `dues_status`, `membership_status`, `search`, `limit`, `offset`
- `POST /api/members` - Register new member
- `GET /api/members/:id` - Get member by ID
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `GET /api/members/stats` - Get member statistics
- `GET /api/members/workplace/:workplaceId` - Get members by workplace
- `POST /api/members/send-email` - Send email to filtered members (authenticated)
  - Query params: Same filters as GET /api/members
  - Body: `{ subject: string, message: string }`

#### Events (`/api/events`)
- `GET /api/events` - List all events (with optional filters)
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/:id/attendance` - Get event attendance
- `POST /api/events/:id/checkin` - Check in member to event
  - Body: `{ name: string, uo_id?: string, qr_code_token: string }`
- `GET /api/events/:id/qr-code` - Generate QR code for event
- `GET /api/events/:id/qr-code-image` - Get QR code as PNG image

#### Roles (`/api/roles`)
- `GET /api/roles` - List all roles
- `POST /api/roles` - Create new role
- `GET /api/roles/:id` - Get role by ID
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

#### Workplaces (`/api/workplaces`)
- `GET /api/workplaces` - List all workplaces
- `POST /api/workplaces` - Create new workplace
- `GET /api/workplaces/:id` - Get workplace by ID
- `PUT /api/workplaces/:id` - Update workplace
- `DELETE /api/workplaces/:id` - Delete workplace

#### Reports (`/api/reports`)
- `GET /api/reports/members` - Generate member reports
- `GET /api/reports/events` - Generate event reports
- `GET /api/reports/attendance` - Generate attendance reports

### Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

---

## 🎨 Features in Detail

### QR Code Check-In System

1. **Generate QR Code**: Event organizers generate a QR code for an event
2. **Time-Limited Tokens**: QR codes contain JWT tokens that expire (default: 2 hours)
3. **Public Check-In Page**: Members scan QR code and are redirected to check-in page
4. **Name-Based Check-In**: Members enter their name and optional UO ID
5. **Duplicate Prevention**: System prevents multiple check-ins for the same member/event
6. **Email Confirmation**: Automatic email sent after successful check-in

### Bulk Email System

1. **Filter Members**: Apply filters (workplace, dues status, membership status, search)
2. **Preview Count**: See how many members will receive the email
3. **Compose Message**: Write subject and message content
4. **Send**: Email sent to all matching members
5. **Privacy**: Uses BCC for multiple recipients
6. **Templates**: Professional HTML email templates

### Member Filtering

Members can be filtered by:
- **Workplace**: Filter by specific workplace (EMU, Library, etc.)
- **Dues Status**: paid, unpaid, or exempt
- **Membership Status**: active, inactive, graduated, or suspended
- **Search**: Search by name or email

---

## 🚢 Deployment

### Railway Deployment

The application is configured for Railway deployment.

**Backend:**
1. Connect your GitHub repository to Railway
2. Railway will auto-detect the Node.js project
3. Add environment variables in Railway dashboard:
   - `DATABASE_URL` (provided by Railway PostgreSQL service)
   - `NODE_ENV=production`
   - Email configuration variables
   - Firebase configuration
   - JWT secrets

**Frontend:**
1. Create a new service in Railway
2. Connect to the same repository
3. Set root directory to `client`
4. Add environment variables:
   - `REACT_APP_API_URL` (your backend URL)
   - Firebase configuration variables
4. Railway will build and deploy automatically

**Database:**
1. Add PostgreSQL service in Railway
2. Railway provides `DATABASE_URL` automatically
3. Run migrations if needed (see [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md))

### Docker Deployment

Both client and server include Dockerfiles for containerization.

**Build and run:**
```bash
# Build server
cd server
docker build -t flock-manager-server .
docker run -p 5000:5000 --env-file .env flock-manager-server

# Build client
cd client
docker build -t flock-manager-client .
docker run -p 3000:3000 --env-file .env flock-manager-client
```

---

## 💻 Development

### Available Scripts

**Root:**
- `npm run dev` - Start server in development mode
- `npm run server` - Start server
- `npm run server:dev` - Start server with nodemon
- `npm run client` - Start client
- `npm run install:all` - Install all dependencies

**Server (`cd server`):**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests with coverage
- `npm run test:watch` - Run tests in watch mode

**Client (`cd client`):**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Code Structure

- **Controllers**: Handle HTTP requests and business logic
- **Models**: Database interaction layer
- **Routes**: Define API endpoints
- **Middleware**: Authentication, error handling, validation
- **Utils**: Reusable utility functions

### Database Migrations

To run migrations:
```bash
cd server
node scripts/runMigrationSimple.js
```

Or manually:
```bash
psql $DATABASE_URL -f db/migrations/001_update_qr_token_length.sql
```

---

## 🧪 Testing

### Backend Tests

```bash
cd server
npm test
```

Tests cover:
- Database models
- Controllers
- API endpoints
- Utilities

### Test Coverage

Coverage reports are generated in `server/coverage/`. Open `coverage/lcov-report/index.html` in a browser to view detailed coverage.

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error: "DATABASE_URL is not configured"**
- Ensure `.env` file exists in `server/` directory
- Check that `DATABASE_URL` is set correctly
- Verify PostgreSQL is running locally

**Error: "connection refused"**
- Check if PostgreSQL is running: `pg_isready`
- Verify port 5432 is accessible
- Check firewall settings

### Email Not Sending

- Verify email configuration in `.env`
- For Gmail, ensure app password is used (not regular password)
- Check email service logs in console
- Service will log to console if not configured (development mode)

### QR Code Check-In Not Working

- Verify QR code token hasn't expired (default: 2 hours)
- Check member name matches exactly (case-insensitive, handles spacing)
- Ensure member exists in database
- Check server logs for detailed error messages

### Authentication Issues

- Verify Firebase credentials are correct
- Check that Firebase project has Email/Password auth enabled
- Ensure `JWT_SECRET` is set in environment variables
- Clear browser localStorage if having login issues

### CORS Errors

- Verify `API_URL` in client config matches backend URL
- Check CORS is enabled in server (should be by default)
- Ensure credentials are included in requests

---

## 📚 Additional Documentation

- [Database Setup Guide](server/DATABASE_SETUP.md) - Detailed database configuration
- [Email Setup Guide](server/EMAIL_SETUP.md) - Email service configuration
- [Data Dictionary](server/db/data-dictionary.md) - Database schema documentation
- [Migration Instructions](MIGRATION_INSTRUCTIONS.md) - Database migration guide

---

## 📄 License

This project is part of University of Oregon CS 422 coursework. All rights reserved.

---

## 👥 Credits

**CS-422 Team** - Alexia Crawford, Cole Herman, Iveth Dominguez-Avendano, Sam Spurlock

---

**Last Updated:** December 2025
