
import express from "express";
import crypto from "node:crypto";
import googleOAuthClient from "../config/googleOAuth.js";
import { google } from "googleapis";
import prisma from "../config/prisma.js";
import { encryptToken } from "../utils/tokenEncryption.js";

const router = express.Router();

// Require an authenticated user
router.use((req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "Please log in first!"
    });
});

// Start Gmail authorization
router.get("/connect", (req, res) => {
    const state = crypto.randomBytes(32).toString("hex");

    // Store state in the user's session
    req.session.gmailOAuthState = state;

    const authorizationUrl = googleOAuthClient.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "openid",
            "email",
            "https://www.googleapis.com/auth/gmail.send"
        ],
        state
    });

    req.session.save((error) => {
        if (error) {
            console.error("Failed to save OAuth session:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to start Gmail authorization!"
            });
        }

        res.redirect(authorizationUrl);
    });
});


router.get("/callback", async (req, res) => {
    try {
        const { code, state } = req.query;

        // Verify OAuth state to prevent CSRF
        const savedState = req.session.gmailOAuthState;

        if (!savedState || !state || state !== savedState) {
            return res.status(403).json({
                success: false,
                message: "Invalid OAuth state!"
            });
        }

        delete req.session.gmailOAuthState;

        if (!code || typeof code !== "string") {
            return res.status(400).json({
                success: false,
                message: "Authorization code missing!"
            });
        }

        // Create a separate OAuth client for this callback
        const oauthClient = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_GMAIL_CALLBACK_URL
        );

        // Exchange authorization code for tokens
        const { tokens } = await oauthClient.getToken(code);

        if (!tokens.refresh_token) {
            return res.status(400).json({
                success: false,
                message: "Refresh token not received. Please reconnect Gmail with consent."
            });
        }

        oauthClient.setCredentials(tokens);

        // Retrieve the connected Gmail address
        const oauth2 = google.oauth2({
            auth: oauthClient,
            version: "v2"
        });

        const { data } = await oauth2.userinfo.get();

        if (!data.email || !data.verified_email) {
            return res.status(400).json({
                success: false,
                message: "Could not verify Gmail account!"
            });
        }

        // Encrypt the refresh token
        const encryptedToken = encryptToken(tokens.refresh_token);

        // Save Gmail connection against logged-in user
        await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                gmailEmail: data.email,
                gmailRefreshTokenEncrypted: encryptedToken,
                gmailConnectedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: "Gmail connected successfully!",
            gmailEmail: data.email
        });

    } catch (error) {
        console.error("Gmail authorization failed:", error);

        res.status(500).json({
            success: false,
            message: "Failed to connect Gmail!"
        });
    }
});

export default router;
