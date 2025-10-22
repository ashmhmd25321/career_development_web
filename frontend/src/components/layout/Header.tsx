import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth';
import { 
  Sparkles, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                Features
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                Pricing
              </Button>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
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
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start">
                  Features
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 justify-start">
                  Pricing
                </Button>
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
