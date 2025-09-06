import api from '@/lib/api';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  skills?: string[];
  resume?: string;
  avatar?: string;
  role: 'user' | 'employer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  // Get current user's profile
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/users/me');
    return response.data.data.user;
  },

  // Update user profile
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.put('/users/update', data);
    return response.data.data.user;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.put('/users/change-password', { currentPassword, newPassword });
    return response.data;
  },

  // Upload resume
  async uploadResume(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post('/users/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
};
