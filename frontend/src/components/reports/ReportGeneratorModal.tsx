import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reportService, CreateReportData, ReportConfig } from '../../services/reportService';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui';

interface ReportGeneratorModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateReportData>({
    reportType: 'job_analytics',
    reportName: '',
    description: '',
    reportConfig: {
      timeRange: '30d'
    },
    format: 'csv'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reportName.trim()) {
      setError('Report name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await reportService.createReport(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateReportData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (field: keyof ReportConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      reportConfig: {
        ...prev.reportConfig,
        [field]: value
      }
    }));
  };

  return (
    <Modal
      isOpen={true}
      title="Generate Report"
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        <div>
          <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
            Report Type *
          </label>
          <select
            id="reportType"
            value={formData.reportType}
            onChange={(e) => handleChange('reportType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="user_analytics">User Analytics</option>
            <option value="job_analytics">Job Analytics</option>
            <option value="application_analytics">Application Analytics</option>
            <option value="engagement_analytics">Engagement Analytics</option>
            <option value="custom">Custom Report</option>
          </select>
        </div>

        <div>
          <label htmlFor="reportName" className="block text-sm font-medium text-gray-700 mb-2">
            Report Name *
          </label>
          <Input
            id="reportName"
            value={formData.reportName}
            onChange={(e) => handleChange('reportName', e.target.value)}
            placeholder="e.g., Monthly Job Analytics Report"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Optional description for this report"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-2">
            Time Range
          </label>
          <select
            id="timeRange"
            value={formData.reportConfig.timeRange || '30d'}
            onChange={(e) => handleConfigChange('timeRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>

        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
            Format *
          </label>
          <select
            id="format"
            value={formData.format}
            onChange={(e) => handleChange('format', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="pdf">PDF</option>
            <option value="excel">Excel (Coming Soon)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

