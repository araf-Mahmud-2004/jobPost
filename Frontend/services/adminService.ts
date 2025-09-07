// Admin API service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// User management
export const adminService = {
  // Get all users
  getAllUsers: async () => {
    const response = await apiCall('/admin/users');
    return response.data.users;
  },

  // Delete user
  deleteUser: async (userId: string) => {
    return await apiCall(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Ban/unban user
  toggleUserBan: async (userId: string) => {
    const response = await apiCall(`/admin/users/${userId}/ban`, {
      method: 'PATCH',
    });
    return response.data.user;
  },

  // Get all jobs
  getAllJobs: async () => {
    const response = await apiCall('/admin/jobs');
    return response.data.jobs;
  },

  // Delete job
  deleteJob: async (jobId: string) => {
    return await apiCall(`/admin/jobs/${jobId}`, {
      method: 'DELETE',
    });
  },

  // Get all applications
  getAllApplications: async () => {
    const response = await apiCall('/admin/applications');
    return response.data.applications;
  },

  // Delete application
  deleteApplication: async (applicationId: string) => {
    return await apiCall(`/admin/applications/${applicationId}`, {
      method: 'DELETE',
    });
  },

  // Get all announcements
  getAllAnnouncements: async () => {
    const response = await apiCall('/admin/announcements');
    return response.data.announcements;
  },

  // Create announcement
  createAnnouncement: async (announcementData: { title: string; message: string; sentBy: string }) => {
    const response = await apiCall('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
    return response.data.announcement;
  },

  // Delete announcement
  deleteAnnouncement: async (announcementId: string) => {
    return await apiCall(`/admin/announcements/${announcementId}`, {
      method: 'DELETE',
    });
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await apiCall('/admin/dashboard');
    return response.data;
  },
};
