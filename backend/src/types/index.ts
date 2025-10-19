// Database model types for Career Development Platform

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'employer' | 'admin';
  phone?: string;
  bio?: string;
  location?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'student' | 'employer' | 'admin';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  student_id?: string;
  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  university?: string;
  major?: string;
  graduation_date?: Date;
  gpa?: number;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  bio?: string;
  career_objectives?: string;
  availability_status: 'available' | 'busy' | 'unavailable';
  created_at: Date;
  updated_at: Date;
}

export interface EmployerProfile {
  id: number;
  user_id: number;
  company_name: string;
  company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  industry?: string;
  website_url?: string;
  company_description?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  linkedin_url?: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface JobCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobCategoryData {
  name: string;
  description?: string;
}

export interface UpdateJobCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Skill {
  id: number;
  name: string;
  category?: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
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
  applicationDeadline?: Date;
  startDate?: Date;
  isActive: boolean;
  isFeatured: boolean;
  viewsCount: number;
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields from joins
  companyName?: string;
  companySize?: string;
  industry?: string;
  logoUrl?: string;
  websiteUrl?: string;
  categoryName?: string;
}

export interface JobSkill {
  id: number;
  job_id: number;
  skill_id: number;
  is_required: boolean;
  created_at: Date;
}

export interface Application {
  id: number;
  job_id: number;
  student_id: number;
  cover_letter?: string;
  resume_url?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'offered' | 'rejected' | 'withdrawn';
  applied_at: Date;
  reviewed_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface StudentSkill {
  id: number;
  student_id: number;
  skill_id: number;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience: number;
  created_at: Date;
  updated_at: Date;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  event_type: 'workshop' | 'seminar' | 'networking' | 'career_fair' | 'webinar';
  organizer_id: number;
  start_date: Date;
  end_date: Date;
  location?: string;
  location_type: 'online' | 'in-person' | 'hybrid';
  max_attendees?: number;
  registration_deadline?: Date;
  is_active: boolean;
  is_free: boolean;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export interface EventRegistration {
  id: number;
  event_id: number;
  user_id: number;
  registration_date: Date;
  attendance_status: 'registered' | 'attended' | 'no_show';
  feedback?: string;
  rating?: number;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'job' | 'application' | 'event' | 'system' | 'message';
  is_read: boolean;
  related_id?: number;
  created_at: Date;
  read_at?: Date;
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'employer';
  phone?: string;
}

export interface CreateJobRequest {
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
  salaryCurrency?: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  categoryId?: number;
  applicationDeadline?: string;
  startDate?: string;
  skills?: number[];
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  jobType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
  locationType?: 'remote' | 'on-site' | 'hybrid';
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  categoryId?: number;
  applicationDeadline?: string;
  startDate?: string;
  skills?: number[];
}

export interface CreateApplicationRequest {
  job_id: number;
  cover_letter?: string;
  resume_url?: string;
}

export interface UpdateApplicationRequest {
  id: number;
  status: Application['status'];
  notes?: string;
}

export interface CreateJobCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateJobCategoryRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Auth types
export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: User['role'];
  avatar_url?: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: User['role'];
  iat?: number;
  exp?: number;
}

// Query types
export interface JobFilters {
  categoryId?: number;
  jobType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
  locationType?: 'remote' | 'on-site' | 'hybrid';
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  location?: string;
  search?: string;
  salaryMin?: number;
  salaryMax?: number;
  limit?: number;
  offset?: number;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface CreateJobData {
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
  salaryCurrency?: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  categoryId?: number;
  applicationDeadline?: Date;
  startDate?: Date;
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  jobType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
  locationType?: 'remote' | 'on-site' | 'hybrid';
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  categoryId?: number;
  applicationDeadline?: Date;
  startDate?: Date;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}
