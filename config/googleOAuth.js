
import "dotenv/config";
import { google } from "googleapis";

const googleOAuthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_GMAIL_CALLBACK_URL
);

export default googleOAuthClient;
