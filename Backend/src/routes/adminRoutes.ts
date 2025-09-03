import express from 'express';
import * as adminController from '../controllers/adminController';

const router = express.Router();

// Job management (temporarily public for testing)
router.get('/jobs', adminController.getAllJobs);
router.delete('/jobs/:id', adminController.deleteJob);

// Dashboard stats (temporarily public for testing)
router.get('/dashboard', adminController.getDashboardStats);

export default router;
