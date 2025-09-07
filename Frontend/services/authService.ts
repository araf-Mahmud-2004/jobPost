import api, { setAuthToken, clearAuthToken } from '@/lib/api';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string | null;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<{ message: string }>{
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  async login(payload: LoginPayload): Promise<string> {
    console.log('Attempting login with:', { email: payload.email, password: '***' });
    console.log('API base URL:', process.env.NEXT_PUBLIC_API_URL);
    
    try {
      const res = await api.post('/auth/login', payload);
      console.log('Login response:', res.data);
      const token: string = res.data?.token;
      if (token) {
        setAuthToken(token);
        console.log('Token set successfully');
      } else {
        console.error('No token received in response');
      }
      return token;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    clearAuthToken();
  },

  async me(): Promise<MeResponse> {
    console.log('Fetching user data from /auth/me');
    try {
      const res = await api.get('/auth/me');
      console.log('User data response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }>{
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }>{
    const res = await api.post(`/auth/reset-password/${token}`, { newPassword });
    return res.data;
  },

  async verifyEmail(token: string): Promise<{ message: string }>{
    const res = await api.get(`/auth/verify-email/${token}`);
    return res.data;
  },
};
