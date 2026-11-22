import prisma from "../config/prisma.js";
import emailQueue from "../queues/emailQueue.js";

export const createEmail = async (req, res) => {
    try {
        const { recipient, subject, message, scheduledTime } = req.body;

        if (!recipient || !subject || !message || !scheduledTime) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        }

        const parsedDate = new Date(scheduledTime);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid scheduled date!"
            });
        }
        if (parsedDate <= new Date()) {
    return res.status(400).json({
        success: false,
        message: "Scheduled time must be in the future!"
    });
}
const user = await prisma.user.findUnique({
    where: {
        id: req.user.id
    },
    select: {
        gmailEmail: true,
        gmailRefreshTokenEncrypted: true
    }
});

if (!user?.gmailEmail || !user?.gmailRefreshTokenEncrypted) {
    return res.status(400).json({
        success: false,
        message: "Please connect your Gmail account before scheduling emails!"
    });
}
        const newEmail = await prisma.email.create({
            
            data: {
                recipient,
                subject,
                message,
                scheduledTime: parsedDate,
                user: {
                    connect: {
                        id: req.user.id
                    }
                }
            }
        });
        const delay = parsedDate.getTime() - Date.now();

try {
    await emailQueue.add(
        "send-email",
        {
            emailId: newEmail.id
        },
        {
            delay: delay,
            jobId: newEmail.id
        }
    );
} catch (queueError) {
    console.error("Failed to add BullMQ job:", queueError);

    try {
        await prisma.email.delete({
            where: {
                id: newEmail.id
            }
        });
    } catch (deleteError) {
        console.error("Failed to roll back email:", deleteError);
    }

    throw queueError;
}
        res.status(201).json({
            success: true,
            message: "Email scheduled successfully!",
            email: newEmail
        });

    } catch (error) {
        console.error("Email creation failed:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save email!"
        });
    }
};

export const getEmails = async (req, res) => {
    try {
        const emails = await prisma.email.findMany({
            where: {                
                    userId: req.user.id
                    },
            orderBy: {
                scheduledTime: "asc"
            }
        });

        res.json({
            success: true,
            count: emails.length,
            emails: emails
        });

    } catch (error) {
        console.error("Failed to retrieve emails:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve emails!"
        });
    }
};


export const searchEmails = async (req, res) => {
    try {
        const rawQuery = typeof req.query.q === "string" ? req.query.q : "";
        const query = rawQuery.trim().slice(0, 100);

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Enter a search term."
            });
        }

        const normalizedQuery = query.toLowerCase();
        const statusMatches = ["SENT", "SCHEDULED", "FAILED", "PROCESSING"].filter(
            (status) => status.toLowerCase().includes(normalizedQuery)
        );

        const emails = await prisma.email.findMany({
            where: {
                userId: req.user.id,
                OR: [
                    { subject: { contains: normalizedQuery, mode: "insensitive" } },
                    { recipient: { contains: normalizedQuery, mode: "insensitive" } },
                    { message: { contains: normalizedQuery, mode: "insensitive" } },
                    {
                        user: {
                            is: {
                                OR: [
                                    { email: { contains: normalizedQuery, mode: "insensitive" } },
                                    { gmailEmail: { contains: normalizedQuery, mode: "insensitive" } }
                                ]
                            }
                        }
                    },
                    ...(statusMatches.length > 0
                        ? [{ status: { in: statusMatches } }]
                        : [])
                ]
            },
            include: {
                user: {
                    select: {
                        email: true,
                        gmailEmail: true
                    }
                }
            },
            orderBy: [
                { updatedAt: "desc" },
                { createdAt: "desc" }
            ],
            take: 20
        });

        const results = emails.map((email) => ({
            id: email.id,
            subject: email.subject,
            recipient: email.recipient,
            message: email.message,
            status: email.status,
            scheduledTime: email.scheduledTime,
            createdAt: email.createdAt,
            updatedAt: email.updatedAt,
            senderEmail: email.user?.gmailEmail || email.user?.email || null
        }));

        res.json({
            success: true,
            count: results.length,
            emails: results
        });
    } catch (error) {
        console.error("Email search failed:", error);

        res.status(500).json({
            success: false,
            message: "Failed to search emails."
        });
    }
};


export const getEmailById = async (req, res) => {
    try {
        const { id } = req.params;

        const email = await prisma.email.findFirst({
            where: {
                id,
                userId: req.user.id
            },
            include: {
                user: {
                    select: {
                        email: true,
                        gmailEmail: true
                    }
                }
            }
        });

        if (!email) {
            return res.status(404).json({
                success: false,
                message: "Email not found!"
            });
        }

        res.json({
            success: true,
            email: {
                id: email.id,
                recipient: email.recipient,
                subject: email.subject,
                message: email.message,
                scheduledTime: email.scheduledTime,
                status: email.status,
                createdAt: email.createdAt,
                updatedAt: email.updatedAt,
                failureReason: email.failureReason,
                senderEmail: email.user?.gmailEmail || email.user?.email || null
            }
        });
    } catch (error) {
        console.error("Failed to retrieve email:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve email details!"
        });
    }
};


