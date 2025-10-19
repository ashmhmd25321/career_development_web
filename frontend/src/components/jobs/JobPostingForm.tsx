import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Card, CardHeader, CardContent } from '../ui';
import { jobService, jobCategoryService } from '../../services/jobService';
import { CreateJobData, JobCategory } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, MapPin, DollarSign, Calendar, Users, FileText } from 'lucide-react';

interface JobPostingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (job: any) => void;
  editJob?: any; // Job to edit (if provided)
}

export const JobPostingForm: React.FC<JobPostingFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editJob
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    jobType: 'full-time',
    locationType: 'remote',
    location: '',
    salaryMin: undefined,
    salaryMax: undefined,
    salaryCurrency: 'USD',
    experienceLevel: 'entry',
    categoryId: undefined,
    applicationDeadline: '',
    startDate: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (editJob) {
        // Populate form with existing job data for editing
        setFormData({
          title: editJob.title || '',
          description: editJob.description || '',
          requirements: editJob.requirements || '',
          responsibilities: editJob.responsibilities || '',
          benefits: editJob.benefits || '',
          jobType: editJob.jobType || 'full-time',
          locationType: editJob.locationType || 'remote',
          location: editJob.location || '',
          salaryMin: editJob.salaryMin || undefined,
          salaryMax: editJob.salaryMax || undefined,
          salaryCurrency: editJob.salaryCurrency || 'USD',
          experienceLevel: editJob.experienceLevel || 'entry',
          categoryId: editJob.categoryId || undefined,
          applicationDeadline: editJob.applicationDeadline ? 
            new Date(editJob.applicationDeadline).toISOString().split('T')[0] : '',
          startDate: editJob.startDate ? 
            new Date(editJob.startDate).toISOString().split('T')[0] : '',
        });
      }
    }
  }, [isOpen, editJob]);

  const loadCategories = async () => {
    try {
      const categoriesData = await jobCategoryService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleInputChange = (field: keyof CreateJobData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (editJob) {
        result = await jobService.updateJob(editJob.id, formData);
      } else {
        result = await jobService.createJob(formData);
      }
      
      onSuccess?.(result);
      onClose();
    } catch (error: any) {
      console.error('Failed to save job:', error);
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'temporary', label: 'Temporary' },
  ];

  const locationTypes = [
    { value: 'remote', label: 'Remote' },
    { value: 'on-site', label: 'On Site' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editJob ? 'Edit Job Posting' : 'Create Job Posting'}
      size="lg"
    >
      <Card className="bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {editJob ? 'Edit Job Posting' : 'Create New Job'}
              </h3>
              <p className="text-gray-600">
                {editJob ? 'Update your job posting details' : 'Post a new job opportunity'}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Job Title"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  value={formData.jobType}
                  onChange={(e) => handleInputChange('jobType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                >
                  {jobTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                >
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Type
                </label>
                <select
                  value={formData.locationType}
                  onChange={(e) => handleInputChange('locationType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                >
                  {locationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Input
                  label="Location"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>

            {/* Salary Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Minimum Salary"
                  type="number"
                  placeholder="50000"
                  value={formData.salaryMin?.toString() || ''}
                  onChange={(e) => handleInputChange('salaryMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              
              <div>
                <Input
                  label="Maximum Salary"
                  type="number"
                  placeholder="80000"
                  value={formData.salaryMax?.toString() || ''}
                  onChange={(e) => handleInputChange('salaryMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.salaryCurrency}
                  onChange={(e) => handleInputChange('salaryCurrency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Category
              </label>
              <select
                value={formData.categoryId || ''}
                onChange={(e) => handleInputChange('categoryId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                required
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="List the required skills, qualifications, and experience..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
              />
            </div>

            {/* Responsibilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsibilities
              </label>
              <textarea
                value={formData.responsibilities}
                onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                placeholder="Describe the day-to-day responsibilities and duties..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
              />
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits & Perks
              </label>
              <textarea
                value={formData.benefits}
                onChange={(e) => handleInputChange('benefits', e.target.value)}
                placeholder="List the benefits, perks, and advantages of working with your company..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="px-8"
              >
                {editJob ? 'Update Job' : 'Create Job'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Modal>
  );
};
