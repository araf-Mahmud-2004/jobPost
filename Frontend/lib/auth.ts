// Simple auth configuration
// This is a placeholder and should be replaced with your actual auth setup

type User = {
  id: string;
  email: string;
  name: string;
  token: string;
};

export const getCurrentUser = (): User | null => {
  // In a real app, you would get this from your auth context or session
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};
