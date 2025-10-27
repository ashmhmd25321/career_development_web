import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardContent, Badge, Modal } from '../ui';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  Briefcase,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Search
} from 'lucide-react';
import { cn } from '../../utils/cn';

const formatDate = (dateInput: string | Date) => {
  try {
    let date: Date;
    if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else {
      date = dateInput;
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error, 'Input:', dateInput);
    return 'Invalid Date';
  }
};

interface ApplicationReviewProps {
  jobId?: number;
}

export const ApplicationReviewPage: React.FC<ApplicationReviewProps> = ({ jobId }) => {
  const { id: routeJobId } = useParams<{ id: string }>();
  const actualJobId = jobId || parseInt(routeJobId || '0');
  const { user: _user } = useAuth();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [reviewNotes, setReviewNotes] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    if (actualJobId) {
      loadApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualJobId]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationService.getJobApplications(actualJobId);
      setApplications(data);
      calculateStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps: Application[]) => {
    const stats = {
      total: apps.length,
      pending: apps.filter(app => app.status === 'pending').length,
      reviewed: apps.filter(app => app.status === 'reviewed').length,
      accepted: apps.filter(app => app.status === 'accepted').length,
      rejected: apps.filter(app => app.status === 'rejected').length
    };
    setStats(stats);
  };

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus, reviewNotes);
      await loadApplications();
      setShowDetailsModal(false);
      setReviewNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to update application status');
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setSelectedStatus(application.status);
    setReviewNotes(application.notes || '');
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-300',
      accepted: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'reviewed':
        return <Eye className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!actualJobId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-600">
              No job ID provided
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            Loading applications...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-600">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
          <p className="text-gray-600 mt-1">Manage and review job applications</p>
        </div>
        <Button 
          onClick={() => navigate(-1)}
          variant="outline"
        >
          Back to Jobs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reviewed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reviewed}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'reviewed', 'accepted', 'rejected'].map((status) => (
                <Button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  variant={filterStatus === status ? 'primary' : 'outline'}
                  size="sm"
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-600">
                No applications found
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {`${application.firstName?.[0] || ''}${application.lastName?.[0] || ''}`}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.firstName} {application.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{application.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {application.phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(application.appliedAt)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        {application.jobTitle}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn(getStatusColor(application.status))}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(application.status)}
                            <span className="capitalize">{application.status}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                    
                    {application.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">{application.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleViewDetails(application)}
                      variant="primary"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          size="lg"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Applicant Info */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Applicant Information</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedApplication.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Applied On</p>
                      <p className="font-medium">{formatDate(selectedApplication.appliedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Update */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Update Status</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add notes about this application..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStatusChange(selectedApplication.id, selectedStatus)}
                        className="flex-1"
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDetailsModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApplicationReviewPage;
