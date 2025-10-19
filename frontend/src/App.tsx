import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Button, Card, CardHeader, CardContent, Input, Modal } from './components/ui';
import { Header } from './components/layout';
import { JobPostingForm, JobListingPage } from './components/jobs';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Star, 
  Sparkles,
  Briefcase
} from 'lucide-react';
import './styles/theme.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header with Authentication */}
            <Header />

            {/* Main Content */}
                <main className="container-custom py-8 md:py-12">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/jobs/list" element={<JobListingPage />} />
                  </Routes>
                </main>

            {/* Enhanced Responsive Footer */}
            <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 md:py-16 mt-16 md:mt-20">
              <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold">CareerFlow Pro</h3>
                    </div>
                    <p className="text-gray-300 mb-6 max-w-md text-sm md:text-base">
                      Empowering careers through intelligent matching, skill development, and professional networking.
                    </p>
                    <div className="flex space-x-4">
                      <button className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                        <span className="sr-only">Facebook</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                        <span className="sr-only">Twitter</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </button>
                      <button className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                        <span className="sr-only">LinkedIn</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Product</h4>
                    <ul className="space-y-2">
                      <li><button className="text-gray-300 hover:text-white transition-colors">Features</button></li>
                      <li><button className="text-gray-300 hover:text-white transition-colors">Pricing</button></li>
                      <li><button className="text-gray-300 hover:text-white transition-colors">API</button></li>
                      <li><button className="text-gray-300 hover:text-white transition-colors">Integrations</button></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Company</h4>
                    <ul className="space-y-2">
                      <li><button className="text-gray-300 hover:text-white transition-colors">About</button></li>
                      <li><button className="text-gray-300 hover:text-white transition-colors">Blog</button></li>
                      <li><button className="text-gray-300 hover:text-white transition-colors">Careers</button></li>
                      <li><button className="text-gray-300 hover:text-white transition-colors">Contact</button></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-700 pt-6 md:pt-8 text-center">
                  <p className="text-gray-400 text-sm md:text-base">&copy; 2024 CareerFlow Pro. All rights reserved.</p>
                </div>
              </div>
            </footer>
    </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Enhanced Home Page Component
