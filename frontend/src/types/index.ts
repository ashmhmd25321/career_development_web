// Frontend types for Career Development Platform

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'employer' | 'admin';
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: number;
  employerId: number;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
  locationType: 'remote' | 'on-site' | 'hybrid';
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  categoryId?: number;
  applicationDeadline?: string;
  startDate?: string;
  status: 'draft' | 'active' | 'paused' | 'closed' | 'expired';
  isActive: boolean;
  isFeatured: boolean;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
  // Additional fields from joins
  companyName?: string;
  companySize?: string;
  industry?: string;
  logoUrl?: string;
  websiteUrl?: string;
  categoryName?: string;
}

export interface CreateJobData {
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  jobType: Job['jobType'];
  locationType: Job['locationType'];
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceLevel: Job['experienceLevel'];
  categoryId?: number;
  applicationDeadline?: string;
  startDate?: string;
  status?: Job['status'];
  // Optional company name to upsert employer profile during job creation
  companyName?: string;
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  jobType?: Job['jobType'];
  locationType?: Job['locationType'];
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceLevel?: Job['experienceLevel'];
  categoryId?: number;
  applicationDeadline?: string;
  startDate?: string;
  status?: Job['status'];
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface JobFilters {
  categoryId?: number;
  jobType?: Job['jobType'];
  locationType?: Job['locationType'];
  experienceLevel?: Job['experienceLevel'];
  location?: string;
  search?: string;
  salaryMin?: number;
  salaryMax?: number;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
  };
  timestamp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'employer';
}

// Application types
export interface Application {
  id: number;
  userId: number;
  jobId: number;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description?: string;
}

export interface CreateApplicationData {
  jobId: number;
  notes?: string;
}

// Bookmark types
export interface JobBookmark {
  id: number;
  userId: number;
  jobId: number;
  createdAt: string;
  // Joined fields
  jobTitle?: string;
  companyName?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description?: string;
  categoryName?: string;
  isActive?: boolean;
  applicationDeadline?: string;
}

export interface CreateBookmarkData {
  jobId: number;
}

// Make this file a module
export {};
