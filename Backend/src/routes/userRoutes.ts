import { Router } from "express";
import { getProfile, updateProfile, changePassword, uploadResume } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { updateUserSchema, changePasswordSchema } from "../validations/userSchemas";

const router = Router();

router.get("/me", authMiddleware, getProfile);
router.put("/update", authMiddleware, validate(updateUserSchema), updateProfile);
router.put("/change-password", authMiddleware, validate(changePasswordSchema), changePassword);
router.post("/upload-resume", authMiddleware, uploadResume);

export default router;
