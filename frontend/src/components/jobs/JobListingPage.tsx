import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Input, Badge } from '../ui';
import { jobService, jobCategoryService } from '../../services/jobService';
import { bookmarkService } from '../../services/bookmarkService';
import { Job, JobFilters, JobCategory } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Users, 
  Building,
  Calendar,
  Star,
  ChevronDown,
  X,
  Heart
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface JobListingPageProps {
  className?: string;
}

export const JobListingPage: React.FC<JobListingPageProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<number>>(new Set());
  
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    jobType: undefined,
    locationType: undefined,
    experienceLevel: undefined,
    categoryId: undefined,
    location: '',
    salaryMin: undefined,
    salaryMax: undefined
  });

  // Load jobs and categories on component mount
  useEffect(() => {
    loadJobs();
    loadCategories();
    loadBookmarkedJobs();
  }, []);

  // Load jobs when filters change
  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const jobList = await jobService.getJobs(filters);
      setJobs(jobList);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadCategories = useCallback(async () => {
    try {
      const categoryList = await jobCategoryService.getCategories();
      setCategories(categoryList);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset pagination when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      jobType: undefined,
      locationType: undefined,
      experienceLevel: undefined,
      categoryId: undefined,
      location: '',
      salaryMin: undefined,
      salaryMax: undefined
    });
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    if (max) return `Up to ${currency} ${max.toLocaleString()}`;
    return 'Salary not specified';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'internship': return 'bg-orange-100 text-orange-800';
      case 'temporary': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loadBookmarkedJobs = useCallback(async () => {
    if (!user || user.role !== 'student') return;
    
    try {
      const bookmarks = await bookmarkService.getUserBookmarks();
      const bookmarkedIds = new Set(bookmarks.map(b => b.jobId));
      setBookmarkedJobs(bookmarkedIds);
    } catch (err) {
      console.error('Failed to load bookmarked jobs:', err);
    }
  }, [user]);

  const handleBookmark = async (jobId: number) => {
    if (!user || user.role !== 'student') return;

    try {
      if (bookmarkedJobs.has(jobId)) {
        await bookmarkService.deleteBookmarkByJobId(jobId);
        setBookmarkedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await bookmarkService.createBookmark({ jobId });
        setBookmarkedJobs(prev => new Set(prev).add(jobId));
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'executive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'remote': return 'bg-blue-100 text-blue-800';
      case 'on-site': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
          Find Your Dream Job
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover opportunities that match your skills and career goals
        </p>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search jobs, companies, or keywords..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            
            {(filters.search || filters.jobType || filters.locationType || filters.experienceLevel || filters.categoryId || filters.location) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-600 hover:text-red-600"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Job Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  value={filters.jobType || ''}
                  onChange={(e) => handleFilterChange('jobType', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>

              {/* Location Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location Type</label>
                <select
                  value={filters.locationType || ''}
                  onChange={(e) => handleFilterChange('locationType', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="on-site">On Site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Experience Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                <select
                  value={filters.experienceLevel || ''}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {loading ? 'Loading...' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-red-800">{error}</p>
          </div>
        </Card>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map(job => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                {/* Job Info */}
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 hover:text-primary-600 cursor-pointer">
                          {job.title}
                        </h3>
                        {Boolean(job.isFeatured) && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Building className="w-4 h-4" />
                          <span>{job.companyName || 'Company Name'}</span>
                        </div>
                        {job.categoryName && (
                          <Badge variant="outline" className="text-xs">
                            {job.categoryName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Job Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {job.locationType === 'remote' ? 'Remote' : 
                         job.locationType === 'hybrid' ? 'Hybrid' : 
                         job.location || 'Location not specified'}
                      </span>
                    </div>
                    
                    <Badge className={getJobTypeColor(job.jobType)}>
                      {job.jobType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Badge>
                    
                    <Badge className={getExperienceLevelColor(job.experienceLevel)}>
                      {job.experienceLevel.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Badge>
                    
                    <Badge className={getLocationTypeColor(job.locationType)}>
                      {job.locationType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Badge>
                  </div>

                  {/* Salary and Stats */}
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{job.applicationsCount} applications</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Posted {formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                  <Button variant="primary" className="whitespace-nowrap">
                    Apply Now
                  </Button>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="whitespace-nowrap flex-1"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Details
                    </Button>
                    {user && user.role === 'student' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBookmark(job.id)}
                        className={cn(
                          "px-2",
                          bookmarkedJobs.has(job.id) && "text-red-600 border-red-600"
                        )}
                      >
                        <Heart className={cn("w-4 h-4", bookmarkedJobs.has(job.id) && "fill-current")} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {!loading && jobs.length === 0 && !error && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more opportunities.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </Card>
      )}
    </div>
  );
};
