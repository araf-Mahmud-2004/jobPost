import express from 'express';
import mongoose from 'mongoose';
import * as applicationController from '../controllers/applicationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router({ mergeParams: true });

// Apply for a job (authentication required)
router.post(
  '/',
  authMiddleware,
  (req, res, next) => {
    try {
      // Accept jobId from either query params or request body
      const jobId = req.query.jobId || req.body.jobId;
      
      if (!jobId) {
        return res.status(400).json({
          status: 'error',
          message: 'jobId is required as a query parameter or in the request body'
        });
      }
      
      // Ensure we have a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(jobId as string)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid jobId format'
        });
      }
      
      // Add to request params for consistency
      req.params.jobId = jobId as string;
      next();
    } catch (error) {
      console.error('Error in job application route:', error);
      next(error);
    }
  },
  applicationController.applyForJob
);

// Get applications for the current user (authentication required)
router.get(
  '/my-applications',
  authMiddleware,
  applicationController.getMyApplications
);

// Get all applications for a specific job (authentication required)
router.get(
  '/job/:jobId',
  authMiddleware,
  applicationController.getJobApplications
);

// Update application status (authentication required)
router.patch(
  '/:id/status',
  authMiddleware,
  applicationController.updateApplicationStatus
);

// Withdraw application (authentication required)
router.delete(
  '/:id',
  authMiddleware,
  applicationController.withdrawApplication
);

export default router;
