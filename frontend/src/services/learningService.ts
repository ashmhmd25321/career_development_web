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

export interface LearningResource {
  id: number;
  title: string;
  description: string | null;
  resourceType: 'Article' | 'Video' | 'Course' | 'Tutorial' | 'Documentation' | 'Webinar' | 'Book';
  url: string | null;
  skillId: number | null;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  durationMinutes: number | null;
  free: boolean;
  externalLink: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: number;
  title: string;
  description: string | null;
  issuingOrganization: string | null;
  skillId: number | null;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  validityPeriodMonths: number | null;
  cost: number | null;
  examRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPath {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  targetRole: string | null;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDurationHours: number | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearningStats {
  totalResourcesStarted: number;
  totalResourcesCompleted: number;
  totalCertifications: number;
  certificationsExpiringSoon: number;
  averageRating: number;
}

export const learningService = {
  // Resources
  async getAllResources(): Promise<LearningResource[]> {
    const response = await api.get('/learning/resources');
    return response.data;
  },

  async getResourceById(id: number): Promise<LearningResource> {
    const response = await api.get(`/learning/resources/${id}`);
    return response.data;
  },

  async getUserProgress(resourceId: number): Promise<any> {
    const response = await api.get(`/learning/resources/${resourceId}/progress`);
    return response.data;
  },

  async updateProgress(resourceId: number, data: {
    status?: 'Not Started' | 'In Progress' | 'Completed';
    progressPercentage?: number;
    notes?: string;
    rating?: number;
  }): Promise<any> {
    const response = await api.patch(`/learning/resources/${resourceId}/progress`, data);
    return response.data;
  },

  // Certifications
  async getAllCertifications(): Promise<Certification[]> {
    const response = await api.get('/learning/certifications');
    return response.data;
  },

  async getUserCertifications(): Promise<any[]> {
    const response = await api.get('/learning/certifications/my');
    return response.data;
  },

  async addUserCertification(data: {
    certificationId: number;
    certificationNumber?: string;
    issuedDate: string;
    expiryDate?: string;
    verificationDocumentUrl?: string;
  }): Promise<any> {
    const response = await api.post('/learning/certifications', data);
    return response.data;
  },

  // Learning Paths
  async getAllPaths(): Promise<LearningPath[]> {
    const response = await api.get('/learning/paths');
    return response.data;
  },

  async getPathById(id: number): Promise<LearningPath> {
    const response = await api.get(`/learning/paths/${id}`);
    return response.data;
  },

  // Statistics
  async getLearningStats(): Promise<LearningStats> {
    const response = await api.get('/learning/stats');
    return response.data;
  },
};

