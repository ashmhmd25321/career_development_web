import axios from 'axios';
import { Job, CreateJobData, JobFilters, JobCategory, ApiResponse } from '../types';

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

export const jobService = {
  // Get all jobs with optional filters
  async getJobs(filters: JobFilters = {}): Promise<Job[]> {
    try {
      const response = await api.get<ApiResponse<{ jobs: Job[] }>>('/jobs', {
        params: filters,
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data.jobs;
      }
      throw new Error(response.data.error?.message || 'Failed to fetch jobs');
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  // Get job by ID
  async getJobById(id: number): Promise<Job> {
    try {
      const response = await api.get<ApiResponse<{ job: Job }>>(`/jobs/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.job;
      }
      throw new Error(response.data.error?.message || 'Failed to fetch job');
    } catch (error: any) {
      console.error('Error fetching job:', error);
      throw error;
    }
  },

  // Get employer's jobs
  async getEmployerJobs(): Promise<Job[]> {
    try {
      const response = await api.get<ApiResponse<{ jobs: Job[] }>>('/jobs/employer/my-jobs');
      
      if (response.data.success && response.data.data) {
        return response.data.data.jobs;
      }
      throw new Error(response.data.error?.message || 'Failed to fetch employer jobs');
    } catch (error: any) {
      console.error('Error fetching employer jobs:', error);
      throw error;
    }
  },

  // Create a new job
  async createJob(jobData: CreateJobData): Promise<Job> {
    try {
      const response = await api.post<ApiResponse<{ job: Job }>>('/jobs', jobData);
      
      if (response.data.success && response.data.data) {
        return response.data.data.job;
      }
      throw new Error(response.data.error?.message || 'Failed to create job');
    } catch (error: any) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  // Update a job
  async updateJob(id: number, jobData: Partial<CreateJobData>): Promise<Job> {
    try {
      const response = await api.put<ApiResponse<{ job: Job }>>(`/jobs/${id}`, jobData);
      
      if (response.data.success && response.data.data) {
        return response.data.data.job;
      }
      throw new Error(response.data.error?.message || 'Failed to update job');
    } catch (error: any) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  // Delete a job
  async deleteJob(id: number): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(`/jobs/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to delete job');
      }
    } catch (error: any) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  // Get job statistics for employer
  async getJobStats(): Promise<any> {
    try {
      const response = await api.get<ApiResponse<{ stats: any }>>('/jobs/employer/stats');
      
      if (response.data.success && response.data.data) {
        return response.data.data.stats;
      }
      throw new Error(response.data.error?.message || 'Failed to fetch job stats');
    } catch (error: any) {
      console.error('Error fetching job stats:', error);
      throw error;
    }
  },
};

export const jobCategoryService = {
  // Get all job categories
  async getCategories(): Promise<JobCategory[]> {
    try {
      const response = await api.get<ApiResponse<{ categories: JobCategory[] }>>('/job-categories');
      
      if (response.data.success && response.data.data) {
        return response.data.data.categories;
      }
      throw new Error(response.data.error?.message || 'Failed to fetch job categories');
    } catch (error: any) {
      console.error('Error fetching job categories:', error);
      throw error;
    }
  },

  // Get job category by ID
  async getCategoryById(id: number): Promise<JobCategory> {
    try {
      const response = await api.get<ApiResponse<{ category: JobCategory }>>(`/job-categories/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.category;
      }
      throw new Error(response.data.error?.message || 'Failed to fetch job category');
    } catch (error: any) {
      console.error('Error fetching job category:', error);
      throw error;
    }
  },
};
