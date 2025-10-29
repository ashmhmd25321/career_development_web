import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface Event {
  id: number;
  title: string;
  description?: string;
  event_type: 'workshop' | 'seminar' | 'networking' | 'career_fair' | 'webinar';
  organizer_id: number;
  organizer_name?: string;
  start_date: string;
  end_date: string;
  location?: string;
  location_type: 'online' | 'in-person' | 'hybrid';
  max_attendees?: number;
  registration_deadline?: string;
  is_active: boolean;
  is_free: boolean;
  price: number;
  attendees_count?: number;
  is_registered?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_type: 'workshop' | 'seminar' | 'networking' | 'career_fair' | 'webinar';
  start_date: string;
  end_date: string;
  location?: string;
  location_type: 'online' | 'in-person' | 'hybrid';
  max_attendees?: number;
  registration_deadline?: string;
  is_free: boolean;
  price: number;
}

const getAuthHeaders = () => {
  const tokens = localStorage.getItem('authTokens');
  if (tokens) {
    const { accessToken } = JSON.parse(tokens);
    return { Authorization: `Bearer ${accessToken}` };
  }
  return {};
};

export const eventService = {
  getAllEvents: async (): Promise<Event[]> => {
    const response = await axios.get(`${API_BASE_URL}/events`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getEventById: async (eventId: number): Promise<Event> => {
    const response = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getEventsByOrganizer: async (): Promise<Event[]> => {
    const response = await axios.get(`${API_BASE_URL}/events/organizer/my-events`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  createEvent: async (eventData: CreateEventData): Promise<Event> => {
    const response = await axios.post(`${API_BASE_URL}/events`, eventData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  updateEvent: async (eventId: number, eventData: Partial<CreateEventData>): Promise<Event> => {
    const response = await axios.put(`${API_BASE_URL}/events/${eventId}`, eventData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  deleteEvent: async (eventId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/events/${eventId}`, {
      headers: getAuthHeaders()
    });
  },

  registerForEvent: async (eventId: number): Promise<void> => {
    await axios.post(`${API_BASE_URL}/events/${eventId}/register`, {}, {
      headers: getAuthHeaders()
    });
  },

  getUserRegistrations: async (): Promise<Event[]> => {
    const response = await axios.get(`${API_BASE_URL}/events/user/my-registrations`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  cancelRegistration: async (eventId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/events/${eventId}/register`, {
      headers: getAuthHeaders()
    });
  },

  getEventAttendees: async (eventId: number): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/events/${eventId}/attendees`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};