const HomePage: React.FC = () => {
  const [, setShowModal] = React.useState(false);

  return (
    <div className="space-y-12 md:space-y-20">
      {/* Stunning Hero Section */}
      <section className="relative text-center pt-12 md:pt-20 pb-16 md:pb-32">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-secondary-400/20 to-accent-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 mb-8">
            <Sparkles className="w-4 h-4 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-700">Trusted by 10,000+ professionals</span>
          </div>

          <h2 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6 leading-tight">
            Build Your Career
            <br />
            <span className="text-5xl md:text-6xl">with Confidence</span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with <span className="font-semibold text-primary-600">opportunities</span>, develop
            <span className="font-semibold text-secondary-600"> skills</span>, and advance your career with our
            <span className="font-semibold text-accent-600"> comprehensive platform</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6 mb-12 md:mb-16 px-4">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold shadow-2xl hover:shadow-3xl">
              Explore Jobs
            </Button>
            <Button variant="outline" size="lg" onClick={() => setShowModal(true)} className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold border-2 hover:bg-primary-50">
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-gray-600 text-sm md:text-base">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary-600 mb-2">50K+</div>
              <div className="text-gray-600 text-sm md:text-base">Job Opportunities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-600 mb-2">95%</div>
              <div className="text-gray-600 text-sm md:text-base">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-12 md:py-20">
        <div className="container-custom">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-accent-50 to-primary-50 border border-accent-200 mb-6">
              <Star className="w-4 h-4 text-accent-600 mr-2" />
              <span className="text-sm font-medium text-accent-700">Why Choose Us</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose CareerFlow Pro?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the features that make us the leading career development platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            <Card className="group hover:scale-105 transition-transform duration-300">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <CardHeader>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                  Smart Job Matching
                </h4>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Our AI-powered algorithm matches you with the perfect opportunities based on your skills, experience, and career aspirations.
                </p>
                <div className="mt-4 md:mt-6 flex items-center text-primary-600 font-semibold text-sm md:text-base hover:text-primary-700 transition-colors cursor-pointer">
                  Learn more →
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:scale-105 transition-transform duration-300">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <CardHeader>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                  Career Development
                </h4>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Track your progress, set achievable goals, and access premium resources to accelerate your career growth and success.
                </p>
                <div className="mt-4 md:mt-6 flex items-center text-secondary-600 font-semibold text-sm md:text-base hover:text-secondary-700 transition-colors cursor-pointer">
                  Learn more →
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:scale-105 transition-transform duration-300 md:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <CardHeader>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                  Professional Network
                </h4>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Connect with industry professionals, mentors, and like-minded individuals to expand your network and opportunities.
                </p>
                <div className="mt-4 md:mt-6 flex items-center text-accent-600 font-semibold text-sm md:text-base hover:text-accent-700 transition-colors cursor-pointer">
                  Learn more →
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-12 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-secondary-600/10 rounded-3xl"></div>
        <div className="relative z-10 text-center px-4">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
            Ready to Transform Your Career?
          </h3>
          <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
            Join thousands of professionals who have already started their journey with CareerFlow Pro
          </p>
          
          <div className="max-w-md mx-auto">
            <Card className="p-6 md:p-8">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                  <Star className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <CardHeader>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                  Get Started Today
                </h4>
                <p className="text-gray-600 text-base md:text-lg">
                  Create your account and start your career journey
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4 md:space-y-6">
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    label="Full Name"
                    required
                    className="text-base md:text-lg"
                  />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    label="Email Address"
                    required
                    className="text-base md:text-lg"
                  />
                  <Input
                    type="password"
                    placeholder="Create a secure password"
                    label="Password"
                    required
                    className="text-base md:text-lg"
                  />
                  <Button variant="primary" className="w-full py-3 md:py-4 text-base md:text-lg font-semibold" type="submit">
                    Create Account
                  </Button>
                  <p className="text-xs md:text-sm text-gray-500 text-center">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Modal Demo */}
      <Modal
        isOpen={false}
        onClose={() => setShowModal(false)}
        title="Welcome to CareerFlow Pro"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Thank you for your interest in CareerFlow Pro! We're building the future of career development.
          </p>
          <p className="text-gray-600">
            Stay tuned for updates and exciting new features coming soon.
          </p>
        </div>
      </Modal>
    </div>
  );
};

// About Page Component
const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8 md:p-12">
        <CardHeader className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About CareerFlow Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empowering the next generation of professionals through intelligent career development.
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We believe that everyone deserves access to the tools, resources, and opportunities they need to build a fulfilling career. 
              CareerFlow Pro bridges the gap between talent and opportunity, creating a seamless experience for both job seekers and employers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Do</h2>
            <p className="text-gray-600 leading-relaxed">
              Our platform combines artificial intelligence, comprehensive career resources, and a vibrant professional community 
              to help individuals discover their potential and achieve their career goals. From skill assessment to job matching, 
              we provide end-to-end career development solutions.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Our Vision
            </h3>
            <p className="text-gray-600">
              A world where everyone has access to the resources they need to build fulfilling careers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

    const JobsPage: React.FC = () => {
      const [showJobForm, setShowJobForm] = React.useState(false);
      const { user } = useAuth();

      return (
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Job Management
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your job postings and discover new opportunities
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowJobForm(true)}
              className="px-8 py-4"
            >
              Post New Job
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/jobs/list'}
              className="px-8 py-4"
            >
              Browse Jobs
            </Button>
          </div>

          {/* Demo Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Recent Jobs</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  View and manage your recent job postings. Edit, update, or remove jobs as needed.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Applications</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track applications received for your job postings and manage the hiring process.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Analytics</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  View detailed analytics about your job postings, views, and application rates.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Job Posting Form Modal */}
          <JobPostingForm
            isOpen={showJobForm}
            onClose={() => setShowJobForm(false)}
            onSuccess={(job) => {
              console.log('Job created successfully:', job);
              setShowJobForm(false);
            }}
          />
        </div>
      );
    };

export default App;