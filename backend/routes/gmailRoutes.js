
import express from "express";
import crypto from "node:crypto";
import googleOAuthClient from "../config/googleOAuth.js";
import { google } from "googleapis";
import prisma from "../config/prisma.js";
import {
    encryptToken,
    decryptToken
} from "../utils/tokenEncryption.js";

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

// Check Gmail connection status
router.get("/status", async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id
            },
            select: {
                gmailEmail: true,
                gmailConnectedAt: true
            }
        });

        res.json({
            success: true,
            isConnected: Boolean(user?.gmailEmail),
            gmailEmail: user?.gmailEmail || null,
            connectedAt: user?.gmailConnectedAt || null
        });

    } catch (error) {
        console.error("Failed to check Gmail status:", error);

        res.status(500).json({
            success: false,
            message: "Failed to check Gmail connection status!"
        });
    }
});

// Disconnect Gmail
router.delete("/disconnect", async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id
            },
            select: {
                gmailRefreshTokenEncrypted: true
            }
        });

        if (!user?.gmailRefreshTokenEncrypted) {
            return res.status(400).json({
                success: false,
                message: "Gmail is not connected!"
            });
        }

        const refreshToken = decryptToken(
            user.gmailRefreshTokenEncrypted
        );

        const oauthClient = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_GMAIL_CALLBACK_URL
        );

        await oauthClient.revokeToken(refreshToken);

        await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                gmailEmail: null,
                gmailRefreshTokenEncrypted: null,
                gmailConnectedAt: null
            }
        });

        return res.json({
            success: true,
            message: "Gmail disconnected successfully!"
        });

    } catch (error) {
        console.error("Gmail disconnection failed:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to disconnect Gmail!"
        });
    }
});

// Start Gmail authorization
router.get("/connect", (req, res) => {
    const state = crypto.randomBytes(32).toString("hex");

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

        return res.redirect(authorizationUrl);
    });
});

// Gmail OAuth callback
router.get("/callback", async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL;

    try {
        const { code, state, error } = req.query;

        // Handle authorization cancellation or denial
        if (error) {
            return res.redirect(`${frontendUrl}/?gmail=error`);
        }

        // Verify OAuth state
        const savedState = req.session.gmailOAuthState;

        if (!savedState || !state || state !== savedState) {
            return res.redirect(`${frontendUrl}/?gmail=error`);
        }

        delete req.session.gmailOAuthState;

        if (!code || typeof code !== "string") {
            return res.redirect(`${frontendUrl}/?gmail=error`);
        }

        const oauthClient = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_GMAIL_CALLBACK_URL
        );

        // Exchange authorization code for tokens
        const { tokens } = await oauthClient.getToken(code);

        if (!tokens.refresh_token) {
            return res.redirect(`${frontendUrl}/?gmail=error`);
        }

        oauthClient.setCredentials(tokens);

        // Retrieve Gmail account information
        const oauth2 = google.oauth2({
            auth: oauthClient,
            version: "v2"
        });

        const { data } = await oauth2.userinfo.get();

        if (!data.email || !data.verified_email) {
            return res.redirect(`${frontendUrl}/?gmail=error`);
        }

        // Encrypt refresh token
        const encryptedToken = encryptToken(tokens.refresh_token);

        // Save Gmail connection
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

        return res.redirect(`${frontendUrl}/?gmail=connected`);

    } catch (error) {
        console.error("Gmail authorization failed:", error);

        return res.redirect(`${frontendUrl}/?gmail=error`);
    }
});

export default router;
