import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { Job, IJob } from '../models/jobModel';
import { Application, IApplication } from '../models/applicationModel';
import User from '../models/userModel';
import Announcement from '../models/announcementModel';
import { sendAnnouncementEmail } from '../services/emailService';
import mongoose from 'mongoose';

// Get all users (admin view)
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({})
      .select('-password') // Exclude password from response
      .sort('-createdAt')
      .lean()
      .exec();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin)
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    // Delete all applications for this user
    await Application.deleteMany({ user: req.params.id });

    // Delete all jobs created by this user
    await Job.deleteMany({ createdBy: req.params.id });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Ban/unban user (admin)
export const toggleUserBan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    // Toggle the banned status
    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBanned: user.isBanned,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all applications (admin view)
export const getAllApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applications = await Application.find({})
      .populate('user', 'name email')
      .populate('job', 'title company')
      .sort('-appliedAt')
      .lean()
      .exec();

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

// Delete application (admin)
export const deleteApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return next(new AppError('No application found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get all announcements (admin view)
export const getAllAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcements = await Announcement.find({})
      .populate('sentBy', 'name email')
      .sort('-sentAt')
      .lean()
      .exec();

    res.status(200).json({
      status: 'success',
      results: announcements.length,
      data: {
        announcements,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create and send announcement (admin)
export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Debug: First check all users in the database
    const allUsers = await User.find({}).select('email role isBanned').lean();
    console.log('All users in database:', allUsers);

    // Get all user emails (including admins for testing purposes)
    const users = await User.find({
      $or: [
        { isBanned: { $exists: false } }, // Users without isBanned field
        { isBanned: null },               // Users with null isBanned
        { isBanned: false }               // Users with isBanned: false
      ]
    }).select('email role isBanned').lean();

    console.log('Users found for announcement:', users);

    const userEmails = users.map(user => user.email);

    if (userEmails.length === 0) {
      return next(new AppError(`No users found to send announcement to. Total users: ${allUsers.length}, Filtered users: ${users.length}`, 400));
    }

    // Send announcement email to all users
    try {
      await sendAnnouncementEmail(userEmails, req.body.title, req.body.message);
      console.log(`Successfully sent emails to ${userEmails.length} users`);
    } catch (emailError) {
      console.error('Failed to send announcement emails:', emailError);
      return next(new AppError('Failed to send announcement emails. Please check your email configuration.', 500));
    }

    // Save announcement to database only if emails were sent successfully
    const newAnnouncement = await Announcement.create({
      title: req.body.title,
      message: req.body.message,
      sentBy: req.body.sentBy || new mongoose.Types.ObjectId(), // Default ObjectId if not provided
      recipientCount: userEmails.length,
    });

    res.status(201).json({
      status: 'success',
      message: `Announcement sent successfully to ${userEmails.length} users`,
      data: {
        announcement: newAnnouncement,
        emailsSent: userEmails.length,
      },
    });
  } catch (error) {
    console.error('Error in createAnnouncement:', error);
    next(error);
  }
};

// Delete announcement (admin)
export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return next(new AppError('No announcement found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

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
