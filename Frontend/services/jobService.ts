import api from '@/lib/api';

export interface Company {
  name: string;
  description?: string;
  website?: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  category: string;
  salary?: number;
  requirements: string[];
  skills: string[];
  company: Company;
  createdBy: string;
  status: 'open' | 'closed';
  applications: string[];
  deadline?: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  remote: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  search?: string;
  location?: string;
  type?: Job['type'] | string;
  category?: string;
  minSalary?: number;
  maxSalary?: number;
  status?: 'open' | 'closed';
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  experienceLevel?: Job['experienceLevel'] | string;
  remote?: boolean;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export const jobService = {
  // Get all jobs with optional filters
  async getJobs(filters: JobFilters = {}): Promise<JobsResponse> {
    const params = new URLSearchParams();
    
    // Add search parameter if provided
    if (filters.search) params.append('search', filters.search);
    
    // Add other filters
    if (filters.location) params.append('location', filters.location);
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.minSalary) params.append('minSalary', filters.minSalary.toString());
    if (filters.maxSalary) params.append('maxSalary', filters.maxSalary.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.fields) params.append('fields', filters.fields);
    if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
    if (filters.remote !== undefined) params.append('remote', filters.remote.toString());

    try {
      const response = await api.get(`/jobs?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return { jobs: [], total: 0, totalPages: 0, currentPage: 1 };
    }
  },

  // Get a single job by ID
  async getJob(id: string): Promise<Job> {
    const response = await api.get(`/jobs/${id}`);
    return response.data.data.job as Job;
  },

  // Create a new job
  async createJob(
    jobData: Omit<Job, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'createdBy' | 'applications'>
  ): Promise<Job> {
    const response = await api.post('/jobs', jobData);
    return response.data.data.job as Job;
  },

  // Update a job
  async updateJob(id: string, jobData: Partial<Job>): Promise<Job> {
    const response = await api.patch(`/jobs/${id}`, jobData);
    return response.data.data.job as Job;
  },

  // Delete a job
  async deleteJob(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  },

  // Get job statistics (aggregation results)
  async getJobStats(): Promise<any> {
    const response = await api.get('/jobs/stats');
    return response.data.data.stats;
  },
};
