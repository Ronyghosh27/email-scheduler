
import "dotenv/config";
import { google } from "googleapis";
import prisma from "../config/prisma.js";
import { decryptToken } from "./tokenEncryption.js";

const getGmailClient = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            gmailRefreshTokenEncrypted: true
        }
    });

    if (!user?.gmailRefreshTokenEncrypted) {
        throw new Error("Gmail account is not connected!");
    }

    const refreshToken = decryptToken(
        user.gmailRefreshTokenEncrypted
    );

    const oauthClient = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_GMAIL_CALLBACK_URL
    );

    oauthClient.setCredentials({
        refresh_token: refreshToken
    });

    return google.gmail({
        version: "v1",
        auth: oauthClient
    });
};

export default getGmailClient;
