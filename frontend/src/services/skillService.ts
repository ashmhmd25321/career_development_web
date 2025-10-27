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

export interface Skill {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  createdAt: string;
  updatedAt: string;
}

export interface UserSkill {
  id: number;
  userId: number;
  skillId: number;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  experienceYears: number;
  certified: boolean;
  certificationDate: string | null;
  selfAssessed: boolean;
  assessmentDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SkillWithUserData extends Skill {
  userSkill?: UserSkill;
}

export interface CreateUserSkillData {
  skillId: number;
  proficiencyLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  experienceYears?: number;
  certified?: boolean;
  certificationDate?: string;
  notes?: string;
}

export const skillService = {
  // Get all skills
  async getAllSkills(): Promise<Skill[]> {
    const response = await api.get('/skills');
    return response.data;
  },

  // Get skill categories
  async getCategories(): Promise<string[]> {
    const response = await api.get('/skills/categories');
    return response.data;
  },

  // Get user's skills
  async getUserSkills(): Promise<SkillWithUserData[]> {
    const response = await api.get('/skills/user/my-skills');
    return response.data;
  },

  // Add skill to user profile
  async addUserSkill(data: CreateUserSkillData): Promise<UserSkill> {
    const response = await api.post('/skills/user/add', data);
    return response.data;
  },

  // Update user skill
  async updateUserSkill(skillId: number, data: Partial<CreateUserSkillData>): Promise<UserSkill> {
    const response = await api.patch(`/skills/user/${skillId}/update`, data);
    return response.data;
  },

  // Assess skill
  async assessSkill(skillId: number): Promise<UserSkill> {
    const response = await api.patch(`/skills/user/${skillId}/assess`);
    return response.data;
  },

  // Remove user skill
  async removeUserSkill(skillId: number): Promise<void> {
    await api.delete(`/skills/user/${skillId}/remove`);
  },

  // Get recommended skills
  async getRecommendedSkills(limit?: number): Promise<Skill[]> {
    const response = await api.get('/skills/user/recommendations', {
      params: limit ? { limit } : undefined
    });
    return response.data;
  },
};

