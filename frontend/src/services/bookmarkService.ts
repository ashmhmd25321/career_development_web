import axios from 'axios';
import { JobBookmark, CreateBookmarkData } from '../types';

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
      console.error('Failed to parse auth tokens from localStorage', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const bookmarkService = {
  async getUserBookmarks(): Promise<JobBookmark[]> {
    const response = await api.get('/bookmarks/my-bookmarks');
    return response.data.data;
  },

  async createBookmark(data: CreateBookmarkData): Promise<JobBookmark> {
    const response = await api.post('/bookmarks', data);
    return response.data.data;
  },

  async deleteBookmark(bookmarkId: number): Promise<void> {
    await api.delete(`/bookmarks/${bookmarkId}`);
  },

  async deleteBookmarkByJobId(jobId: number): Promise<void> {
    await api.delete(`/bookmarks/job/${jobId}`);
  },

  async isBookmarked(jobId: number): Promise<boolean> {
    const response = await api.get(`/bookmarks/job/${jobId}/status`);
    return response.data.data.isBookmarked;
  },

  async getBookmarkCount(jobId: number): Promise<number> {
    const response = await api.get(`/bookmarks/job/${jobId}/count`);
    return response.data.data.count;
  }
};
