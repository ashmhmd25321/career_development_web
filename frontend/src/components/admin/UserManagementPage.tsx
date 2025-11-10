import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, Badge, Button, Input, useToast } from '../ui';
import { 
  Users, 
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  User as UserIcon,
  Shield,
  Briefcase,
  GraduationCap,
  Power,
  PowerOff
} from 'lucide-react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'employer' | 'admin';
  phone?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'employer' | 'admin'>('all');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api';
      const authTokens = localStorage.getItem('authTokens');
      const tokens = authTokens ? JSON.parse(authTokens) : null;
      
      const response = await axios.get<{ success: boolean; data: { users: User[] } }>(
        `${API_BASE_URL}/auth/users`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(tokens?.accessToken && { Authorization: `Bearer ${tokens.accessToken}` }),
          },
        }
      );
      
      if (response.data.success) {
        // Ensure isActive and isVerified are booleans (not 0/1 from database)
        const normalizedUsers = response.data.data.users.map((u: any) => ({
          ...u,
          isActive: Boolean(u.isActive),
          isVerified: Boolean(u.isVerified),
        }));
        setUsers(normalizedUsers);
      } else {
        setError('Failed to load users');
      }
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.response?.data?.error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api';
      const authTokens = localStorage.getItem('authTokens');
      const tokens = authTokens ? JSON.parse(authTokens) : null;
      
      const response = await axios.patch<{ success: boolean; data: { user: User }; message?: string }>(
        `${API_BASE_URL}/auth/users/${userId}/status`,
        { isActive: !currentStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(tokens?.accessToken && { Authorization: `Bearer ${tokens.accessToken}` }),
          },
        }
      );
      
      if (response.data.success) {
        // Update the user in the local state, ensuring booleans are normalized
        const updatedUser = {
          ...response.data.data.user,
          isActive: Boolean(response.data.data.user.isActive),
          isVerified: Boolean(response.data.data.user.isVerified),
        };
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? updatedUser : u
          )
        );
        
        // Show success toast
        const action = currentStatus ? 'deactivated' : 'activated';
        showToast(
          response.data.message || `User ${action} successfully`,
          'success',
          4000
        );
      }
    } catch (err: any) {
      console.error('Error updating user status:', err);
      const errorMessage = err.response?.data?.error?.message || 'Failed to update user status';
      showToast(errorMessage, 'error', 5000);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'employer': return <Briefcase className="w-4 h-4" />;
      case 'student': return <GraduationCap className="w-4 h-4" />;
      default: return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'employer': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (user?.role !== 'admin') {
    return (
      <div className="container-custom py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-800">You do not have permission to access this page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-800">{error}</p>
            <Button onClick={loadUsers} variant="primary" className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all platform users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-10 h-10 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'student').length}
                </p>
              </div>
              <GraduationCap className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Employers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'employer').length}
                </p>
              </div>
              <Briefcase className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('all')}
              >
                All
              </Button>
              <Button
                variant={roleFilter === 'student' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('student')}
              >
                <GraduationCap className="w-4 h-4 mr-1" />
                Students
              </Button>
              <Button
                variant={roleFilter === 'employer' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('employer')}
              >
                <Briefcase className="w-4 h-4 mr-1" />
                Employers
              </Button>
              <Button
                variant={roleFilter === 'admin' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('admin')}
              >
                <Shield className="w-4 h-4 mr-1" />
                Admins
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white font-semibold">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {u.firstName} {u.lastName}
                        </h3>
                        <Badge className={getRoleColor(u.role)}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(u.role)}
                            <span className="capitalize">{u.role}</span>
                          </span>
                        </Badge>
                        {u.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            <span>Active</span>
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            <span>Inactive</span>
                          </Badge>
                        )}
                        {u.isVerified ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            <span>Verified</span>
                          </Badge>
                        ) : null}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                        {u.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{u.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {formatDate(u.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={u.isActive ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                      className={u.isActive ? 'text-red-600 hover:text-red-700 hover:border-red-300' : 'text-green-600 hover:text-green-700'}
                    >
                      {u.isActive ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

