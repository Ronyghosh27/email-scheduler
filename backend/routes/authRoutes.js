import express from "express";
import passport from "../config/passport.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import prisma from "../config/prisma.js";

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many attempts. Please try again later."
    }
});

const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many password reset attempts. Please try again later."
    }
});

const normalizeEmail = (email) =>
    typeof email === "string" ? email.trim().toLowerCase() : "";

const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password) =>
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 128 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password);

const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

const logInUser = (req, user) =>
    new Promise((resolve, reject) => {
        req.logIn(user, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });

router.get("/me", (req, res) => {
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

router.post("/register", authLimiter, async (req, res) => {
    try {
        const name = typeof req.body.name === "string" ? req.body.name.trim().slice(0, 100) : "";
        const email = normalizeEmail(req.body.email);
        const { password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password fields are required."
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address."
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be 8-128 characters and include at least one letter and one number."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            if (existingUser.googleId) {
                return res.status(409).json({
                    success: false,
                    message: "An account with this email already exists. Continue with Google."
                });
            }

            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash
            }
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully! You can now log in."
        });
    } catch (error) {
        console.error("Registration failed:", error);
        res.status(500).json({
            success: false,
            message: "Unable to create account."
        });
    }
});

router.post("/login", authLimiter, async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password, rememberMe } = req.body;

        if (!email || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user?.passwordHash) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        await logInUser(req, user);

        req.session.cookie.maxAge = rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;

        res.json({
            success: true,
            message: "Signed in successfully.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Password login failed:", error);
        res.status(500).json({
            success: false,
            message: "Unable to sign in."
        });
    }
});

router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
    const email = normalizeEmail(req.body.email);

    if (!email || !isValidEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid email address."
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user?.passwordHash) {
            const resetToken = crypto.randomBytes(32).toString("hex");

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordResetHash: hashToken(resetToken),
                    passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000)
                }
            });
        }

        res.json({
            success: true,
            message: "If an account exists for that email, password reset instructions will be available once email delivery is configured.",
            emailDeliveryConfigured: false
        });
    } catch (error) {
        console.error("Forgot password failed:", error);
        res.status(500).json({
            success: false,
            message: "Unable to process password reset."
        });
    }
});

router.post("/reset-password", passwordResetLimiter, async (req, res) => {
    const token = typeof req.body.token === "string" ? req.body.token : "";
    const { password, confirmPassword } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Reset token is required."
        });
    }

    if (!isValidPassword(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be 8-128 characters and include at least one letter and one number."
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match."
        });
    }

    try {
        const tokenHash = hashToken(token);
        const user = await prisma.user.findFirst({
            where: {
                passwordResetHash: tokenHash,
                passwordResetExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "This reset link is invalid or has expired."
            });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: await bcrypt.hash(password, 12),
                passwordResetHash: null,
                passwordResetExpires: null
            }
        });

        res.json({
            success: true,
            message: "Password reset successfully."
        });
    } catch (error) {
        console.error("Password reset failed:", error);
        res.status(500).json({
            success: false,
            message: "Unable to reset password."
        });
    }
});

// Start Google login
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

// Google redirects here after authentication
router.get(
    "/google/callback",
    passport.authenticate("google", {
    failureRedirect: process.env.FRONTEND_URL
}),
    (req, res) => {
        res.redirect(process.env.FRONTEND_URL);
    }
);

// Logout
const logoutHandler = (req, res, next) => {
    req.logout((error) => {
        if (error) {
            return next(error);
        }

        req.session.destroy((error) => {
            if (error) {
                return next(error);
            }

            res.clearCookie("connect.sid");
            if (req.method === "POST") {
                return res.json({
                    success: true,
                    message: "Signed out successfully."
                });
            }

            res.redirect(process.env.FRONTEND_URL);
        });
    });
};

router.get("/logout", logoutHandler);
router.post("/logout", logoutHandler);

export default router;