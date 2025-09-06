import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/userModel';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';

// Functions expected by userRoutes
export const getProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check current password
    const isCurrentPasswordCorrect = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const uploadResume = async (req: any, res: Response, next: NextFunction) => {
  try {
    // For now, just return success - file upload logic can be added later
    res.status(200).json({
      status: 'success',
      message: 'Resume upload endpoint - implementation pending',
    });
  } catch (err) {
    next(err);
  }
};