import mongoose, { Types } from 'mongoose';
import { Application, IApplication } from '../models/applicationModel';
import { Job } from '../models/jobModel';
import { AppError } from '../middleware/errorHandler';

export interface ApplicationQueryParams {
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
  jobId?: string;
  userId?: string;
}

export const applyForJob = async (
  jobId: string,
  userId: string,
  applicationData: { coverLetter?: string; resume: string }
): Promise<IApplication> => {
  // Check if job exists and is open
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError('No job found with that ID', 404);
  }

  if (job.status !== 'open') {
    throw new AppError('This job is no longer accepting applications', 400);
  }

  // Check if user already applied
  const existingApplication = await Application.findOne({
    job: new Types.ObjectId(jobId),
    user: new Types.ObjectId(userId),
  });

  if (existingApplication) {
    throw new AppError('You have already applied for this job', 400);
  }

  // Create application
  const application = await Application.create({
    job: job._id,
    user: new Types.ObjectId(userId),
    status: 'pending',
    coverLetter: applicationData.coverLetter,
    resume: applicationData.resume,
    appliedAt: new Date(),
    updatedAt: new Date()
  });

  // Add application to job's applications array
  job.applications.push(application._id as unknown as Types.ObjectId);
  await job.save();

  return application;
};

export const getJobApplications = async (
  jobId: string,
  userId: string,
  queryParams: ApplicationQueryParams
) => {
  const { status, sort = '-appliedAt', page = 1, limit = 10 } = queryParams;

  // Check if job exists and user is the owner
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError('No job found with that ID', 404);
  }

  if (job.createdBy.toString() !== userId) {
    throw new AppError('You are not authorized to view these applications', 403);
  }

  // Build the query
  const query: any = { job: new Types.ObjectId(jobId) };
  if (status) query.status = status;

  const applicationsQuery = Application.find(query)
    .populate('user', 'name email')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Application.countDocuments(query);
  const applications = await applicationsQuery.exec();

  return {
    results: applications.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: applications,
  };
};

export const getMyApplications = async (
  userId: string,
  queryParams: ApplicationQueryParams
) => {
  const { status, sort = '-appliedAt', page = 1, limit = 10 } = queryParams;

  // Build the query
  const query: any = { user: new Types.ObjectId(userId) };
  if (status) query.status = status;
  if (queryParams.jobId) query.job = new Types.ObjectId(queryParams.jobId);

  const applicationsQuery = Application.find(query)
    .populate({
      path: 'job',
      select: 'title company.name location type status',
    })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Application.countDocuments(query);
  const applications = await applicationsQuery.exec();

  return {
    results: applications.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: applications,
  };
};

export const updateApplicationStatus = async (
  applicationId: string,
  userId: string,
  updateData: { status: string; feedback?: string; interviewDate?: Date },
  isAdmin: boolean = false
): Promise<IApplication | null> => {
  const application = await Application.findById(applicationId).populate({
    path: 'job',
    select: 'createdBy',
  });

  if (!application) {
    throw new AppError('No application found with that ID', 404);
  }

  // Check if user is the job poster or admin
  const job = application.job as any;
  if (job.createdBy.toString() !== userId && !isAdmin) {
    throw new AppError('You are not authorized to update this application', 403);
  }

  // Update application status with type assertion
  application.status = updateData.status as 'pending' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  if (updateData.feedback) application.feedback = updateData.feedback;
  if (updateData.interviewDate) application.interviewDate = updateData.interviewDate;
  application.updatedAt = new Date();

  await application.save();
  return application;
};

export const withdrawApplication = async (
  applicationId: string,
  userId: string
): Promise<void> => {
  const application = await Application.findById(applicationId);

  if (!application) {
    throw new AppError('No application found with that ID', 404);
  }

  // Check if user is the applicant
  if (application.user.toString() !== userId) {
    throw new AppError('You are not authorized to withdraw this application', 403);
  }

  // Only allow status change if status is pending or reviewing
  if (!['pending', 'reviewing'].includes(application.status)) {
    throw new AppError('You can only withdraw applications that are pending or in review', 400);
  }

  // Update application status to rejected (as withdrawn is not a valid status in our schema)
  application.status = 'rejected' as const;
  application.updatedAt = new Date();
  await application.save();

  // Remove application from job's applications array
  await Job.updateOne(
    { _id: application.job },
    { $pull: { applications: application._id } }
  );
};

export const getApplicationStats = async (jobId?: string, userId?: string) => {
  const match: any = {};
  if (jobId) match.job = new Types.ObjectId(jobId);
  if (userId) match.user = new Types.ObjectId(userId);

  const stats = await Application.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return stats;
};
