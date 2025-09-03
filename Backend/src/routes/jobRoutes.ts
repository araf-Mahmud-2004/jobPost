import express from 'express';
import * as jobController from '../controllers/jobController';

const router = express.Router();

// All job routes are public for now
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJob);
router.get('/stats', jobController.getJobStats);
router.post('/', jobController.createJob);
router.patch('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

export default router;
