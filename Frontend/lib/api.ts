import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const AUTH_TOKEN_KEY = 'token';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const setAuthToken = (token: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (e) {}
};

export const clearAuthToken = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (e) {}
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies with requests
});

// Request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {} as any;
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error?.config || {};

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Clear any stored token on unauthorized
      clearAuthToken();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
