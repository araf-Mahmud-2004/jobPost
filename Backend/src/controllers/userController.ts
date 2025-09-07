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
    console.log('Change password request received:', { userId: req.user?.id, body: req.body });
    
    // Validate request body
    if (!req.body.oldPassword || !req.body.newPassword) {
      return next(new AppError('Please provide both old and new passwords', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      console.error('User not found for ID:', req.user?.id);
      return next(new AppError('User not found', 404));
    }

    console.log('User found, checking password...');
    
    // Check current password
    if (!user.password) {
      console.error('User has no password set');
      return next(new AppError('No password set for this account', 400));
    }

    if (typeof req.body.oldPassword !== 'string' || typeof user.password !== 'string') {
      console.error('Invalid password format', {
        oldPasswordType: typeof req.body.oldPassword,
        storedPasswordType: typeof user.password
      });
      return next(new AppError('Invalid password format', 400));
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      req.body.oldPassword, 
      user.password
    );
    
    console.log('Password check result:', isCurrentPasswordCorrect);
    
    if (!isCurrentPasswordCorrect) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    console.log('Hashing new password...');
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);
    user.password = hashedNewPassword;
    
    console.log('Saving user with new password...');
    await user.save();

    console.log('Password updated successfully');
    
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