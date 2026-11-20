import express from "express";
import { createEmail,getEmails,updateEmail,deleteEmail} from "../controllers/emailController.js";

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
router.get("/", getEmails);
router.put("/:id", updateEmail);
router.delete("/:id", deleteEmail);

export default router;