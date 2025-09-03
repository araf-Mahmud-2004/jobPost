import { z } from 'zod';

// Job type options
const jobTypes = ['full-time', 'part-time', 'contract', 'freelance', 'internship'] as const;
const experienceLevels = ['entry', 'mid', 'senior', 'lead'] as const;

// Base job schema
const jobBaseSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Please provide a valid location'),
  type: z.enum(jobTypes, {
    errorMap: () => ({ message: `Job type must be one of: ${jobTypes.join(', ')}` })
  }),
  category: z.string().min(2, 'Please provide a valid category'),
  salary: z.number().min(0, 'Salary cannot be negative').optional(),
  requirements: z.array(
    z.string().min(10, 'Each requirement must be at least 10 characters')
  ).min(1, 'At least one requirement is required'),
  skills: z.array(
    z.string().min(2, 'Each skill must be at least 2 characters')
  ).min(1, 'At least one skill is required'),
  company: z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    description: z.string().optional(),
    website: z.string().url('Please provide a valid website URL').or(z.literal('')).optional(),
  }),
  deadline: z.string().datetime().optional(),
  experienceLevel: z.enum(experienceLevels, {
    errorMap: () => ({ message: `Experience level must be one of: ${experienceLevels.join(', ')}` })
  }),
  remote: z.boolean().default(false),
});

// Schema for creating a new job
export const createJobSchema = jobBaseSchema;

// Schema for updating a job
export const updateJobSchema = jobBaseSchema.partial();

// Schema for job query parameters
export const jobQuerySchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(jobTypes).optional(),
  category: z.string().optional(),
  experienceLevel: z.enum(experienceLevels).optional(),
  remote: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  minSalary: z.string().transform(Number).optional(),
  maxSalary: z.string().transform(Number).optional(),
  sort: z.string().default('-createdAt'),
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
});

// Application status schema
const applicationStatuses = ['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'] as const;

export const applicationStatusSchema = z.object({
  status: z.enum(applicationStatuses, {
    errorMap: () => ({ message: `Status must be one of: ${applicationStatuses.join(', ')}` })
  }),
  notes: z.string().optional(),
  interviewDate: z.string().datetime().optional(),
  feedback: z.string().optional(),
});

// Admin update user role schema
export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'employer', 'admin'], {
    errorMap: () => ({ message: 'Role must be one of: user, employer, admin' })
  })
});

// Dashboard stats query schema
export const dashboardStatsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
