import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { Job, IJob } from '../models/jobModel';
import { Application, IApplication } from '../models/applicationModel';
import mongoose from 'mongoose';

// Get all jobs (admin view)
export const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get jobs without populating user data
    const jobs = await Job.find({})
      .sort('-createdAt')
      .lean()
      .exec();

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: {
        jobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete job (admin)
export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return next(new AppError('No job found with that ID', 404));
    }

    // Delete all applications for this job
    await Application.deleteMany({ job: req.params.id });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalJobs,
      totalApplications,
      jobsByCategory,
      jobsByType,
      recentJobs,
    ] = await Promise.all([
      Job.countDocuments(),
      Application.countDocuments(),
      Job.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Job.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Job.find()
        .sort('-createdAt')
        .limit(5)
        .lean()
        .exec(),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalJobs,
          totalApplications,
          jobsByCategory,
          jobsByType,
        },
        recentJobs,
      },
    });
  } catch (error) {
    next(error);
  }
};
