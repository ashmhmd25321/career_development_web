import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Badge } from '../ui';
import { bookmarkService } from '../../services/bookmarkService';
import { JobBookmark } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Award,
  Tag,
  Building2,
  Eye,
  Trash2,
  Bookmark,
  Filter,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const SavedJobsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<JobBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookmarkService.getUserBookmarks();
      setBookmarks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: number) => {
    if (!window.confirm('Are you sure you want to remove this job from your saved list?')) {
      return;
    }
    try {
      setLoading(true);
      await bookmarkService.deleteBookmark(bookmarkId);
      loadBookmarks(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to remove bookmark');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    return 'Salary not specified';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'full-time':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-blue-100 text-blue-800';
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      case 'internship':
        return 'bg-orange-100 text-orange-800';
      case 'temporary':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'entry':
        return 'bg-green-100 text-green-800';
      case 'mid':
        return 'bg-blue-100 text-blue-800';
      case 'senior':
        return 'bg-purple-100 text-purple-800';
      case 'executive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark =>
    filterType === 'all' ? true : bookmark.jobType === filterType
  );

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600">Please log in as a student to view your saved jobs.</p>
      </div>
    );
  }

  if (loading) {
    return <p className="text-center py-8 text-gray-600">Loading your saved jobs...</p>;
  }

  if (error) {
    return <p className="text-center py-8 text-red-600">Error: {error}</p>;
  }

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-6 lg:mb-0">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Saved Jobs</h1>
          <p className="text-lg text-gray-600">Your bookmarked job opportunities</p>
        </div>
        <Button variant="outline" onClick={loadBookmarks} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Saved</p>
                <p className="text-3xl font-bold text-blue-900">{bookmarks.length}</p>
              </div>
              <Bookmark className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Jobs</p>
                <p className="text-3xl font-bold text-green-900">
                  {bookmarks.filter(b => b.isActive).length}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Full-time</p>
                <p className="text-3xl font-bold text-purple-900">
                  {bookmarks.filter(b => b.jobType === 'full-time').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Internships</p>
                <p className="text-3xl font-bold text-orange-900">
                  {bookmarks.filter(b => b.jobType === 'internship').length}
                </p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button
          variant={filterType === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterType('all')}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          All Jobs
        </Button>
        <Button
          variant={filterType === 'full-time' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterType('full-time')}
        >
          Full-time
        </Button>
        <Button
          variant={filterType === 'part-time' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterType('part-time')}
        >
          Part-time
        </Button>
        <Button
          variant={filterType === 'contract' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterType('contract')}
        >
          Contract
        </Button>
        <Button
          variant={filterType === 'internship' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterType('internship')}
        >
          Internship
        </Button>
      </div>

      {/* Bookmarks List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredBookmarks.length === 0 ? (
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardContent className="p-12 text-center">
              <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Saved Jobs</h3>
              <p className="text-gray-600 mb-6">
                {filterType === 'all' 
                  ? "You haven't saved any jobs yet. Start browsing and bookmark jobs you're interested in!"
                  : `No ${filterType} jobs saved. Try changing the filter or browse more jobs.`
                }
              </p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/jobs/list')}
                className="flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div className="mb-3 md:mb-0">
                    <h3
                      className="text-2xl font-bold text-gray-800 hover:text-primary-600 transition-colors cursor-pointer"
                      onClick={() => navigate(`/jobs/${bookmark.jobId}`)}
                    >
                      {bookmark.jobTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={cn("flex items-center gap-1", getJobTypeColor(bookmark.jobType || ''))}>
                        <Briefcase className="w-3 h-3" />
                        {bookmark.jobType}
                      </Badge>
                      <Badge variant="outline" className={cn("flex items-center gap-1", getExperienceColor(bookmark.experienceLevel || ''))}>
                        <Award className="w-3 h-3" />
                        {bookmark.experienceLevel}
                      </Badge>
                      {bookmark.categoryName && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {bookmark.categoryName}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <img src="/path/to/company-logo.png" alt="Company Logo" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-gray-600 text-sm mb-4">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {bookmark.companyName || 'Company Name'}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {bookmark.location || 'Location not specified'}
                  </span>
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {formatSalary(bookmark.salaryMin, bookmark.salaryMax, bookmark.salaryCurrency)}
                  </span>
                </div>

                {bookmark.description && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {bookmark.description}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center space-x-4 text-gray-500 text-xs mb-3 sm:mb-0">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Saved on {formatDate(bookmark.createdAt)}
                    </span>
                    {bookmark.applicationDeadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Deadline: {formatDate(bookmark.applicationDeadline)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${bookmark.jobId}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Job
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
