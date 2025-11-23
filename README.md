# Flock Manager - UOSW Membership Tracking System

A full-stack application for managing UO Student Workers Union (UOSW) membership, events, and attendance.

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js/Express backend API

## Features

- Member registration and management
- Event creation and tracking
- Attendance check-in system
- Email notifications (see [Email Setup Guide](server/EMAIL_SETUP.md))
- Reports and statistics

## Email Service

The application includes a fully functional email service that sends:
- Member confirmation emails
- Check-in confirmation emails
- Event reminders
- Dues reminders
- General announcements

See [server/EMAIL_SETUP.md](server/EMAIL_SETUP.md) for configuration instructions.

## Getting Started

### Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create `.env` file):
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/flock_manager
   NODE_ENV=development
   PORT=5000
   
   # Optional: Email configuration (see EMAIL_SETUP.md)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=UOSW Administration <your-email@gmail.com>
   ```

4. Set up the database (run SQL scripts in `server/db/`):
   - `schema.sql` - Creates database tables
   - `seed.sql` - Populates with sample data

5. Start the server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Email Service

The email service is implemented and ready to use. It will automatically:
- Send confirmation emails when members register
- Send confirmation emails when members check in to events

If email is not configured, the service will log emails to the console instead, allowing development without email setup.

For detailed email configuration instructions, see [server/EMAIL_SETUP.md](server/EMAIL_SETUP.md).

