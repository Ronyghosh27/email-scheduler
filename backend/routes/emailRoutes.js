import express from "express";
import { createEmail,getEmails,searchEmails,getEmailById,updateEmail,deleteEmail,bulkDeleteSentEmails} from "../controllers/emailController.js";

const router = express.Router();

router.use((req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "Please log in first!"
    });
});

router.post("/", createEmail);
router.post("/bulk-delete", bulkDeleteSentEmails);
router.get("/search", searchEmails);
router.get("/", getEmails);
router.get("/:id", getEmailById);
router.put("/:id", updateEmail);
router.delete("/:id", deleteEmail);

export default router;