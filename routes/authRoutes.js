import express from "express";
import passport from "../config/passport.js";

const router = express.Router();

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
        failureRedirect: "/login"
    }),
    (req, res) => {
        res.send("Google login successful!");
    }
);

// Logout
router.get("/logout", (req, res, next) => {
    req.logout((error) => {
        if (error) {
            return next(error);
        }

        req.session.destroy((error) => {
            if (error) {
                return next(error);
            }

            res.clearCookie("connect.sid");
            res.send("Logged out successfully!");
        });
    });
});

export default router;