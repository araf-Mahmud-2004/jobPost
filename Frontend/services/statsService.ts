import api from '@/lib/api';

export interface PlatformStats {
  totalJobs: number;
  totalUsers: number;
  totalCompanies: number;
}

export interface CategoryStats {
  _id: string;
  count: number;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
}

export interface StatsResponse {
  platformStats: PlatformStats;
  categoryStats: CategoryStats[];
}

export const statsService = {
  async getPlatformStats(): Promise<StatsResponse> {
    const res = await api.get('/jobs/stats');
    return res.data.data;
  },
};
