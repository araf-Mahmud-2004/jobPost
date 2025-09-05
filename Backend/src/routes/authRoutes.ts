import { Router } from "express";
import { register, login, verifyEmail, forgotPassword, resetPassword } from "../controllers/authController";
import { validate } from "../middlewares/validateMiddleware";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/authSchemas";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

export default router;
