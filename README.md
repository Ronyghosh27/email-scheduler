# MailFlow – Email Scheduler

MailFlow is a full-stack email scheduling application that allows users to connect their Gmail accounts, compose emails, schedule messages, and manage their email activity through a web-based dashboard.

## Features

- User authentication with Google OAuth 2.0
- User authentication with email and password
- Gmail account integration
- Compose and schedule emails
- View and manage scheduled emails
- Update and delete scheduled emails
- Track email processing status
- Background email job processing with BullMQ
- Persistent login sessions
- Dashboard with email statistics
- Email details and management pages
- Help Center and application settings

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS 4
- Lucide React

### Backend

- Node.js
- Express.js
- Passport.js
- Google OAuth 2.0
- Gmail API

### Database and Background Processing

- PostgreSQL
- Prisma ORM 7
- Redis
- BullMQ

### Authentication and Security

- Passport.js
- express-session
- connect-pg-simple
- bcryptjs
- Token encryption

## Project Structure

```text
email-scheduler/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── prisma/
│   │   └── migrations/
│   ├── queues/
│   ├── routes/
│   ├── utils/
│   ├── workers/
│   ├── .env.example
│   ├── package.json
│   ├── prisma7.config.ts
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── data/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Prerequisites

Make sure you have the following installed and configured:

- Node.js and npm
- PostgreSQL
- Redis
- Google Cloud project with OAuth 2.0 credentials
- A Google account with Gmail access

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Ronyghosh27/email-scheduler.git

cd email-scheduler
```

### 2. Backend setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your environment file:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Configure the following environment variables in `backend/.env`:

| Variable                   | Description                             |
| -------------------------- | --------------------------------------- |
| DATABASE_URL               | PostgreSQL connection string            |
| GOOGLE_CLIENT_ID           | Google OAuth client ID                  |
| GOOGLE_CLIENT_SECRET       | Google OAuth client secret              |
| GOOGLE_CALLBACK_URL        | Google login callback URL               |
| GOOGLE_GMAIL_CALLBACK_URL  | Gmail connection callback URL           |
| SESSION_SECRET             | Secret used for session management      |
| REDIS_URL                  | Redis connection URL                    |
| GMAIL_TOKEN_ENCRYPTION_KEY | 64-character hexadecimal encryption key |

**Important:** Never commit your actual `.env` file or expose OAuth credentials, session secrets, or encryption keys.

### 3. Configure PostgreSQL and Redis

Create a PostgreSQL database for the application and configure its connection string in `backend/.env`.

Make sure your Redis server is running and configure `REDIS_URL`.

### 4. Configure Google OAuth

Create OAuth 2.0 credentials in the Google Cloud Console.

Configure the authorized redirect URIs to match the callback URLs in your environment file.

Enable the required Google APIs, including the Gmail API.

### 5. Run Prisma migrations

From the `backend` directory:

```bash
npx prisma migrate deploy --config prisma7.config.ts
```

Generate Prisma Client:

```bash
npx prisma generate --config prisma7.config.ts
```

### 6. Start the backend server

```bash
npm start
```

The backend API will run at:

```text
http://localhost:5000
```

### 7. Start the email worker

Open a separate terminal and navigate to the backend directory:

```bash
cd backend
```

Start the BullMQ worker:

```bash
node workers/emailWorker.js
```

The worker processes background email jobs using Redis and BullMQ.

### 8. Frontend setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## Available Scripts

### Backend

| Command                                                | Description                  |
| ------------------------------------------------------ | ---------------------------- |
| `npm install`                                          | Install backend dependencies |
| `npm start`                                            | Start the Express server     |
| `node workers/emailWorker.js`                          | Start the email worker       |
| `npx prisma migrate deploy --config prisma7.config.ts` | Apply database migrations    |
| `npx prisma generate --config prisma7.config.ts`       | Generate Prisma Client       |

### Frontend

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm install`     | Install frontend dependencies     |
| `npm run dev`     | Start the development server      |
| `npm run build`   | Build the frontend for production |
| `npm run lint`    | Run ESLint                        |
| `npm run preview` | Preview the production build      |

## API Endpoints

| Method | Endpoint       | Description                 |
| ------ | -------------- | --------------------------- |
| GET    | `/`            | Backend welcome message     |
| GET    | `/api/status`  | API status                  |
| GET    | `/api/db-test` | Test PostgreSQL connection  |
| GET    | `/auth/me`     | Check authentication status |
| `/`    | `/api/emails`  | Email management routes     |
| `/`    | `/auth`        | Authentication routes       |
| `/`    | `/auth/gmail`  | Gmail connection routes     |

## Development Notes

- The frontend communicates with the backend at `http://localhost:5000`.
- The backend uses PostgreSQL for persistent data and session storage.
- Redis and BullMQ are used for background email processing.
- The API server and email worker must run as separate processes.
- Environment variables are required for database, authentication, Gmail, and Redis configuration.

## Project Status

MailFlow is an actively developed full-stack project. Features and functionality may evolve as development continues.

## Author

**Rony Ghosh**

GitHub: [@Ronyghosh27](https://github.com/Ronyghosh27)

## License

This project is currently available under the repository's existing license configuration.
