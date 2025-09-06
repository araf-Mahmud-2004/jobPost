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
    const res = await api.post('/auth/login', payload);
    const token: string = res.data?.token;
    if (token) setAuthToken(token);
    return token;
  },

  async logout(): Promise<void> {
    clearAuthToken();
  },

  async me(): Promise<MeResponse> {
    const res = await api.get('/auth/me');
    return res.data;
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
