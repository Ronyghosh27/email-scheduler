
import "dotenv/config";
import express from "express";
import prisma from "./config/prisma.js";
import emailRoutes from "./routes/emailRoutes.js";
import session from "express-session";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import pg from "pg";
import connectPgSimple from "connect-pg-simple";
import gmailRoutes from "./routes/gmailRoutes.js";
import cors from "cors";

const { Pool } = pg;

const PgSession = connectPgSimple(session);

const sessionPool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
// Middleware
app.set("trust proxy", 1);

app.use(cors({
    origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:5173"
    ],
    credentials: true
}));

app.use(express.json());
app.use(
    session({
        store: new PgSession({
            pool: sessionPool,
            createTableIfMissing: true
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
}
    })
);

app.use(passport.initialize());
app.use(passport.session());


// Email routes
app.use("/api/emails", emailRoutes);
app.use("/auth", authRoutes);
app.use("/auth/gmail", gmailRoutes);
// Home route
app.get("/", (req, res) => {
    res.send("Welcome to Email Scheduler Backend!");
});

// API status
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "Email Scheduler API is working!",
        status: "active"
    });
});

app.get("/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({
            isAuthenticated: false,
            user: null
        });
    }

    res.json({
        isAuthenticated: true,
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        }
    });
});

// Database test
app.get("/api/db-test", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            success: true,
            message: "PostgreSQL connected successfully!"
        });

    } catch (error) {
        console.error("Database connection failed:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed!"
        });
    }
});

// Start server
async function startServer() {
    try {
        await prisma.$connect();

        console.log("PostgreSQL connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
