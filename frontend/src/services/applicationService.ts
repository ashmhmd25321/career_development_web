import axios from 'axios';
import { Application, CreateApplicationData } from '../types';

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

export const applicationService = {
  // Get applications for a specific job (employer view)
  async getJobApplications(jobId: number): Promise<Application[]> {
    const response = await api.get(`/applications/job/${jobId}`);
    return response.data.data;
  },

  // Get user's own applications
  async getUserApplications(): Promise<Application[]> {
    const response = await api.get('/applications/my-applications');
    return response.data.data;
  },

  // Get application by ID
  async getApplicationById(applicationId: number): Promise<Application> {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data.data;
  },

  // Create new application
  async createApplication(applicationData: CreateApplicationData): Promise<Application> {
    const response = await api.post('/applications', applicationData);
    return response.data.data;
  },

  // Update application status (employer only)
  async updateApplicationStatus(
    applicationId: number, 
    status: string, 
    notes?: string
  ): Promise<Application> {
    const response = await api.patch(`/applications/${applicationId}/status`, {
      status,
      notes
    });
    return response.data.data;
  },

  // Delete application
  async deleteApplication(applicationId: number): Promise<void> {
    await api.delete(`/applications/${applicationId}`);
  }
};
