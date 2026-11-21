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


export const deleteEmail = async (req, res) => {
    try {
        const { id } = req.params;

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
