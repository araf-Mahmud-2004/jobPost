import express from 'express';
import * as jobController from '../controllers/jobController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (no authentication needed)
router.get('/', jobController.getAllJobs);
router.get('/stats', jobController.getJobStats);
router.get('/:id', jobController.getJob);

// Protected routes (authentication required)
router.post('/', authMiddleware, jobController.createJob);
router.patch('/:id', authMiddleware, jobController.updateJob);
router.delete('/:id', authMiddleware, jobController.deleteJob);

export default router;
