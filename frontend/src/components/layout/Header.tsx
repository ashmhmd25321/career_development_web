import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Check
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logout();
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
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                CareerFlow Pro
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <Link to="/jobs">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                  Jobs
                </Button>
              </Link>
              {isAuthenticated && (
                <Link to="/events">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                    Events
                  </Button>
                </Link>
              )}
              {isAuthenticated && (user?.role === 'employer' || user?.role === 'admin') && (
                <Link to="/events/analytics">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                    Event Analytics
                  </Button>
                </Link>
              )}
              {isAuthenticated && user?.role === 'student' && (
                <Link to="/skills">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                    Skills
                  </Button>
                </Link>
              )}
              {isAuthenticated && user?.role === 'student' && (
                <Link to="/career-planning">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                    Career Planning
                  </Button>
                </Link>
              )}
              {isAuthenticated && user?.role === 'student' && (
                <Link to="/learning">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                    Learning
                  </Button>
                </Link>
              )}
              {isAuthenticated && user?.role === 'student' && (
                <Link to="/applications">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                    My Applications
                  </Button>
                </Link>
              )}
              {isAuthenticated && user?.role === 'student' && (
                <Link to="/saved-jobs">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                    Saved Jobs
                  </Button>
                </Link>
              )}
              {isAuthenticated && (user?.role === 'employer' || user?.role === 'admin') && (
                <Link to="/applications/employer">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                    Job Applications
                  </Button>
                </Link>
              )}
              {isAuthenticated && (user?.role === 'employer' || user?.role === 'admin') && (
                <Link to="/analytics">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                    Analytics
                  </Button>
                </Link>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <Link to="/admin/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Notification Button */}
                  <div className="relative notification-dropdown">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative"
                      onClick={handleToggleNotifications}
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>

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
                          <div className="flex flex-col gap-1">
                            <Link
                              to="/settings/notifications"
                              className="text-xs text-gray-600 hover:text-primary-600"
                              onClick={() => setShowNotifications(false)}
                            >
                              Notification Settings →
                            </Link>
                            <Link
                              to="/settings/notifications/analytics"
                              className="text-xs text-gray-600 hover:text-primary-600"
                              onClick={() => setShowNotifications(false)}
                            >
                              Notification Analytics →
                            </Link>
                            {user?.role === 'admin' && (
                              <Link
                                to="/admin/notifications/templates"
                                className="text-xs text-gray-600 hover:text-primary-600"
                                onClick={() => setShowNotifications(false)}
                              >
                                Notification Templates →
                              </Link>
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

                  {/* User Menu */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
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
            </nav>
            
            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center space-x-2">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
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
                    Start
                  </Button>
                </>
              )}
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden"
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
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-2">
                <Link to="/jobs">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                    Jobs
                  </Button>
                </Link>
                {isAuthenticated && (
                  <Link to="/events">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      Events
                    </Button>
                  </Link>
                )}
                {isAuthenticated && (user?.role === 'employer' || user?.role === 'admin') && (
                  <Link to="/events/analytics">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      Event Analytics
                    </Button>
                  </Link>
                )}
                {isAuthenticated && user?.role === 'student' && (
                  <Link to="/skills">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      Skills
                    </Button>
                  </Link>
                )}
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
                {isAuthenticated && (user?.role === 'employer' || user?.role === 'admin') && (
                  <Link to="/applications/employer">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      Job Applications
                    </Button>
                  </Link>
                )}
                {isAuthenticated && (user?.role === 'employer' || user?.role === 'admin') && (
                  <Link to="/analytics">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start w-full">
                      Analytics
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
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLogout}
                      className="border-red-200 text-red-600 hover:bg-red-50 w-full justify-center"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
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
