import { FilterQuery, Types } from 'mongoose';
import { Job, IJob } from '../models/jobModel';
import { AppError } from '../middleware/errorHandler';

export interface JobQueryParams {
  search?: string;
  location?: string;
  type?: string;
  category?: string;
  experienceLevel?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export const createJob = async (jobData: Partial<IJob>, userId: string): Promise<IJob> => {
  const newJob = await Job.create({
    ...jobData,
    createdBy: userId,
  });
  return newJob;
};

export const getAllJobs = async (queryParams: JobQueryParams) => {
  const {
    search,
    location,
    type,
    category,
    experienceLevel,
    remote,
    salaryMin,
    salaryMax,
    sort = '-createdAt',
    page = 1,
    limit = 10,
  } = queryParams;

  // Build the query
  const query: FilterQuery<IJob> = { status: 'open' };

  // Filtering
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'company.name': { $regex: search, $options: 'i' } },
      { requirements: { $in: [new RegExp(search, 'i')] } },
      { skills: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  if (location) query.location = location;
  if (type) query.type = type;
  if (category) query.category = category;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (remote !== undefined) {
    if (typeof remote === 'string') {
      query.remote = remote === 'true';
    } else {
      query.remote = remote;
    }
  }
  if (salaryMin || salaryMax) {
    query.salary = {};
    if (salaryMin) query.salary.$gte = salaryMin;
    if (salaryMax) query.salary.$lte = salaryMax;
  }

  // Execute query
  const jobsQuery = Job.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Job.countDocuments(query);
  const jobs = await jobsQuery.exec();

  return {
    results: jobs.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: jobs,
  };
};

export const getJobById = async (id: string): Promise<IJob | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid job ID', 400);
  }
  const job = await Job.findById(id).populate('createdBy', 'name email');
  return job;
};

export const updateJob = async (
  id: string,
  updateData: Partial<IJob>,
  userId: string,
  isAdmin: boolean = false
): Promise<IJob | null> => {
  const job = await Job.findById(id);
  
  if (!job) {
    throw new AppError('No job found with that ID', 404);
  }

  // Check if user is the owner or admin
  if (job.createdBy.toString() !== userId && !isAdmin) {
    throw new AppError('You are not authorized to update this job', 403);
  }

  // Prevent changing certain fields
  const { createdBy, applications, ...allowedUpdates } = updateData;
  
  Object.assign(job, allowedUpdates);
  await job.save();
  
  return job;
};

export const deleteJob = async (id: string, userId: string, isAdmin: boolean = false): Promise<void> => {
  const job = await Job.findById(id);
  
  if (!job) {
    throw new AppError('No job found with that ID', 404);
  }

  // Check if user is the owner or admin
  if (job.createdBy.toString() !== userId && !isAdmin) {
    throw new AppError('You are not authorized to delete this job', 403);
  }

  // Soft delete
  job.status = 'closed';
  await job.save();
};

export const getJobStats = async (userId?: string) => {
  const stats = await Job.aggregate([
    {
      $match: {
        ...(userId ? { createdBy: new Types.ObjectId(userId) } : {}),
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgSalary: { $avg: '$salary' },
        minSalary: { $min: '$salary' },
        maxSalary: { $max: '$salary' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return stats;
};

export const getJobCategories = async () => {
  const categories = await Job.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  return categories;
};
