import api from '@/lib/api';

export interface Application {
  _id: string;
  job: any; // Backend returns job id or object; we will map in UI
  user: string;
  status: string;
  coverLetter?: string;
  resume?: string;
  appliedAt: string;
  updatedAt: string;
}

export const applicationService = {
  async apply(jobId: string, payload: { coverLetter?: string; resumeName?: string }) {
    const res = await api.post('/applications', {
      coverLetter: payload.coverLetter || '',
      resume: payload.resumeName || undefined,
    }, {
      params: { jobId },
    });
    return res.data?.data?.application as Application;
  },

  async getMyApplications(): Promise<Application[]> {
    const res = await api.get('/applications/my-applications');
    return res.data?.data?.applications || [];
  },

  async getJobApplications(jobId: string): Promise<Application[]> {
    const res = await api.get(`/applications/job/${jobId}`);
    return res.data?.data?.applications || [];
  },

  async updateStatus(id: string, status: string, feedback?: string): Promise<Application> {
    const res = await api.patch(`/applications/${id}/status`, { status, feedback });
    return res.data?.data?.application as Application;
  },

  async withdraw(id: string): Promise<void> {
    await api.delete(`/applications/${id}`);
  },

  async updateApplication(id: string, updates: { coverLetter?: string; resume?: string }): Promise<Application> {
    const res = await api.patch(`/applications/${id}`, updates, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return res.data?.data?.application as Application;
  },
};
