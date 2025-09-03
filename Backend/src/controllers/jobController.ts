import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { Job, IJob } from '../models/jobModel';
import mongoose, { FilterQuery } from 'mongoose';

// Create a new job
export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Create a new ObjectId for createdBy
    const tempUserId = new mongoose.Types.ObjectId();
    
    const newJob = await Job.create({
      ...req.body,
      createdBy: tempUserId,
      status: 'open', // Set default status
      applications: [] // Initialize empty applications array
    });

    res.status(201).json({
      status: 'success',
      data: {
        job: newJob,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all jobs with filtering, sorting, and pagination
export const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    
    let query: FilterQuery<IJob> = JSON.parse(queryStr);
    
    // 3) Search
    if ((req.query as any).search) {
      query.$text = { $search: (req.query as any).search };
    }

    // 4) Execute query
    let queryCommand = Job.find(query);

    // 5) Sorting
    if ((req.query as any).sort) {
      const sortBy = (req.query as any).sort.split(',').join(' ');
      queryCommand = queryCommand.sort(sortBy);
    } else {
      queryCommand = queryCommand.sort('-createdAt');
    }

    // 6) Field limiting
    if ((req.query as any).fields) {
      const fields = (req.query as any).fields.split(',').join(' ');
      queryCommand = queryCommand.select(fields);
    } else {
      queryCommand = queryCommand.select('-__v');
    }

    // 7) Pagination
    const page = parseInt((req.query as any).page, 10) || 1;
    const limit = parseInt((req.query as any).limit, 10) || 10;
    const skip = (page - 1) * limit;

    queryCommand = queryCommand.skip(skip).limit(limit);

    // Execute query
    const jobs = await queryCommand;
    const total = await Job.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        jobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single job
export const getJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.params.id) {
      return next(new AppError('Please provide a job ID', 400));
    }

    const job = await Job.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate({
        path: 'applications',
        select: 'status user appliedAt',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!job) {
      return next(new AppError('No job found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        job,
      },
    });
  } catch (error) {
    console.error('Error in getJob:', error);
    next(new AppError('Error retrieving job', 500));
  }
};

// Update a job
export const updateJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('No job found with that ID', 404));
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        job: updatedJob,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a job
export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return next(new AppError('No job found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get jobs stats (for dashboard)
export const getJobStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await Job.aggregate([
      {
        $match: { status: 'open' }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
          minSalary: { $min: '$salary' },
          maxSalary: { $max: '$salary' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};
