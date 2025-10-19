import { Request, Response } from 'express';
import { jobService } from '@/services/jobService';
import { ApiResponse, AuthUser, CreateJobRequest, UpdateJobRequest, JobFilters } from '@/types';
import { logger } from '@/utils/logger';

interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthUser;
}

export const jobController = {
  async getJobs(req: Request<{}, any, any, JobFilters>, res: Response<ApiResponse>) {
    try {
      const filters: JobFilters = {
        jobType: req.query.jobType as JobFilters['jobType'],
        locationType: req.query.locationType as JobFilters['locationType'],
        experienceLevel: req.query.experienceLevel as JobFilters['experienceLevel'],
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as unknown as string) : undefined,
        location: req.query.location as string,
        search: req.query.search as string,
        salaryMin: req.query.salaryMin ? parseFloat(req.query.salaryMin as unknown as string) : undefined,
        salaryMax: req.query.salaryMax ? parseFloat(req.query.salaryMax as unknown as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as unknown as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as unknown as string) : undefined,
      };

      const jobs = await jobService.findAll(filters);

      res.status(200).json({
        success: true,
        data: { jobs },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to fetch jobs:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch jobs', code: 'FETCH_JOBS_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },

  async getJobById(req: Request<{ id: string }>, res: Response<ApiResponse>): Promise<void> {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid job ID' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const job = await jobService.findById(jobId);
      
      if (!job) {
        res.status(404).json({
          success: false,
          error: { message: 'Job not found' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Increment view count
      await jobService.incrementViewsCount(jobId);

      res.status(200).json({
        success: true,
        data: { job },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to fetch job:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch job', code: 'FETCH_JOB_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },

  async getEmployerJobs(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (req.user.role !== 'employer' && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. Employer role required.' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const jobs = await jobService.findByEmployerId(req.user.id);

      res.status(200).json({
        success: true,
        data: { jobs },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to fetch employer jobs:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch employer jobs', code: 'FETCH_EMPLOYER_JOBS_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },

  async createJob(req: AuthenticatedRequest<{}, any, CreateJobRequest>, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (req.user.role !== 'employer' && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. Employer role required.' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const {
        title,
        description,
        requirements,
        responsibilities,
        benefits,
        jobType,
        locationType,
        location,
        salaryMin,
        salaryMax,
        salaryCurrency,
        experienceLevel,
        categoryId,
        applicationDeadline,
        startDate,
      } = req.body;

      // Basic validation
      if (!title || !description || !jobType || !locationType || !experienceLevel) {
        res.status(400).json({
          success: false,
          error: { message: 'Required fields: title, description, jobType, locationType, experienceLevel' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const jobData = {
        employerId: req.user.id,
        title,
        description,
        requirements,
        responsibilities,
        benefits,
        jobType,
        locationType,
        location,
        salaryMin,
        salaryMax,
        salaryCurrency,
        experienceLevel,
        categoryId,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
      };

      const newJob = await jobService.createJob(jobData);

      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: { job: newJob },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to create job:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create job', code: 'CREATE_JOB_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },

  async updateJob(req: AuthenticatedRequest<{ id: string }, any, UpdateJobRequest>, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid job ID' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if job exists and user owns it
      const existingJob = await jobService.findById(jobId);
      if (!existingJob) {
        res.status(404).json({
          success: false,
          error: { message: 'Job not found' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (req.user.role !== 'admin' && existingJob.employerId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. You can only update your own jobs.' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Convert date strings to Date objects if present
      const updateData: any = { ...req.body };
      if (updateData.applicationDeadline && typeof updateData.applicationDeadline === 'string') {
        updateData.applicationDeadline = new Date(updateData.applicationDeadline);
      }
      if (updateData.startDate && typeof updateData.startDate === 'string') {
        updateData.startDate = new Date(updateData.startDate);
      }

      const updatedJob = await jobService.updateJob(jobId, updateData);

      res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        data: { job: updatedJob },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to update job:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update job', code: 'UPDATE_JOB_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },

  async deleteJob(req: AuthenticatedRequest<{ id: string }>, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid job ID' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if job exists and user owns it
      const existingJob = await jobService.findById(jobId);
      if (!existingJob) {
        res.status(404).json({
          success: false,
          error: { message: 'Job not found' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (req.user.role !== 'admin' && existingJob.employerId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. You can only delete your own jobs.' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const deleted = await jobService.deleteJob(jobId);

      if (!deleted) {
        res.status(500).json({
          success: false,
          error: { message: 'Failed to delete job' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Job deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to delete job:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete job', code: 'DELETE_JOB_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },

  async getJobStats(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (req.user.role !== 'employer' && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. Employer role required.' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const stats = await jobService.getJobStats(req.user.id);

      res.status(200).json({
        success: true,
        data: { stats },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to fetch job stats:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch job stats', code: 'FETCH_JOB_STATS_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },
};
