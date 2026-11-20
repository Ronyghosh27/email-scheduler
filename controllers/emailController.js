import prisma from "../config/prisma.js";

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

        res.status(201).json({
            success: true,
            message: "Email saved successfully!",
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

        const result = await prisma.email.deleteMany({
            where: {              
                  id: id,
                    userId: req.user.id
                
            }
        });

        if (result.count === 0) {
            return res.status(404).json({
                success: false,
                message: "Email not found!"
            });
        }

        res.json({
            success: true,
            message: "Email deleted successfully!"
        });

    } catch (error) {
        console.error("Email deletion failed:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete email!"
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

        const result = await prisma.email.updateMany({
            where: {
                id: id,
                status: "SCHEDULED",
                userId: req.user.id
            },
            data: {
                recipient,
                subject,
                message,
                scheduledTime: parsedDate
            }
        });

        if (result.count === 0) {
            return res.status(404).json({
                success: false,
                message: "Scheduled email not found!"
            });
        }

        const updatedEmail = await prisma.email.findUnique({
            where: { id }
        });

        res.json({
            success: true,
            message: "Email updated successfully!",
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