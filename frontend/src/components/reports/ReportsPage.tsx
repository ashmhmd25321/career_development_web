import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reportService, Report } from '../../services/reportService';
import { Card, CardContent, Button, Badge } from '../ui';
import { 
  FileText, 
  Download, 
  Trash2, 
  Share2, 
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import { ReportShareModal } from './ReportShareModal';

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getStatusBadge = (status: Report['status']) => {
  switch (status) {
    case 'completed':
      return <Badge variant="success">Completed</Badge>;
    case 'generating':
      return <Badge variant="warning">Generating</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

const getReportTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    user_analytics: 'User Analytics',
    job_analytics: 'Job Analytics',
    application_analytics: 'Application Analytics',
    engagement_analytics: 'Engagement Analytics',
    custom: 'Custom Report'
  };
  return labels[type] || type;
};

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalData, setShareModalData] = useState<{ reportId: number } | null>(null);

  useEffect(() => {
    loadReports();
    
    // Poll for generating reports
    const interval = setInterval(() => {
      const hasGenerating = reports.some(r => r.status === 'generating' || r.status === 'pending');
      if (hasGenerating) {
        loadReports();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getUserReports();
      setReports(data);
    } catch (err: any) {
      console.error('Error loading reports:', err);
      setError(err.response?.data?.error?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: number) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await reportService.deleteReport(reportId);
      await loadReports();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete report');
    }
  };

  const handleDownload = async (report: Report) => {
    try {
      if (report.status !== 'completed') {
        alert('Report is not ready yet. Please wait for generation to complete.');
        return;
      }

      const blob = await reportService.downloadReport(report.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.report_name}.${report.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to download report');
    }
  };

  const handleShare = (reportId: number) => {
    setShareModalData({ reportId });
  };

  if (loading && reports.length === 0) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">View and manage your analytics reports</p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="p-4">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
            <p className="text-gray-600">No reports available at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-primary-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{report.report_name}</h3>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {report.description || `Type: ${getReportTypeLabel(report.report_type)} • Format: ${report.format.toUpperCase()}`}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      {report.file_size && (
                        <span>{formatFileSize(report.file_size)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.status === 'completed' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(report)}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(report.id)}
                          className="flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(report.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {shareModalData && (
        <ReportShareModal
          reportId={shareModalData.reportId}
          onClose={() => setShareModalData(null)}
          onSuccess={() => {
            setShareModalData(null);
            loadReports();
          }}
        />
      )}
    </div>
  );
};

