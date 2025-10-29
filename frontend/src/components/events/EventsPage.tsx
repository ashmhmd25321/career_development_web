import React, { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardContent, Badge, Modal, Input } from '../ui';
import { eventService, Event } from '../../services/eventService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'workshop' as 'workshop' | 'seminar' | 'networking' | 'career_fair' | 'webinar',
    start_date: '',
    end_date: '',
    location: '',
    location_type: 'online' as 'online' | 'in-person' | 'hybrid',
    max_attendees: '',
    registration_deadline: '',
    is_free: true,
    price: '0'
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: number) => {
    try {
      await eventService.registerForEvent(eventId);
      await loadEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to register for event');
    }
  };

  const handleCancelRegistration = async (eventId: number) => {
    try {
      await eventService.cancelRegistration(eventId);
      await loadEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel registration');
    }
  };

  const handleCreateEvent = async () => {
    try {
      await eventService.createEvent({
        title: formData.title,
        description: formData.description || undefined,
        event_type: formData.event_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: formData.location || undefined,
        location_type: formData.location_type,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
        registration_deadline: formData.registration_deadline || undefined,
        is_free: formData.is_free,
        price: parseFloat(formData.price) || 0
      });
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        event_type: 'workshop',
        start_date: '',
        end_date: '',
        location: '',
        location_type: 'online',
        max_attendees: '',
        registration_deadline: '',
        is_free: true,
        price: '0'
      });
      await loadEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to create event');
    }
  };

  const filteredEvents = events.filter(event => {
    if (searchQuery === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query) ||
      event.event_type.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      workshop: 'bg-blue-100 text-blue-800',
      seminar: 'bg-purple-100 text-purple-800',
      networking: 'bg-green-100 text-green-800',
      career_fair: 'bg-orange-100 text-orange-800',
      webinar: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-1">Discover and participate in career development events</p>
        </div>
        {(user?.role === 'employer' || user?.role === 'admin') && (
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events by title, description, location, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      {error ? (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-800">{error}</p>
            <Button variant="primary" onClick={loadEvents} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No events found' : 'No Events Available'}
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? "Try adjusting your search terms."
              : "Check back later for upcoming events."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge className={getEventTypeColor(event.event_type)}>
                    {event.event_type.replace('_', ' ')}
                  </Badge>
                  {event.is_registered && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Registered
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.start_date)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant="outline" className="text-xs">
                      {event.location_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {event.attendees_count || 0} / {event.max_attendees || '∞'} attendees
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{event.is_free ? 'Free' : `$${event.price}`}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {event.is_registered ? (
                    <Button
                      variant="outline"
                      onClick={() => handleCancelRegistration(event.id)}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => handleRegister(event.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Register
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <Modal
          title="Create New Event"
          onClose={() => setShowCreateModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <Input
                type="text"
                placeholder="Enter event title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Enter event description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value as any })}
                >
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="networking">Networking</option>
                  <option value="career_fair">Career Fair</option>
                  <option value="webinar">Webinar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Type *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.location_type}
                  onChange={(e) => setFormData({ ...formData, location_type: e.target.value as any })}
                >
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Input
                type="text"
                placeholder="Enter location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Attendees
                </label>
                <Input
                  type="number"
                  placeholder="Optional"
                  value={formData.max_attendees}
                  onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Deadline
                </label>
                <Input
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={(e) => setFormData({ ...formData, is_free: e.target.checked, price: '0' })}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Free Event</label>
              </div>

              {!formData.is_free && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateEvent}
                disabled={!formData.title || !formData.start_date || !formData.end_date}
              >
                Create Event
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

