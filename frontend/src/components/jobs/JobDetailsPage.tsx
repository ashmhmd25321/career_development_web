import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardContent, Badge } from '../ui';
import { jobService } from '../../services/jobService';
import { bookmarkService } from '../../services/bookmarkService';
import { JobApplicationForm } from './JobApplicationForm';
import { JobShareModal } from './JobShareModal';
import { Job } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Award,
  Globe,
  Building2,
  Tag,
  Star,
  Share2,
  Heart,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  FileText
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const loadJobDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const jobData = await jobService.getJobById(parseInt(id!));
      setJob(jobData);
      
      // Check if job is bookmarked (only for authenticated students)
      if (user && user.role === 'student') {
        try {
          const bookmarked = await bookmarkService.isBookmarked(jobData.id);
          setIsBookmarked(bookmarked);
        } catch (err) {
          console.error('Failed to check bookmark status:', err);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      loadJobDetails();
    }
  }, [id, loadJobDetails]);

  const handleBookmark = async () => {
    if (!user || user.role !== 'student' || !job) {
      return;
    }

    try {
      setBookmarkLoading(true);
      
      if (isBookmarked) {
        await bookmarkService.deleteBookmarkByJobId(job.id);
        setIsBookmarked(false);
      } else {
        await bookmarkService.createBookmark({ jobId: job.id });
        setIsBookmarked(true);
      }
    } catch (err: any) {
      console.error('Failed to toggle bookmark:', err);
      // You could show a toast notification here
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    if (max) return `${currency} Up to ${max.toLocaleString()}`;
    return 'Salary not specified';
  };

  const timeAgo = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30);
    const years = Math.round(days / 365);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 30) return `${days} days ago`;
    if (months < 12) return `${months} months ago`;
    return `${years} years ago`;
  };

  if (loading) {
    return (
      <div className="container-custom py-8 md:py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container-custom py-8 md:py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'The job you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/jobs/list')} variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 md:py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/jobs/list')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                    {Boolean(job.isFeatured) && (
                      <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">{job.companyName || 'Company Name'}</span>
                    </div>
                    {job.categoryName && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {job.categoryName}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.locationType && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {job.locationType.charAt(0).toUpperCase() + job.locationType.slice(1)}
                      </Badge>
                    )}
                    {job.jobType && (
                      <Badge variant="info" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                      </Badge>
                    )}
                    {job.experienceLevel && (
                      <Badge variant="warning" className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
                      </Badge>
                    )}
                    {job.location && job.locationType === 'on-site' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {user && user.role === 'student' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBookmark}
                      disabled={bookmarkLoading}
                      className={cn(
                        "flex items-center gap-1",
                        isBookmarked && "text-red-600 border-red-600"
                      )}
                    >
                      <Heart className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                      {bookmarkLoading ? 'Saving...' : (isBookmarked ? 'Saved' : 'Save')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-1"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-700">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {job.applicationsCount} applications
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Posted {timeAgo(job.createdAt)}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Job Description</h2>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Requirements</h2>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Responsibilities</h2>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Benefits</h2>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.benefits}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Now Card */}
          <Card className="sticky top-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.role === 'employer' || user?.role === 'admin' ? 'Job Management' : 'Apply for this position'}
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.role === 'employer' || user?.role === 'admin' ? (
                // Employer View: View Applications Button
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(`/applications/review/${job.id}`)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Applications ({job.applicationsCount})
                </Button>
              ) : (
                // Student View: Apply Now Button
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => setShowApplicationForm(true)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                  
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Quick application process</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>No account required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>{job.applicationsCount} people have applied</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">About {job.companyName || 'Company'}</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{job.companyName || 'Company Name'}</p>
                  <p className="text-sm text-gray-600">{job.industry || 'Technology'}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{job.companySize || '50-200 employees'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{job.location || 'Remote'}</span>
                </div>
                {job.websiteUrl && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <a 
                      href={job.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Company Website
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Job Type</span>
                <span className="font-medium">{job.jobType?.charAt(0).toUpperCase() + job.jobType?.slice(1) || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Experience Level</span>
                <span className="font-medium">{job.experienceLevel?.charAt(0).toUpperCase() + job.experienceLevel?.slice(1) || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location Type</span>
                <span className="font-medium">{job.locationType?.charAt(0).toUpperCase() + job.locationType?.slice(1) || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salary</span>
                <span className="font-medium">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
              </div>
              {job.applicationDeadline && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Application Deadline</span>
                  <span className="font-medium">{new Date(job.applicationDeadline).toLocaleDateString()}</span>
                </div>
              )}
              {job.startDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-medium">{new Date(job.startDate).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

          {/* Application Form Modal */}
          {showApplicationForm && job && (
            <JobApplicationForm
              job={job}
              onClose={() => setShowApplicationForm(false)}
              onSuccess={() => {
                // Refresh job data to update application count
                loadJobDetails();
              }}
            />
          )}

          {/* Share Modal */}
          {showShareModal && job && (
            <JobShareModal
              show={showShareModal}
              onClose={() => setShowShareModal(false)}
              job={job}
            />
          )}
        </div>
      );
    };
