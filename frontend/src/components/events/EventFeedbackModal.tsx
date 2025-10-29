import React, { useState } from 'react';
import { Modal, Button } from '../ui';
import { Star, X } from 'lucide-react';

interface EventFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventTitle: string;
  onSubmit: () => void;
}

const EventFeedbackModal: React.FC<EventFeedbackModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'attended' | 'no_show'>('attended');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    if (!feedback.trim()) {
      setError('Please provide feedback');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { eventService } = await import('../../services/eventService');
      await eventService.submitFeedback(eventId, feedback, rating, attendanceStatus);
      onSubmit();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setFeedback('');
    setAttendanceStatus('attended');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Event Feedback</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            How was <span className="font-semibold">{eventTitle}</span>?
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating} out of 5
                </span>
              )}
            </div>
          </div>

          {/* Attendance Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Did you attend this event? *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="attendance"
                  value="attended"
                  checked={attendanceStatus === 'attended'}
                  onChange={(e) => setAttendanceStatus(e.target.value as 'attended')}
                  className="mr-2"
                />
                <span>Attended</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="attendance"
                  value="no_show"
                  checked={attendanceStatus === 'no_show'}
                  onChange={(e) => setAttendanceStatus(e.target.value as 'no_show')}
                  className="mr-2"
                />
                <span>Did Not Attend</span>
              </label>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback *
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={5}
              placeholder="Share your thoughts about this event..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting || rating === 0 || !feedback.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EventFeedbackModal;

