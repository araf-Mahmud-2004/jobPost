import { z } from 'zod';

// Schema for applying to a job
export const applyForJobSchema = z.object({
  body: z.object({
    coverLetter: z.string().optional(),
    resume: z.string().min(1, 'Resume is required'),
  }),
  params: z.object({
    jobId: z.string().min(1, 'Job ID is required'),
  }),
});

// Schema for updating application status
export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected']),
    feedback: z.string().optional(),
    interviewDate: z.string().datetime().optional(),
  }),
  params: z.object({
    applicationId: z.string().min(1, 'Application ID is required'),
  }),
});

// Schema for getting job applications
export const getJobApplicationsSchema = z.object({
  query: z.object({
    status: z.enum(['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected']).optional(),
    sort: z.string().optional(),
    limit: z.string().optional(),
    page: z.string().optional(),
  }),
  params: z.object({
    jobId: z.string().min(1, 'Job ID is required'),
  }),
});

// Schema for getting user's applications
export const getMyApplicationsSchema = z.object({
  query: z.object({
    status: z.enum(['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected']).optional(),
    sort: z.string().optional(),
    limit: z.string().optional(),
    page: z.string().optional(),
  }),
});

export type ApplyForJobInput = z.infer<typeof applyForJobSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type GetJobApplicationsInput = z.infer<typeof getJobApplicationsSchema>;
export type GetMyApplicationsInput = z.infer<typeof getMyApplicationsSchema>;
