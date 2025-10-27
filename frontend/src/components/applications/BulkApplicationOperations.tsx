import React, { useState } from 'react';
import { Button, Card, CardHeader, CardContent } from '../ui';
import { Application } from '../../types';
import { applicationService } from '../../services/applicationService';
import {
  FileText,
  CheckSquare,
  XCircle,
  Send,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface BulkApplicationOperationsProps {
  applications: Application[];
  onUpdate: () => void;
}

export const BulkApplicationOperations: React.FC<BulkApplicationOperationsProps> = ({
  applications,
  onUpdate
}) => {
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app.id));
    }
  };

  const handleSelectOne = (applicationId: number) => {
    setSelectedApplications(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId);
      }
      return [...prev, applicationId];
    });
  };

  const handleBulkAction = async (action: string, status?: string) => {
    if (selectedApplications.length === 0) {
      setError('Please select at least one application');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      for (const applicationId of selectedApplications) {
        switch (action) {
          case 'shortlist':
            await applicationService.updateApplicationStatus(applicationId, 'shortlisted');
            break;
          case 'reject':
            await applicationService.updateApplicationStatus(applicationId, 'rejected');
            break;
          case 'status':
            if (status) {
              await applicationService.updateApplicationStatus(applicationId, status);
            }
            break;
          default:
            break;
        }
      }

      setSuccess(true);
      setSelectedApplications([]);
      
      setTimeout(() => {
        onUpdate();
        setSuccess(false);
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update applications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Bulk Operations</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedApplications.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={loading || applications.length === 0}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              {selectedApplications.length === applications.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-800">Applications updated successfully!</p>
            </div>
          </div>
        )}

        {/* Bulk Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleBulkAction('shortlist')}
            disabled={loading || selectedApplications.length === 0}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Shortlist Selected
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('reject')}
            disabled={loading || selectedApplications.length === 0}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Selected
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('status', 'reviewed')}
            disabled={loading || selectedApplications.length === 0}
          >
            <FileText className="w-4 h-4 mr-2" />
            Mark as Reviewed
          </Button>
        </div>

        {/* Selection Info */}
        {selectedApplications.length > 0 && (
          <p className="text-sm text-gray-600 mt-3">
            You have selected {selectedApplications.length} out of {applications.length} applications
          </p>
        )}
      </CardContent>
    </Card>
  );
};
