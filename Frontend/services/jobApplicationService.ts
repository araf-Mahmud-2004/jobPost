import { Application } from '@/types/application';

export const jobApplicationService = {
  // Get applications for jobs posted by the current user
  async getMyJobApplications(): Promise<{ applications: Application[] }> {
    const response = await fetch('/api/applications/my-jobs/applications', {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch job applications');
    }

    return response.json();
  },

  // Update application status
  async updateApplicationStatus(applicationId: string, status: string, feedback?: string): Promise<Application> {
    const response = await fetch(`/api/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status, feedback }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update application status');
    }

    return response.json();
  },
};
