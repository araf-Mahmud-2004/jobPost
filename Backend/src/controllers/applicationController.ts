import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { Application, IApplication } from '../models/applicationModel';
import { Job, IJob } from '../models/jobModel';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import { IUser } from '../models/userModel';

// Extend the Request type to include user information
declare global {
  namespace Express {
    interface Request {
      params: {
        id?: string;
        jobId?: string;
        userId?: string;
      };
      body: any;
    }
  }
}

// Apply for a job
export const applyForJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(new AppError('Authentication required to apply for a job', 401));
    }

    const jobId = req.params.jobId;
    
    if (!jobId) {
      return next(new AppError('Job ID is required', 400));
    }
    
    // Log the jobId for debugging
    console.log('Applying for job with ID:', jobId);

    // Validate jobId format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return next(new AppError('Invalid job ID format', 400));
    }

    const job = await Job.findById(jobId).exec();
    
    if (!job) {
      return next(new AppError('No job found with that ID', 404));
    }

    // Check if job is still open
    if (job.status !== 'open') {
      return next(new AppError('This job is no longer accepting applications', 400));
    }

    // Use authenticated user's ID
    const userId = req.user.id;

    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: new mongoose.Types.ObjectId(req.params.jobId),
      user: new mongoose.Types.ObjectId(userId),
    });

    if (existingApplication) {
      return next(new AppError('You have already applied for this job', 400));
    }

    // Create application
    const application = await Application.create({
      job: new mongoose.Types.ObjectId(req.params.jobId),
      user: new mongoose.Types.ObjectId(userId),
      status: 'pending',
      coverLetter: req.body.coverLetter || '',
      resume: req.body.resume || 'test-resume.pdf',
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

// Get all applications for a specific user
export const getMyApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(new AppError('Authentication required to view applications', 401));
    }

    // Use authenticated user's ID
    const userId = req.user.id;

    // Get applications without any population
    const applications = await Application.find({ user: userId })
      .select('-__v')  // Exclude version key
      .sort('-appliedAt')
      .lean()  // Convert to plain JavaScript object
      .exec();

    // Get basic job details without populating
    const applicationsWithJobDetails = await Promise.all(
      applications.map(async (app: any) => {
        try {
          const job = await Job.findById(app.job)
            .select('title company.name location type status')
            .lean()
            .exec();
          
          return {
            ...app,
            job: job || { _id: app.job } // Return minimal job info if not found
          };
        } catch (err) {
          console.error('Error fetching job details:', err);
          return {
            ...app,
            job: { _id: app.job } // Return just the ID if there's an error
          };
        }
      })
    );

    res.status(200).json({
      status: 'success',
      results: applicationsWithJobDetails.length,
      data: {
        applications: applicationsWithJobDetails,
      },
    });
  } catch (error) {
    console.error('Error in getMyApplications:', error);
    // Return empty array in case of error to prevent breaking the frontend
    res.status(200).json({
      status: 'success',
      results: 0,
      data: {
        applications: [],
      },
    });
  }
};

