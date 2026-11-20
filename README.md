# Email Scheduler

An email scheduling application built with Node.js, Express, PostgreSQL, and Prisma.

## Current Features

- Google OAuth 2.0 authentication using Passport.js
- Persistent login sessions using PostgreSQL
- Create scheduled emails
- View scheduled emails
- Update scheduled emails
- Delete scheduled emails
- User-specific email management

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Passport.js, Google OAuth 2.0
- **Session Management:** express-session, connect-pg-simple

## Prerequisites

- Node.js
- PostgreSQL
- Google Cloud OAuth credentials

## Installation

1. Clone the repository:

   ```bash
   git clone YOUR_REPOSITORY_URL
   cd email-scheduler
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file using `.env.example` as a reference.

4. Configure your database connection and Google OAuth credentials in `.env`.

5. Apply database migrations:

   ```bash
   npx prisma migrate deploy
   ```

6. Generate Prisma Client:

   ```bash
   npx prisma generate
   ```

7. Start the backend:

   ```bash
   npm start
   ```

The backend runs at `http://localhost:5000`.

## Project Status

Backend authentication and email CRUD operations are implemented. Automated email delivery and the frontend are still under development.
