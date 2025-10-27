import React from 'react';
import { Modal } from '../ui';
import { Application } from '../../types';
import { ApplicationTimeline } from './ApplicationTimeline';
import { Button } from '../ui';
import { X } from 'lucide-react';

interface ApplicationDetailsModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  application,
  isOpen,
  onClose
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
            <p className="text-gray-600">Track your application progress</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Job Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{application.jobTitle}</h3>
          <p className="text-sm text-gray-600">{application.companyName}</p>
        </div>

        {/* Application Timeline */}
        <ApplicationTimeline application={application} />

        {/* Additional Details */}
        {application.notes && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Cover Letter</h3>
            <p className="text-sm text-gray-700">{application.notes}</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Applied:</span>
            <span className="ml-2 font-medium text-gray-900">{formatDate(application.appliedAt)}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium text-gray-900">{formatDate(application.updatedAt)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
