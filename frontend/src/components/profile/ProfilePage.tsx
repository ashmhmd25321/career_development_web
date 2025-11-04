import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, CardHeader, CardContent, Input } from '../ui';
import { User, Mail, Phone, MapPin, Building2, Save, Camera, X } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(user?.avatarUrl || null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });
  const [saving, setSaving] = useState(false);
  const [employerProfile, setEmployerProfile] = useState<any | null>(null);
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const stored = localStorage.getItem('authTokens');
        if (!stored) return;
        const { accessToken } = JSON.parse(stored);
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api'}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await res.json();
        if (data?.success && data.data?.employerProfile) {
          setEmployerProfile(data.data.employerProfile);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchDetails();
  }, []);
  const [message, setMessage] = useState<string | null>(null);

  // Update profile picture when user changes
  useEffect(() => {
    if (user?.avatarUrl) {
      setProfilePicture(user.avatarUrl);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage('Image size must be less than 2MB');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePicture(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = () => {
    const first = formData.firstName?.charAt(0) || '';
    const last = formData.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        avatarUrl: profilePicture || undefined,
      });
      setMessage('Profile updated successfully');
    } catch (err: any) {
      setMessage(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" /> My Profile
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                  <div className="relative">
                    {profilePicture ? (
                      <div className="relative group">
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePicture}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          title="Remove picture"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-primary-100">
                        {getInitials()}
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                      id="profile-picture-input"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="profile-picture-input"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {profilePicture ? 'Change Picture' : 'Upload Picture'}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG or GIF. Max size 2MB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{formData.email}</span>
                    </div>
                  </div>
                  <Input
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g., +1 555 123 4567"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" loading={saving} className="flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </Button>
                </div>

                {message && (
                  <p className="text-sm mt-2 {message.includes('success') ? 'text-green-600' : 'text-red-600'}">{message}</p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Role-specific panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {user?.role === 'employer' ? <Building2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                {user?.role === 'employer' ? 'Company' : 'About You'}
              </h3>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              {user?.role === 'employer' ? (
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-gray-600">Company Name</span><span className="font-medium">{employerProfile?.company_name || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Company Size</span><span className="font-medium">{employerProfile?.company_size || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Industry</span><span className="font-medium">{employerProfile?.industry || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Location</span><span className="font-medium">{[employerProfile?.city, employerProfile?.country].filter(Boolean).join(', ') || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Verified</span><span className="font-medium">{employerProfile?.is_verified ? 'Yes' : 'No'}</span></div>
                </div>
              ) : (
                <p>Keep your contact info and location up to date so employers can reach you.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


