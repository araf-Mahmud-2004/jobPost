// Simple auth configuration
// This is a placeholder and should be replaced with your actual auth setup

type User = {
  id: string;
  email: string;
  name: string;
  token: string;
};

export const getCurrentUser = (): User | null => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;

  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};
