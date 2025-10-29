import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui';
import { Copy, Check } from 'lucide-react';

interface ReportShareModalProps {
  reportId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportShareModal: React.FC<ReportShareModalProps> = ({
  reportId,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [accessLevel, setAccessLevel] = useState<'view' | 'download'>('view');
  const [expiresInDays, setExpiresInDays] = useState<number>(7);

  const handleShare = async () => {
    setLoading(true);
    setError(null);

    try {
      const expiresAt = expiresInDays > 0
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const result = await reportService.shareReport(
        reportId,
        null, // Public share
        accessLevel,
        expiresAt
      );

      setShareUrl(result.shareUrl);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to share report');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={true}
      title="Share Report"
      onClose={onClose}
      size="md"
    >
      <div className="space-y-6">
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {!shareUrl ? (
          <>
            <div>
              <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Access Level
              </label>
              <select
                id="accessLevel"
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as 'view' | 'download')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="view">View Only</option>
                <option value="download">View & Download</option>
              </select>
            </div>

            <div>
              <label htmlFor="expiresInDays" className="block text-sm font-medium text-gray-700 mb-2">
                Expires In (days, 0 for no expiration)
              </label>
              <input
                id="expiresInDays"
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={loading}
              >
                {loading ? 'Creating Share...' : 'Create Share Link'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Share this link with others. They can {accessLevel === 'download' ? 'view and download' : 'view'} the report.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose}>Done</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

