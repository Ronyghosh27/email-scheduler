
import { Worker } from "bullmq";
import redisConnection from "../config/redis.js";
import prisma from "../config/prisma.js";
import getGmailClient from "../utils/gmailClient.js";

const createRawEmail = ({ recipient, subject, message }) => {
    if (/[\r\n]/.test(recipient) || /[\r\n]/.test(subject)) {
        throw new Error("Invalid email header values!");
    }

    const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;

    const emailContent = [
        `To: ${recipient}`,
        `Subject: ${encodedSubject}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        Buffer.from(message, "utf8").toString("base64")
    ].join("\r\n");

    return Buffer.from(emailContent).toString("base64url");
};

const emailWorker = new Worker(
    "email-queue",
    async (job) => {
        const { emailId } = job.data;

        const email = await prisma.email.findUnique({
            where: { id: emailId },
            include: {
                user: true
            }
        });

        if (!email) {
            throw new Error("Email not found in database!");
        }

        // Mark email as processing
        await prisma.email.update({
            where: { id: emailId },
            data: {
                status: "PROCESSING"
            }
        });

        const gmail = await getGmailClient(email.userId);

        const rawEmail = createRawEmail({
            recipient: email.recipient,
            subject: email.subject,
            message: email.message
        });

        const response = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: rawEmail
            }
        });

        console.log("Email sent successfully!");
        console.log("Gmail Message ID:", response.data.id);

        // Mark email as sent
        await prisma.email.update({
            where: { id: emailId },
            data: {
                status: "SENT"
            }
        });
    },
    {
        connection: redisConnection
    }
);

emailWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully!`);
});


emailWorker.on("failed", async (job, error) => {
    console.error(
        `Job ${job.id} failed on attempt ${job.attemptsMade}:`,
        error.message
    );

    // Check whether all retry attempts are exhausted
    if (job.attemptsMade >= job.opts.attempts) {
        console.log(`Job ${job.id} has permanently failed.`);

        try {
            await prisma.email.updateMany({
                where: {
                    id: job.data.emailId,
                    status: {
                        not: "SENT"
                    }
                },
                data: {
                    status: "FAILED"
                }
            });

            console.log(`Email ${job.data.emailId} marked as FAILED.`);
        } catch (dbError) {
            console.error("Failed to update email status:", dbError);
        }
    }
});

