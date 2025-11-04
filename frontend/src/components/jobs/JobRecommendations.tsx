import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Badge } from '../ui';
import { recommendationService } from '../../services/recommendationService';
import { bookmarkService } from '../../services/bookmarkService';
import { JobShareModal } from './JobShareModal';
import { Job } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  Sparkles,
  TrendingUp,
  Star,
  Heart,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Building,
  RefreshCw,
  Eye,
  Share2
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface JobRecommendationsProps {
  className?: string;
  type?: 'personalized' | 'featured' | 'trending';
  limit?: number;
  title?: string;
  showHeader?: boolean;
}

export const JobRecommendations: React.FC<JobRecommendationsProps> = ({
  className = '',
  type = 'personalized',
  limit = 6,
  title,
  showHeader = true
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<number>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedJobForShare, setSelectedJobForShare] = useState<Job | null>(null);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      let jobList: Job[] = [];
      
      switch (type) {
        case 'personalized':
          if (user && user.role === 'student') {
            jobList = await recommendationService.getUserRecommendations(limit);
          } else {
            jobList = await recommendationService.getFeaturedJobs(limit);
          }
          break;
        case 'featured':
          jobList = await recommendationService.getFeaturedJobs(limit);
          break;
        case 'trending':
          jobList = await recommendationService.getTrendingJobs(limit);
          break;
        default:
          jobList = await recommendationService.getFeaturedJobs(limit);
      }

      setJobs(jobList);
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarkedJobs = async () => {
    if (!user || user.role !== 'student') return;

    try {
      const bookmarks = await bookmarkService.getUserBookmarks();
      const bookmarkedIds = new Set(bookmarks.map(b => b.jobId));
      setBookmarkedJobs(bookmarkedIds);
    } catch (err) {
      console.error('Failed to load bookmarked jobs:', err);
    }
  };

  useEffect(() => {
    loadRecommendations();
    loadBookmarkedJobs();
  }, [type, limit, user]);

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

  const handleShare = (job: Job) => {
    setSelectedJobForShare(job);
    setShowShareModal(true);
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

  const getJobTypeColor = (jobType?: string) => {
    if (!jobType) return 'bg-gray-100 text-gray-800';
    switch (jobType) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'internship': return 'bg-orange-100 text-orange-800';
      case 'temporary': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExperienceLevelColor = (level?: string) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'executive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'personalized':
        return user && user.role === 'student' ? 'Recommended for You' : 'Featured Jobs';
      case 'featured':
        return 'Featured Opportunities';
      case 'trending':
        return 'Trending Jobs';
      default:
        return 'Job Recommendations';
    }
  };

  const getRecommendationIcon = () => {
    switch (type) {
      case 'personalized':
        return <Sparkles className="w-5 h-5" />;
      case 'featured':
        return <Star className="w-5 h-5" />;
      case 'trending':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getRecommendationIcon()}
              <h2 className="text-2xl font-bold text-gray-900">{getRecommendationTitle()}</h2>
            </div>
          </div>
        )}
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getRecommendationIcon()}
              <h2 className="text-2xl font-bold text-gray-900">{getRecommendationTitle()}</h2>
            </div>
          </div>
        )}
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button variant="outline" onClick={loadRecommendations} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getRecommendationIcon()}
              <h2 className="text-2xl font-bold text-gray-900">{getRecommendationTitle()}</h2>
            </div>
          </div>
        )}
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations available</h3>
          <p className="text-gray-600">Check back later for new opportunities!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getRecommendationIcon()}
            <h2 className="text-2xl font-bold text-gray-900">{getRecommendationTitle()}</h2>
          </div>
          <Button variant="outline" onClick={loadRecommendations} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary-500">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold text-gray-800 hover:text-primary-600 transition-colors cursor-pointer line-clamp-2"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    {job.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                    <Building className="w-4 h-4 text-gray-400" />
                    {job.companyName || 'Company Name'}
                  </p>
                </div>
                {job.logoUrl && (
                  <img 
                    src={job.logoUrl} 
                    alt={`${job.companyName} logo`} 
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 ml-3" 
                  />
                )}
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3 text-sm">{job.description}</p>

              <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {job.locationType === 'remote' ? 'Remote' :
                     job.locationType === 'hybrid' ? 'Hybrid' :
                     job.location || 'Location not specified'}
                  </span>
                </div>

                {job.jobType && (
                  <Badge className={getJobTypeColor(job.jobType)}>
                    {job.jobType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </Badge>
                )}

                {job.experienceLevel && (
                  <Badge className={getExperienceLevelColor(job.experienceLevel)}>
                    {job.experienceLevel.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
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

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
                
                {user && user.role === 'student' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookmark(job.id)}
                    className={cn(
                      "px-3",
                      bookmarkedJobs.has(job.id) && "text-red-600 border-red-600"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", bookmarkedJobs.has(job.id) && "fill-current")} />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(job)}
                  className="px-3"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Share Modal */}
      {showShareModal && selectedJobForShare && (
        <JobShareModal
          show={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedJobForShare(null);
          }}
          job={selectedJobForShare}
        />
      )}
    </div>
  );
};
