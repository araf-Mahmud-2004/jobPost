import express from 'express';
import * as applicationController from '../controllers/applicationController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(protect);

// Routes for job applications
router.post(
  '/',
  restrictTo('user'),
  applicationController.applyForJob
);

router.get(
  '/my-applications',
  restrictTo('user'),
  applicationController.getMyApplications
);

router.get(
  '/job/:jobId',
  restrictTo('employer', 'admin'),
  applicationController.getJobApplications
);

router.patch(
  '/:id/status',
  restrictTo('employer', 'admin'),
  applicationController.updateApplicationStatus
);

router.delete(
  '/:id',
  restrictTo('user'),
  applicationController.withdrawApplication
);

export default router;
