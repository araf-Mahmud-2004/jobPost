import { Router } from "express";
import { register, login, verifyEmail, forgotPassword, resetPassword } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateBody as validate } from "../middleware/validateRequest";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/authSchemas";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

// Simple protected endpoint to verify tokens
router.get("/me", authMiddleware, (req, res) => {
  const user = (req as any).user;
  res.json({ id: user?.id, role: user?.role });
});

export default router;
