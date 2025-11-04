import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth';
import { notificationService } from '../../services/notificationService';
import { 
  Sparkles, 
  User, 
  LogOut,
  Menu,
  X,
  Bell,
  Check,
  Briefcase,
  Calendar,
  BarChart3,
  Target,
  BookOpen,
  FileText,
  Bookmark,
  LayoutDashboard,
  Activity,
  TrendingUp
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Check if a route is active
  const isActive = (path: string) => {
    // Exact match
    if (location.pathname === path) return true;
    
    // Special cases: don't match parent paths when on specific child routes
    // Don't match /events when on /events/analytics
    if (path === '/events' && location.pathname.startsWith('/events/analytics')) {
      return false;
    }
    // Don't match /applications when on /applications/employer
    if (path === '/applications' && location.pathname.startsWith('/applications/employer')) {
      return false;
    }
    
    // Check if pathname starts with path + '/' (for nested routes)
    if (location.pathname.startsWith(path + '/')) {
      return true;
    }
    
    return false;
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Load notifications
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications && !(event.target as Element).closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const loadNotifications = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      
      if (showNotifications) {
        const notifs = await notificationService.getNotifications();
        setNotifications(notifs);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleToggleNotifications = async () => {
    if (!showNotifications) {
      try {
        const notifs = await notificationService.getNotifications();
        setNotifications(notifs);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
    setShowNotifications(!showNotifications);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Reload both unread count and notifications
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      const notifs = await notificationService.getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user) return '';
    const first = user.firstName?.[0]?.toUpperCase() || '';
    const last = user.lastName?.[0]?.toUpperCase() || '';
    return `${first}${last}` || 'U';
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section - Left */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center space-x-1 sm:space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent hidden sm:inline">
                  CareerFlow Pro
                </span>
                <span className="text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent sm:hidden">
                  CareerFlow
                </span>
              </Link>
            </div>
            
            {/* Navigation Links - Center (Desktop Only) */}
            <nav className="hidden lg:flex items-center space-x-1 mx-8 flex-1 justify-center">
              <Link 
                to="/jobs" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive('/jobs') 
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                }`}
              >
                <Briefcase className={`w-4 h-4 ${isActive('/jobs') ? '' : 'text-gray-600'}`} />
                <span className="text-sm font-medium">Jobs</span>
              </Link>
              
              {isAuthenticated && user?.role !== 'admin' && (
                <Link 
                  to="/events" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/events') 
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                  }`}
                >
                  <Calendar className={`w-4 h-4 ${isActive('/events') ? '' : 'text-gray-600'}`} />
                  <span className="text-sm font-medium">Events</span>
                </Link>
              )}
              
              {isAuthenticated && user?.role === 'employer' && (
                <Link 
                  to="/events/analytics" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/events/analytics') 
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${isActive('/events/analytics') ? '' : 'text-gray-600'}`} />
                  <span className="text-sm font-medium">Analytics</span>
                </Link>
              )}
              
              {isAuthenticated && user?.role === 'student' && (
                <>
                  {/* Skills navigation temporarily hidden */}
                  
                  <Link 
                    to="/career-planning" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/career-planning') 
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <TrendingUp className={`w-4 h-4 ${isActive('/career-planning') ? '' : 'text-gray-600'}`} />
                    <span className="text-sm font-medium">Career</span>
                  </Link>
                  
                  <Link 
                    to="/learning" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/learning') 
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <BookOpen className={`w-4 h-4 ${isActive('/learning') ? '' : 'text-gray-600'}`} />
                    <span className="text-sm font-medium">Learning</span>
                  </Link>
                  
                  <Link 
                    to="/applications" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/applications') 
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <FileText className={`w-4 h-4 ${isActive('/applications') ? '' : 'text-gray-600'}`} />
                    <span className="text-sm font-medium">Applications</span>
                  </Link>
                  
                  <Link 
                    to="/saved-jobs" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/saved-jobs') 
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isActive('/saved-jobs') ? '' : 'text-gray-600'}`} />
                    <span className="text-sm font-medium">Saved</span>
                  </Link>
                </>
              )}
              
              {isAuthenticated && user?.role === 'employer' && (
                <Link 
                  to="/applications/employer" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/applications/employer') 
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${isActive('/applications/employer') ? '' : 'text-gray-600'}`} />
                  <span className="text-sm font-medium">Applications</span>
                </Link>
              )}
              
              {isAuthenticated && user?.role === 'admin' && (
                <Link 
                  to="/admin/users" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/admin/users') 
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                  }`}
                >
                  <User className={`w-4 h-4 ${isActive('/admin/users') ? '' : 'text-gray-600'}`} />
                  <span className="text-sm font-medium">User Management</span>
                </Link>
              )}
              
              {isAuthenticated && user?.role === 'admin' && (
                <Link 
                  to="/admin/dashboard" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/admin/dashboard') 
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${isActive('/admin/dashboard') ? '' : 'text-gray-600'}`} />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
              )}
            </nav>
            
            {/* Right Section - User Actions (Desktop Only) */}
            <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <div className="relative notification-dropdown">
                    <button
                      onClick={handleToggleNotifications}
                      className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-all"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto notification-dropdown">
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {notifications.length > 0 && (
                              <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-primary-600 hover:text-primary-800"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                        </div>
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification: any) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
                                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(notification.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {!notification.is_read && (
                                    <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* User Profile */}
                  <Link 
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary-100"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {getInitials()}
                        </span>
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </Link>

                  {/* Logout Button - PROMINENT RED BUTTON */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-all font-semibold text-sm shadow-md hover:shadow-lg min-w-[100px]"
                    type="button"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-primary-200 text-primary-600 hover:bg-primary-50"
                    onClick={() => openAuthModal('login')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="shadow-lg hover:shadow-xl"
                    onClick={() => openAuthModal('register')}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
            
            {/* Mobile Navigation - Simplified */}
            <div className="flex lg:hidden items-center space-x-1.5 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  {/* Notifications - Mobile */}
                  <div className="relative notification-dropdown">
                    <button
                      onClick={handleToggleNotifications}
                      className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-all"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold text-[10px]">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Notification Dropdown - Mobile */}
                    {showNotifications && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setShowNotifications(false)}>
                        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-semibold text-gray-900">Notifications</h3>
                              <button
                                onClick={() => setShowNotifications(false)}
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                            {notifications.length > 0 && (
                              <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-primary-600 hover:text-primary-800"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p>No notifications</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {notifications.map((notification: any) => (
                                <div
                                  key={notification.id}
                                  className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
                                  onClick={() => {
                                    if (!notification.is_read) handleMarkAsRead(notification.id);
                                    setShowNotifications(false);
                                  }}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {notification.title}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notification.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                    {!notification.is_read && (
                                      <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Picture - Mobile */}
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-9 h-9 rounded-full object-cover border-2 border-primary-100 cursor-pointer"
                      onClick={() => navigate('/profile')}
                      title="Profile"
                    />
                  ) : (
                    <div 
                      className="w-9 h-9 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center cursor-pointer"
                      onClick={() => navigate('/profile')}
                      title="Profile"
                    >
                      <span className="text-white text-xs font-semibold">
                        {getInitials()}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-primary-200 text-primary-600 hover:bg-primary-50 text-xs px-2 sm:px-3"
                    onClick={() => openAuthModal('login')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="shadow-lg hover:shadow-xl text-xs px-2 sm:px-3"
                    onClick={() => openAuthModal('register')}
                  >
                    Start
                  </Button>
                </>
              )}
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-gray-200 bg-white">
              <div className="px-3 py-4 space-y-1">
                <Link to="/jobs">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                    Jobs
                  </Button>
                </Link>
                {isAuthenticated && user?.role !== 'admin' && (
                  <Link to="/events">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      Events
                    </Button>
                  </Link>
                )}
                {isAuthenticated && user?.role === 'employer' && (
                  <Link to="/events/analytics">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      Event Analytics
                    </Button>
                  </Link>
                )}
                {/* Skills navigation temporarily hidden */}
                {isAuthenticated && user?.role === 'student' && (
                  <Link to="/career-planning">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      Career Planning
                    </Button>
                  </Link>
                )}
                {isAuthenticated && user?.role === 'student' && (
                  <Link to="/learning">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      Learning
                    </Button>
                  </Link>
                )}
                {isAuthenticated && user?.role === 'student' && (
                  <Link to="/applications">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      My Applications
                    </Button>
                  </Link>
                )}
                {isAuthenticated && user?.role === 'student' && (
                  <Link to="/saved-jobs">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      Saved Jobs
                    </Button>
                  </Link>
                )}
                {isAuthenticated && user?.role === 'employer' && (
                  <Link to="/applications/employer">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      Job Applications
                    </Button>
                  </Link>
                )}
                {isAuthenticated && user?.role === 'admin' && (
                  <Link to="/admin/users">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      <User className="w-4 h-4 mr-2" /> User Management
                    </Button>
                  </Link>
                )}
                {isAuthenticated && user?.role === 'admin' && (
                  <Link to="/admin/dashboard">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                {isAuthenticated && (
                  <>
                    <Link to="/profile" onClick={() => setShowMobileMenu(false)}>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                        <User className="w-4 h-4 mr-2" /> My Profile
                      </Button>
                    </Link>
                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <div className="flex items-center space-x-3 px-2 py-2 mb-2">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary-100"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {getInitials()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          handleLogout();
                          setShowMobileMenu(false);
                        }}
                        className="border-red-200 text-red-600 hover:bg-red-50 w-full justify-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};
