import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { Application, IApplication } from '../models/applicationModel';
import { Job, IJob } from '../models/jobModel';
import { IRequestWithUser } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

// Apply for a job
export const applyForJob = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('You are not logged in! Please log in to get access.', 401);
    }

    const job = await Job.findById(req.params.jobId).exec();
    
    if (!job) {
      return next(new AppError('No job found with that ID', 404));
    }

    // Check if job is still open
    if (job.status !== 'open') {
      return next(new AppError('This job is no longer accepting applications', 400));
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: new mongoose.Types.ObjectId(req.params.jobId),
      user: new mongoose.Types.ObjectId(req.user?.id),
    });

    if (existingApplication) {
      return next(new AppError('You have already applied for this job', 400));
    }

    // Create application
    const application = await Application.create({
      job: new mongoose.Types.ObjectId(req.params.jobId),
      user: new mongoose.Types.ObjectId(req.user?.id),
      status: 'pending',
      coverLetter: req.body.coverLetter,
      resume: req.body.resume,
      appliedAt: new Date(),
      updatedAt: new Date(),
    });

    // Add application to job's applications array
    job.applications.push(application._id as unknown as mongoose.Types.ObjectId);
    await job.save();

    res.status(201).json({
      status: 'success',
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all applications for a job (for job poster or admin)
export const getJobApplications = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('You are not logged in! Please log in to get access.', 401);
    }

    const job = await Job.findById(req.params.jobId).exec();
    
    if (!job) {
      return next(new AppError('No job found with that ID', 404));
    }

    // Check if user is the job poster or admin
    if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new AppError('You do not have permission to view these applications', 403)
      );
    }

    const applications = await Application.find({ job: req.params.jobId });

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all applications for current user
export const getMyApplications = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('You are not logged in! Please log in to get access.', 401);
    }

    const applications = await Application.find({ user: req.user.id })
      .sort('-appliedAt')
      .populate({
        path: 'job',
        select: 'title company.name location status',
      });

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update application status (for job poster or admin)
export const updateApplicationStatus = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('You are not logged in! Please log in to get access.', 401);
    }

    const application = await Application.findById(req.params.id).populate('job');
    
    if (!application) {
      return next(new AppError('No application found with that ID', 404));
    }

    // Check if user is the job poster or admin
    if (
      (application.job as any).createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new AppError('You do not have permission to update this application', 403)
      );
    }

    // Update application
    application.status = req.body.status;
    application.notes = req.body.notes || application.notes;
    application.interviewDate = req.body.interviewDate || application.interviewDate;
    application.feedback = req.body.feedback || application.feedback;
    
    await application.save();

    res.status(200).json({
      status: 'success',
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw application (for applicant)
export const withdrawApplication = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('You are not logged in! Please log in to get access.', 401);
    }

    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return next(new AppError('No application found with that ID', 404));
    }

    // Check if user is the applicant
    if (application.user.toString() !== req.user.id) {
      return next(
        new AppError('You do not have permission to withdraw this application', 403)
      );
    }

    // Remove application from job's applications array
    await Job.findByIdAndUpdate(
      application.job,
      { $pull: { applications: application._id } }
    );

    // Delete the application
    await Application.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