export const bulkDeleteSentEmails = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one sent email."
            });
        }

        const uniqueIds = [...new Set(ids)].filter(
            (id) => typeof id === "string" && id.trim().length > 0
        );

        if (uniqueIds.length === 0 || uniqueIds.length !== ids.length) {
            return res.status(400).json({
                success: false,
                message: "One or more selected email IDs are invalid."
            });
        }

        const selectedEmails = await prisma.email.findMany({
            where: {
                id: { in: uniqueIds },
                userId: req.user.id
            },
            select: {
                id: true,
                status: true
            }
        });

        if (selectedEmails.length !== uniqueIds.length) {
            return res.status(400).json({
                success: false,
                message: "One or more selected emails were not found."
            });
        }

        const hasNonSentEmail = selectedEmails.some(
            (email) => email.status !== "SENT"
        );

        if (hasNonSentEmail) {
            return res.status(400).json({
                success: false,
                message: "Only sent emails can be deleted together."
            });
        }

        const result = await prisma.email.deleteMany({
            where: {
                id: { in: uniqueIds },
                userId: req.user.id,
                status: "SENT"
            }
        });

        if (result.count !== uniqueIds.length) {
            return res.status(409).json({
                success: false,
                message: "Some selected emails could not be deleted."
            });
        }

        res.json({
            success: true,
            deletedCount: result.count,
            message: `${result.count} sent email${result.count === 1 ? "" : "s"} deleted from MailFlow successfully!`
        });
    } catch (error) {
        console.error("Bulk email deletion failed:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete selected emails."
        });
    }
};


export const deleteEmail = async (req, res) => {
    try {
        const { id } = req.params;

        const email = await prisma.email.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        });

        if (!email) {
            return res.status(404).json({
                success: false,
                message: "Email not found!"
            });
        }

        if (email.status === "SENT" || email.status === "FAILED") {
            await prisma.email.delete({
                where: {
                    id: email.id
                }
            });

            return res.json({
                success: true,
                message: "Email deleted from MailFlow successfully!"
            });
        }

        if (email.status !== "SCHEDULED") {
            return res.status(409).json({
                success: false,
                message: "This email cannot be deleted because it is still being processed!"
            });
        }

        // Find the corresponding BullMQ job
        const job = await emailQueue.getJob(id);

        if (!job) {
            return res.status(409).json({
                success: false,
                message: "Scheduled job not found in the queue!"
            });
        }

        // Check whether the job can still be cancelled
        const state = await job.getState();

        if (!["delayed", "waiting", "paused"].includes(state)) {
            return res.status(409).json({
                success: false,
                message: "Email can no longer be cancelled!"
            });
        }

        // Remove the job from Redis
        await job.remove();

        // Delete the email from PostgreSQL
        await prisma.email.delete({
            where: {
                id
            }
        });

        res.json({
            success: true,
            message: "Scheduled email cancelled successfully!"
        });

    } catch (error) {
        console.error("Email cancellation failed:", error);

        res.status(500).json({
            success: false,
            message: "Failed to cancel email!"
        });
    }
};


export const updateEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const { recipient, subject, message, scheduledTime } = req.body;

        if (!recipient || !subject || !message || !scheduledTime) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        }

        const parsedDate = new Date(scheduledTime);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid scheduled date!"
            });
        }

        if (parsedDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Scheduled time must be in the future!"
            });
        }

        // Find the email and verify ownership
        const email = await prisma.email.findFirst({
            where: {
                id,
                userId: req.user.id,
                status: "SCHEDULED"
            }
        });

        if (!email) {
            return res.status(404).json({
                success: false,
                message: "Scheduled email not found!"
            });
        }
        

        // Find the existing BullMQ job
        const job = await emailQueue.getJob(id);

        if (!job) {
            return res.status(409).json({
                success: false,
                message: "Scheduled job not found in the queue!"
            });
        }

        // Check whether the job can still be rescheduled
        const state = await job.getState();

        if (!["delayed", "waiting", "paused"].includes(state)) {
            return res.status(409).json({
                success: false,
                message: "Email can no longer be rescheduled!"
            });
        }

        // Remove the old job
        await job.remove();

        // Calculate the new delay
        const delay = parsedDate.getTime() - Date.now();

        try {
            // Add a new job with the updated schedule
            await emailQueue.add(
                "send-email",
                {
                    emailId: id
                },
                {
                    delay,
                    jobId: id
                }
            );

        } catch (queueError) {
            console.error("Failed to create updated job:", queueError);

            // Try to restore the old job
            const oldDelay = email.scheduledTime.getTime() - Date.now();

            if (oldDelay > 0) {
                try {
                    await emailQueue.add(
                        "send-email",
                        {
                            emailId: id
                        },
                        {
                            delay: oldDelay,
                            jobId: id
                        }
                    );
                } catch (restoreError) {
                    console.error("Failed to restore old job:", restoreError);
                }
            }

            throw queueError;
        }

        // Update PostgreSQL
        const updatedEmail = await prisma.email.update({
            where: { id },
            data: {
                recipient,
                subject,
                message,
                scheduledTime: parsedDate
            }
        });

        res.json({
            success: true,
            message: "Email rescheduled successfully!",
            email: updatedEmail
        });

    } catch (error) {
        console.error("Email update failed:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update email!"
        });
    }
};