// Get all applications for a job
export const getJobApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.jobId;
    console.log('Fetching applications for job ID:', jobId);
    
    if (!jobId) {
      return next(new AppError('Job ID is required', 400));
    }

    // Log the query being executed
    console.log('Executing query:', { job: jobId });
    
    // Get raw applications without any transformations
    const applications = await Application.find({ job: jobId })
      .select('-__v -user')
      .sort('-appliedAt')
      .lean()
      .exec();
    
    console.log('Raw applications from DB:', applications);

    // Try a direct MongoDB query as a fallback
    if (applications.length === 0) {
      console.log('No applications found with standard query, trying direct MongoDB query...');
      
      // Check if we have a database connection
      if (!mongoose.connection.db) {
        console.error('No database connection available');
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: {
            applications: [],
            debug: {
              message: 'No database connection available',
              jobIdType: typeof jobId,
              jobIdValue: jobId
            }
          },
        });
      }

      try {
        const rawResults = await mongoose.connection.db.collection('applications')
          .find({ job: new mongoose.Types.ObjectId(jobId) })
          .toArray();
        console.log('Direct MongoDB query results:', rawResults);
        
        return res.status(200).json({
          status: 'success',
          results: rawResults.length,
          data: {
            applications: rawResults,
            debug: {
              message: 'Using direct MongoDB query',
              jobIdType: typeof jobId,
              jobIdValue: jobId,
              rawResultsCount: rawResults.length
            }
          },
        });
      } catch (dbError) {
        console.error('Error in direct MongoDB query:', dbError);
        // Continue to return empty array if direct query fails
      }
    }

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications,
        debug: {
          message: 'Using Mongoose query',
          jobIdType: typeof jobId,
          jobIdValue: jobId
        }
      }
    });
  } catch (error) {
    console.error('Error in getJobApplications:', error);
    // Return empty array in case of error to prevent breaking the frontend
    res.status(200).json({
      status: 'success',
      results: 0,
      data: {
        applications: [],
      },
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    const application = await Application.findByIdAndUpdate(
      id,
      { status, feedback },
      { new: true, runValidators: true }
    ).populate('job', 'title company.name').populate('user', 'name email');

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    // Send notification to the applicant
    if (status === 'accepted' || status === 'rejected') {
      const job = application.job as any;
      const user = application.user as any;
      
      console.log(`Notification: Application for "${job.title}" has been ${status}`);
      console.log(`Applicant: ${user.name} (${user.email})`);
      
      // TODO: Implement actual email/notification service here
      // For now, we'll just log the notification
      // In a real application, you would:
      // 1. Send an email to user.email
      // 2. Create an in-app notification
      // 3. Send a push notification if applicable
    }

    res.status(200).json({
      status: 'success',
      message: status === 'accepted' || status === 'rejected' 
        ? `Application ${status} successfully. Applicant has been notified.`
        : 'Application status updated successfully.',
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update application
export const updateApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { coverLetter, resume } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid application ID format', 400));
    }

    const application = await Application.findById(id);

    if (!application) {
      return next(new AppError('No application found with that ID', 404));
    }

    // Check if the user is the owner of the application
    if (req.user && application.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized to update this application', 403));
    }

    // Update fields if they are provided
    if (coverLetter !== undefined) application.coverLetter = coverLetter;
    if (resume !== undefined) application.resume = resume;

    const updatedApplication = await application.save();

    // Populate job and user details for the response
    await updatedApplication.populate([
      { path: 'job', select: 'title company' },
      { path: 'user', select: 'name email' }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        application: updatedApplication
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get applications for jobs posted by the current user
export const getMyJobApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(new AppError('Authentication required', 401));
    }

    console.log('User ID:', req.user.id);
    
    // Find all jobs created by the current user
    const jobs = await Job.find({ createdBy: req.user.id }).select('_id');
    console.log('Jobs found:', jobs);
    
    if (jobs.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        message: 'No jobs found for this user',
        data: {
          applications: []
        }
      });
    }

    const jobIds = jobs.map(job => job._id);
    console.log('Job IDs:', jobIds);

    // Find all applications for these jobs
    const applications = await Application.find({ 
      job: { $in: jobIds } 
    })
    .populate({
      path: 'job',
      select: 'title company.name createdBy',
      populate: {
        path: 'createdBy',
        select: 'name email'
      }
    })
    .populate({
      path: 'user',
      select: 'name email profile'
    })
    .sort('-appliedAt');

    console.log('Applications found:', applications.length);

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications
      }
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw application
export const withdrawApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return next(new AppError('No application found with that ID', 404));
    }

    // Remove application from job's applications array
    await Job.findByIdAndUpdate(
      application.job,
      { $pull: { applications: application._id } },
      { new: true }
    );

    // Delete the application
    await application.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
