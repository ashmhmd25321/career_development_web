import React, { useState } from 'react';
import { Button, Card, CardHeader, CardContent, Input } from '../ui';
import { Application } from '../../types';
import {
  Send,
  Mail,
  MessageSquare,
  Phone,
  Calendar
} from 'lucide-react';

interface ApplicationCommunicationProps {
  application: Application;
}

export const ApplicationCommunication: React.FC<ApplicationCommunicationProps> = ({ application }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);
    
    // TODO: Implement send message API call
    console.log('Sending message:', message);
    
    setTimeout(() => {
      setSending(false);
      setMessage('');
    }, 1000);
  };

  const handleScheduleInterview = () => {
    // TODO: Implement interview scheduling
    console.log('Schedule interview for application:', application.id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Communication</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleScheduleInterview}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Interview
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Contact Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" size="sm" className="justify-start">
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <Phone className="w-4 h-4 mr-2" />
            Call Now
          </Button>
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 pt-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Quick Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
          <div className="flex justify-end mt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendMessage}
              disabled={!message.trim() || sending}
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>

        {/* Communication History */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Messages</h4>
          <div className="space-y-2">
            <div className="text-sm text-gray-500 italic">
              No messages yet. Start a conversation with the applicant.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
