import express from 'express';
import * as adminController from '../controllers/adminController';

const router = express.Router();

// User management (temporarily public for testing)
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/ban', adminController.toggleUserBan);

// Job management (temporarily public for testing)
router.get('/jobs', adminController.getAllJobs);
router.delete('/jobs/:id', adminController.deleteJob);

// Application management (temporarily public for testing)
router.get('/applications', adminController.getAllApplications);
router.delete('/applications/:id', adminController.deleteApplication);

// Announcement management (temporarily public for testing)
router.get('/announcements', adminController.getAllAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

// Dashboard stats (temporarily public for testing)
router.get('/dashboard', adminController.getDashboardStats);

export default router;
