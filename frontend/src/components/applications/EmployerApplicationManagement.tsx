import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardContent, Badge } from '../ui';
import { jobService } from '../../services/jobService';
import { Job } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  Briefcase,
  Users,
  Eye,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';

export const EmployerApplicationManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load employer's jobs
      const data = await jobService.getEmployerJobs();
      setJobs(data);
    } catch (err: any) {
      console.error('Error loading jobs:', err);
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (searchQuery === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query) ||
      job.companyName?.toLowerCase().includes(query)
    );
  });

  const calculateTotalApplications = () => {
    return jobs.reduce((total, job) => total + (job.applicationsCount || 0), 0);
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };
    
    if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    if (min) return `${formatCurrency(min)}+`;
    if (max) return `Up to ${formatCurrency(max)}`;
    return 'Salary not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-600 mt-1">Manage your job postings and view applications</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/jobs')}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-primary-600">{calculateTotalApplications()}</p>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">{jobs.filter(j => j.status === 'active').length}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Applications</p>
                <p className="text-2xl font-bold text-purple-600">
                  {jobs.length > 0 ? Math.round(calculateTotalApplications() / jobs.length) : 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your jobs by title, description, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading your jobs...</p>
        </div>
      ) : error ? (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-800">{error}</p>
            <Button
              variant="primary"
              onClick={loadJobs}
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredJobs.length === 0 ? (
        <Card className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No jobs found' : 'No Jobs Posted Yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? "Try adjusting your search terms."
              : "Start posting jobs to receive applications from qualified candidates."}
          </p>
          {!searchQuery && (
            <Button
              variant="primary"
              onClick={() => navigate('/jobs')}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Post Your First Job
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <Badge 
                            className={job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{job.companyName || 'Company Name'}</p>
                        
                        {/* Job Details */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location || 'Location not specified'}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Application Count */}
                  <div className="text-right">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                      <div className="flex flex-col items-center">
                        <Users className="w-6 h-6 text-blue-600 mb-1" />
                        <p className="text-2xl font-bold text-blue-600">{job.applicationsCount || 0}</p>
                        <p className="text-xs text-gray-600">applications</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Job
                  </Button>
                  
                  {(job.applicationsCount || 0) > 0 ? (
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/applications/review/${job.id}`)}
                      className="flex-1"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Applications ({job.applicationsCount})
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled
                      className="flex-1"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      No Applications Yet
                    </Button>
                  )}
                </div>

                {/* Posted Date */}
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Posted: {formatDate(job.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Updated: {formatDate(job.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};