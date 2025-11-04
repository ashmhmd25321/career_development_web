import React, { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardContent, Input } from '../ui';
import { applicationService } from '../../services/applicationService';
import { Job, CreateApplicationData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  X,
  Send,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface JobApplicationFormProps {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

export const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  job,
  onClose,
  onSuccess
}) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    notes: '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update phone number when user changes
  useEffect(() => {
    if (user?.phone) {
      setFormData(prev => ({
        ...prev,
        phone: user.phone || ''
      }));
    }
  }, [user?.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to apply for jobs');
      return;
    }

    // Validate phone number is provided
    const phoneNumber = formData.phone.trim();
    if (!phoneNumber) {
      setError('Phone number is required for employers to contact you. Please provide your contact number.');
      return;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update user profile with phone number if it's different
      if (phoneNumber !== user.phone) {
        await updateProfile({ phone: phoneNumber });
      }

      const applicationData: CreateApplicationData = {
        jobId: job.id,
        notes: formData.notes.trim() || undefined
      };

      await applicationService.createApplication(applicationData);
      setSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Your application for <strong>{job.title}</strong> has been submitted successfully. 
              You'll receive an email confirmation shortly.
            </p>
            <Button onClick={onClose} variant="primary" className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Apply for {job.title}</h2>
              <p className="text-gray-600 text-sm mt-1">
                {job.companyName} • {job.location || 'Remote'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user?.firstName} {user?.lastName}</span>
                </div>
              </div>
              
              {/* Phone Number - Required */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number (e.g., +1 234 567 8900)"
                    required
                    className={`pl-10 ${!formData.phone.trim() ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Required so employers can contact you about this application
                </p>
              </div>
            </div>

            {/* Job Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Job Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span className="font-medium">{job.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{job.companyName || 'Company Name'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{job.jobType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium capitalize">{job.experienceLevel}</span>
                </div>
                {job.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{job.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Application Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter / Additional Notes
                <span className="text-gray-500 font-normal ml-1">(Optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={6}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Tell the employer why you're interested in this position and what makes you a great fit..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.notes.length}/1000 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
