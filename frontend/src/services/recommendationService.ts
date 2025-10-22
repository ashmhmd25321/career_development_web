import axios from 'axios';
import { Job } from '../types';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const authTokens = localStorage.getItem('authTokens');
  if (authTokens) {
    const tokens = JSON.parse(authTokens);
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

export interface RecommendationResponse {
  success: boolean;
  data: {
    recommendations?: Job[];
    jobs?: Job[];
    count: number;
  };
}

export const recommendationService = {
  /**
   * Get personalized job recommendations for the authenticated user
   */
  async getUserRecommendations(limit = 10): Promise<Job[]> {
    try {
      const response = await api.get<RecommendationResponse>(`/recommendations/user?limit=${limit}`);
      return response.data.data.recommendations || [];
    } catch (error) {
      console.error('Failed to get user recommendations:', error);
      throw error;
    }
  },

  /**
   * Get featured jobs for users without preferences
   */
  async getFeaturedJobs(limit = 10): Promise<Job[]> {
    try {
      const response = await api.get<RecommendationResponse>(`/recommendations/featured?limit=${limit}`);
      return response.data.data.jobs || [];
    } catch (error) {
      console.error('Failed to get featured jobs:', error);
      throw error;
    }
  },

  /**
   * Get trending jobs based on application count and activity
   */
  async getTrendingJobs(limit = 10): Promise<Job[]> {
    try {
      const response = await api.get<RecommendationResponse>(`/recommendations/trending?limit=${limit}`);
      return response.data.data.jobs || [];
    } catch (error) {
      console.error('Failed to get trending jobs:', error);
      throw error;
    }
  },

  /**
   * Get similar jobs based on a specific job
   */
  async getSimilarJobs(jobId: number, limit = 5): Promise<Job[]> {
    try {
      const response = await api.get<RecommendationResponse>(`/recommendations/similar/${jobId}?limit=${limit}`);
      return response.data.data.jobs || [];
    } catch (error) {
      console.error('Failed to get similar jobs:', error);
      throw error;
    }
  }
};
