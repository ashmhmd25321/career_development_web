import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const authTokens = localStorage.getItem('authTokens');
  if (authTokens) {
    try {
      const tokens = JSON.parse(authTokens);
      if (tokens.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
    }
  }
  return config;
});

export interface CareerGoal {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  targetDate: string | null;
  currentStatus: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  progressPercentage: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CareerMilestone {
  id: number;
  goalId: number;
  title: string;
  description: string | null;
  targetDate: string | null;
  achieved: boolean;
  achievedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalData {
  title: string;
  description?: string;
  targetDate?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  currentStatus?: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
}

export interface CreateMilestoneData {
  goalId: number;
  title: string;
  description?: string;
  targetDate?: string;
}

export interface CareerStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  totalMilestones: number;
  achievedMilestones: number;
  averageProgress: number;
}

export const careerPlanningService = {
  // Goals
  async getUserGoals(): Promise<CareerGoal[]> {
    const response = await api.get('/career-planning/goals');
    return response.data;
  },

  async getGoalById(goalId: number): Promise<CareerGoal> {
    const response = await api.get(`/career-planning/goals/${goalId}`);
    return response.data;
  },

  async createGoal(data: CreateGoalData): Promise<CareerGoal> {
    const response = await api.post('/career-planning/goals', data);
    return response.data;
  },

  async updateGoal(goalId: number, data: Partial<CreateGoalData>): Promise<CareerGoal> {
    const response = await api.patch(`/career-planning/goals/${goalId}`, data);
    return response.data;
  },

  async updateGoalProgress(goalId: number, progressPercentage: number): Promise<CareerGoal> {
    const response = await api.patch(`/career-planning/goals/${goalId}/progress`, { progressPercentage });
    return response.data;
  },

  async deleteGoal(goalId: number): Promise<void> {
    await api.delete(`/career-planning/goals/${goalId}`);
  },

  // Milestones
  async getGoalMilestones(goalId: number): Promise<CareerMilestone[]> {
    const response = await api.get(`/career-planning/goals/${goalId}/milestones`);
    return response.data;
  },

  async createMilestone(data: CreateMilestoneData): Promise<CareerMilestone> {
    const response = await api.post('/career-planning/milestones', data);
    return response.data;
  },

  async updateMilestone(milestoneId: number, data: Partial<CreateMilestoneData & { achieved?: boolean }>): Promise<CareerMilestone> {
    const response = await api.patch(`/career-planning/milestones/${milestoneId}`, data);
    return response.data;
  },

  async deleteMilestone(milestoneId: number): Promise<void> {
    await api.delete(`/career-planning/milestones/${milestoneId}`);
  },

  // Statistics
  async getCareerStats(): Promise<CareerStats> {
    const response = await api.get('/career-planning/stats');
    return response.data;
  },
};

