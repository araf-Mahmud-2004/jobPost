import { Router } from "express";
import { register, login, verifyEmail, forgotPassword, resetPassword } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateBody as validate } from "../middleware/validateRequest";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/authSchemas";
import User from "../models/userModel";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

// Simple protected endpoint to verify tokens
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const fullUser = await User.findById(user?.id).select('-password');
    if (!fullUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ 
      id: fullUser._id, 
      name: fullUser.name,
      email: fullUser.email,
      role: fullUser.role 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
