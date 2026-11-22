
import "dotenv/config";
import crypto from "node:crypto";

const encryptionKey = process.env.GMAIL_TOKEN_ENCRYPTION_KEY;

if (!encryptionKey || !/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
    throw new Error(
        "GMAIL_TOKEN_ENCRYPTION_KEY must be a 32-byte hexadecimal key!"
    );
}

const key = Buffer.from(encryptionKey, "hex");

export const encryptToken = (token) => {
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        key,
        iv
    );

    let encrypted = cipher.update(token, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

export const decryptToken = (encryptedToken) => {
    const [ivHex, authTagHex, encrypted] = encryptedToken.split(":");

    if (!ivHex || !authTagHex || !encrypted) {
        throw new Error("Invalid encrypted token format!");
    }

    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        key,
        Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};
