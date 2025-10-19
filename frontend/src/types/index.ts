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
  expiresIn: string;
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
  jobId: number;
  studentId: number;
  coverLetter?: string;
  resumeUrl?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'offered' | 'rejected' | 'withdrawn';
  appliedAt: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationRequest {
  jobId: number;
  coverLetter?: string;
  resumeUrl?: string;
}
