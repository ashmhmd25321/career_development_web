import React, { useState } from 'react';
import { Job } from '../../types';
import { jobService } from '../../services/jobService';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MoreHorizontal,
  Edit3
} from 'lucide-react';

interface JobStatusManagerProps {
  job: Job;
  onStatusUpdate: (updatedJob: Job) => void;
  className?: string;
}

const statusConfig: Record<Job['status'], {
  label: string;
  color: string;
  icon: React.ComponentType<any>;
  description: string;
}> = {
  draft: {
    label: 'Draft',
    color: 'text-gray-600 bg-gray-100',
    icon: Edit3,
    description: 'Job is saved but not published'
  },
  active: {
    label: 'Active',
    color: 'text-green-600 bg-green-100',
    icon: Play,
    description: 'Job is live and accepting applications'
  },
  paused: {
    label: 'Paused',
    color: 'text-yellow-600 bg-yellow-100',
    icon: Pause,
    description: 'Job is temporarily paused'
  },
  closed: {
    label: 'Closed',
    color: 'text-red-600 bg-red-100',
    icon: Square,
    description: 'Job is closed and not accepting applications'
  },
  expired: {
    label: 'Expired',
    color: 'text-orange-600 bg-orange-100',
    icon: Clock,
    description: 'Job has expired'
  }
};

export const JobStatusManager: React.FC<JobStatusManagerProps> = ({
  job,
  onStatusUpdate,
  className = ''
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const currentStatus = statusConfig[job.status];
  const StatusIcon = currentStatus.icon;

  const handleStatusChange = async (newStatus: Job['status']) => {
    if (newStatus === job.status) return;

    setIsUpdating(true);
    try {
      const updatedJob = await jobService.updateJobStatus(job.id, newStatus);
      onStatusUpdate(updatedJob);
      alert(`Job status updated to ${statusConfig[newStatus].label}`);
      setShowStatusMenu(false);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to update job status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getAvailableStatuses = (currentStatus: Job['status']): Job['status'][] => {
    const statusFlow: Record<Job['status'], Job['status'][]> = {
      draft: ['active', 'closed'],
      active: ['paused', 'closed', 'expired'],
      paused: ['active', 'closed'],
      closed: ['active', 'draft'],
      expired: ['active', 'closed']
    };
    return statusFlow[currentStatus] || [];
  };

  const availableStatuses = getAvailableStatuses(job.status);

  return (
    <div className={`relative ${className}`}>
      {/* Current Status Display */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${currentStatus.color}`}>
          <StatusIcon className="w-4 h-4" />
          <span>{currentStatus.label}</span>
        </div>
        
        {/* Status Change Button */}
        {availableStatuses.length > 0 && (
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            disabled={isUpdating}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MoreHorizontal className="w-4 h-4" />
            Change Status
          </button>
        )}
      </div>

      {/* Status Description */}
      <p className="text-sm text-gray-500 mt-2">
        {currentStatus.description}
      </p>

      {/* Status Menu Dropdown */}
      {showStatusMenu && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Change Status</h4>
            <div className="space-y-1">
              {availableStatuses.map((status) => {
                const config = statusConfig[status];
                const Icon = config.icon;
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={isUpdating}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      <Icon className="w-3 h-3" />
                      <span>{config.label}</span>
                    </div>
                    <span className="text-gray-600">{config.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            Updating...
          </div>
        </div>
      )}
    </div>
  );
};

export default JobStatusManager;
