import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { AppError } from './errorHandler';

export const roleMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        throw new AppError(
          `Access denied. Required roles: ${roles.join(', ')}`, 
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Specific role middlewares for common use cases
export const adminMiddleware = roleMiddleware(['admin']);
export const employerMiddleware = roleMiddleware(['employer', 'admin']);
