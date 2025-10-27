import React from 'react';
import { Application } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText,
  Calendar,
  UserCheck
} from 'lucide-react';

interface ApplicationTimelineProps {
  application: Application;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Pending Review',
    description: 'Your application is being reviewed'
  },
  reviewed: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Under Review',
    description: 'Application is being evaluated'
  },
  shortlisted: {
    icon: UserCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Shortlisted',
    description: 'You have been shortlisted for this position'
  },
  interview: {
    icon: Calendar,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    label: 'Interview Scheduled',
    description: 'Interview has been scheduled'
  },
  accepted: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Accepted',
    description: 'Congratulations! Your application has been accepted'
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Rejected',
    description: 'Application has been rejected'
  },
  withdrawn: {
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'Withdrawn',
    description: 'Application has been withdrawn'
  }
};

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ application }) => {
  const statuses = ['pending', 'reviewed', 'shortlisted', 'interview', 'accepted'];
  const currentStatus = application.status || 'pending';
  const currentStatusIndex = statuses.indexOf(currentStatus);

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Timeline</h3>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Timeline Items */}
        <div className="space-y-6">
          {statuses.map((status, index) => {
            const statusInfo = getStatusInfo(status);
            const Icon = statusInfo.icon;
            const isActive = status === currentStatus;
            const isCompleted = index < currentStatusIndex;
            const isPending = index > currentStatusIndex;

            return (
              <div key={status} className="relative flex items-start gap-4">
                {/* Status Icon */}
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-100 border-2 border-green-500' 
                    : isActive 
                    ? `${statusInfo.bgColor} border-2 border-primary-500` 
                    : 'bg-gray-100 border-2 border-gray-300'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isCompleted 
                      ? 'text-green-600' 
                      : isActive 
                      ? statusInfo.color 
                      : 'text-gray-400'
                  }`} />
                </div>

                {/* Status Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-medium ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {statusInfo.label}
                    </h4>
                    {index <= currentStatusIndex && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isActive 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {index === currentStatusIndex ? 'Current' : 'Completed'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{statusInfo.description}</p>
                  
                  {/* Status Date */}
                  {isActive && application.updatedAt && (
                    <p className="text-xs text-gray-500">
                      Updated: {formatDate(application.updatedAt)}
                    </p>
                  )}
                  
                  {/* Application Date */}
                  {status === 'pending' && application.createdAt && (
                    <p className="text-xs text-gray-500">
                      Applied: {formatDate(application.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rejected state */}
        {currentStatus === 'rejected' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${statusConfig[currentStatus].bgColor}`}>
                {React.createElement(statusConfig[currentStatus].icon, {
                  className: `w-5 h-5 ${statusConfig[currentStatus].color}`
                })}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {statusConfig[currentStatus].label}
                </h4>
                <p className="text-xs text-gray-600">{statusConfig[currentStatus].description}</p>
                {application.updatedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Updated: {formatDate(application.updatedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
