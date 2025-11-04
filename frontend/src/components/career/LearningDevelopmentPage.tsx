import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { learningService, LearningResource, Certification, LearningStats } from '../../services/learningService';
import { Button, Card, Badge, Modal } from '../ui';
import { BookOpen, Award, GraduationCap, ExternalLink, Play, FileText, Video, BookMarked, Calendar, TrendingUp, CheckCircle, X } from 'lucide-react';
import QuizModal from './QuizModal';

const LearningDevelopmentPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'resources' | 'certifications' | 'stats'>('resources');
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [userCertifications, setUserCertifications] = useState<any[]>([]);
  const [resourceProgress, setResourceProgress] = useState<any[]>([]);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [showCertDetails, setShowCertDetails] = useState(false);
  const [showMyCert, setShowMyCert] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (user?.role === 'student') {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'resources') {
        const [resourcesData, statsData] = await Promise.all([
          learningService.getAllResources(),
          learningService.getLearningStats(),
        ]);
        setResources(resourcesData);
        setStats(statsData);
        
        // Load progress for each resource
        const progressPromises = resourcesData.map(async (resource) => {
          try {
            const progress = await learningService.getUserProgress(resource.id);
            return { resource, progress };
          } catch {
            return { resource, progress: null };
          }
        });
        const progressData = await Promise.all(progressPromises);
        setResourceProgress(progressData);
      } else if (activeTab === 'certifications') {
        const [certificationsData, statsData, userCerts] = await Promise.all([
          learningService.getAllCertifications(),
          learningService.getLearningStats(),
          learningService.getUserCertifications().catch(() => []),
        ]);
        setCertifications(certificationsData);
        setStats(statsData);
        setUserCertifications(userCerts);
      } else if (activeTab === 'stats') {
        const [statsData, userCerts, allResources] = await Promise.all([
          learningService.getLearningStats(),
          learningService.getUserCertifications().catch(() => []),
          learningService.getAllResources(),
        ]);
        setStats(statsData);
        setUserCertifications(userCerts);
        
        // Load progress for all resources
        const progressPromises = allResources.map(async (resource) => {
          try {
            const progress = await learningService.getUserProgress(resource.id);
            return { resource, progress };
          } catch {
            return { resource, progress: null };
          }
        });
        const progressData = await Promise.all(progressPromises);
        setResourceProgress(progressData);
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceClick = async (resource: LearningResource) => {
    if (resource.url || resource.externalLink) {
      const url = resource.url || resource.externalLink;
      if (url) {
        window.open(url, '_blank');
        
        // Mark as started or update progress
        try {
          // Get current progress first
          let currentProgress = 0;
          try {
            const existingProgress = await learningService.getUserProgress(resource.id);
            currentProgress = Number(existingProgress.progressPercentage) || 0;
          } catch {
            // No progress exists, will start at 10%
            currentProgress = 0;
          }
          
          // If not started, initialize with 10%, otherwise keep current progress
          const newProgress = currentProgress === 0 ? 10 : Math.min(100, currentProgress + 5);
          
          await learningService.updateProgress(resource.id, {
            status: newProgress === 100 ? 'Completed' : 'In Progress',
            progressPercentage: newProgress,
          });
          await loadData(); // Reload data to update statistics
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }
    }
  };

  const handleCertDetailsClick = (certification: Certification) => {
    setSelectedCertification(certification);
    setShowCertDetails(true);
  };


  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return <Video className="w-5 h-5" />;
      case 'Article':
        return <FileText className="w-5 h-5" />;
      case 'Course':
        return <GraduationCap className="w-5 h-5" />;
      case 'Documentation':
        return <BookOpen className="w-5 h-5" />;
      case 'Book':
        return <BookMarked className="w-5 h-5" />;
      case 'Tutorial':
        return <Play className="w-5 h-5" />;
      case 'Webinar':
        return <Video className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const resourceTypeColors = {
    'Article': 'bg-blue-100 text-blue-800',
    'Video': 'bg-red-100 text-red-800',
    'Course': 'bg-green-100 text-green-800',
    'Tutorial': 'bg-purple-100 text-purple-800',
    'Documentation': 'bg-gray-100 text-gray-800',
    'Webinar': 'bg-orange-100 text-orange-800',
    'Book': 'bg-yellow-100 text-yellow-800',
  };

  const difficultyColors = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-blue-100 text-blue-800',
    'Advanced': 'bg-orange-100 text-orange-800',
    'Expert': 'bg-red-100 text-red-800',
  };

  if (user?.role !== 'student') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="text-center">
            <p className="text-gray-600">Learning & Development is only available for students.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
          Learning & Development
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Access resources, certifications, and learning paths to advance your career
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Resources Started</p>
                <p className="text-3xl font-bold text-primary-600">{stats.totalResourcesStarted}</p>
              </div>
              <BookOpen className="w-12 h-12 text-primary-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalResourcesCompleted}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Certifications</p>
                <p className="text-3xl font-bold text-accent-600">{stats.totalCertifications}</p>
              </div>
              <Award className="w-12 h-12 text-accent-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold text-purple-600">{stats.averageRating}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'resources'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Learning Resources
        </button>
        <button
          onClick={() => setActiveTab('certifications')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'certifications'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Certifications
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'stats'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Progress
        </button>
      </div>

      {/* Content based on active tab */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : activeTab === 'resources' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <div
              key={resource.id}
              onClick={() => handleResourceClick(resource)}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="text-primary-600">{getResourceIcon(resource.resourceType)}</div>
                  <Badge variant="secondary" className={resourceTypeColors[resource.resourceType]}>
                    {resource.resourceType}
                  </Badge>
                </div>
                {resource.free && (
                  <Badge variant="success">Free</Badge>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>

              {resource.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{resource.description}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className={difficultyColors[resource.difficultyLevel]}>
                  {resource.difficultyLevel}
                </Badge>
                {resource.durationMinutes && (
                  <Badge variant="outline">
                    {resource.durationMinutes} min
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600 flex items-center">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open Resource
                </span>
                {resource.url || resource.externalLink ? (
                  <span className="text-primary-600 text-sm font-semibold">Go →</span>
                ) : (
                  <span className="text-gray-400 text-sm">No link</span>
                )}
              </div>
              </Card>
            </div>
          ))}
        </div>
      ) : activeTab === 'certifications' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map(certification => (
            <Card key={certification.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Award className="w-10 h-10 text-accent-600" />
                <Badge variant="secondary" className={difficultyColors[certification.difficultyLevel]}>
                  {certification.difficultyLevel}
                </Badge>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">{certification.title}</h3>

              {certification.description && (
                <p className="text-gray-600 mb-4">{certification.description}</p>
              )}

              <div className="space-y-2 mb-4">
                {certification.issuingOrganization && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Issued by:</span>
                    <span>{certification.issuingOrganization}</span>
                  </div>
                )}
                {certification.validityPeriodMonths && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Valid for {certification.validityPeriodMonths} months</span>
                  </div>
                )}
                {certification.examRequired && (
                  <Badge variant="warning" className="mt-2">Exam Required</Badge>
                )}
              </div>

              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => handleCertDetailsClick(certification)}
              >
                Take Quiz
              </Button>
            </Card>
          ))}
        </div>
      ) : activeTab === 'stats' ? (
        <div className="space-y-6">
          {/* Stats Summary */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stats.totalResourcesStarted}
                </div>
                <div className="text-gray-600">Resources Started</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.totalResourcesCompleted}
                </div>
                <div className="text-gray-600">Resources Completed</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-3xl font-bold text-accent-600 mb-2">
                  {stats.totalCertifications}
                </div>
                <div className="text-gray-600">Certifications Earned</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.averageRating}
                </div>
                <div className="text-gray-600">Average Rating</div>
              </Card>
            </div>
          )}

          {/* Detailed Progress */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">My Learning Progress</h3>
            {resourceProgress.filter(rp => rp.progress && rp.progress.status !== 'Not Started').map(({ resource, progress }) => (
              <Card key={resource.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {resource.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <Badge variant="secondary" className={resourceTypeColors[resource.resourceType as keyof typeof resourceTypeColors]}>
                        {resource.resourceType}
                      </Badge>
                      <Badge variant="secondary" className={difficultyColors[resource.difficultyLevel as keyof typeof difficultyColors]}>
                        {resource.difficultyLevel}
                      </Badge>
                      <Badge variant={progress?.status === 'Completed' ? 'success' : 'warning'}>
                        {progress?.status || 'Not Started'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {progress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-semibold text-primary-600">
                        {Math.round(Number(progress.progressPercentage) || 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${Math.min(100, Math.max(0, Number(progress.progressPercentage) || 0))}%` 
                        }}
                      />
                    </div>
                    {/* Progress Update Buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-500">Update progress:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={async () => {
                            const newProgress = Math.min(100, Math.max(0, Number(progress.progressPercentage || 0) + 25));
                            try {
                              await learningService.updateProgress(resource.id, {
                                status: newProgress === 100 ? 'Completed' : 'In Progress',
                                progressPercentage: newProgress,
                              });
                              await loadData();
                            } catch (error) {
                              console.error('Error updating progress:', error);
                            }
                          }}
                          className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
                        >
                          +25%
                        </button>
                        <button
                          onClick={async () => {
                            const newProgress = Math.min(100, Math.max(0, Number(progress.progressPercentage || 0) + 50));
                            try {
                              await learningService.updateProgress(resource.id, {
                                status: newProgress === 100 ? 'Completed' : 'In Progress',
                                progressPercentage: newProgress,
                              });
                              await loadData();
                            } catch (error) {
                              console.error('Error updating progress:', error);
                            }
                          }}
                          className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200 transition-colors"
                        >
                          +50%
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await learningService.updateProgress(resource.id, {
                                status: 'Completed',
                                progressPercentage: 100,
                              });
                              await loadData();
                            } catch (error) {
                              console.error('Error updating progress:', error);
                            }
                          }}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
            
            {resourceProgress.filter(rp => rp.progress && rp.progress.status !== 'Not Started').length === 0 && (
              <Card className="p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No learning progress yet. Start exploring resources!</p>
              </Card>
            )}
          </div>

          {/* My Certifications */}
          {userCertifications.length > 0 && (
            <div className="space-y-4 mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">My Certifications</h3>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowMyCert(!showMyCert)}
                >
                  {showMyCert ? 'Hide' : 'View All'}
                </Button>
              </div>
              
              {showMyCert && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userCertifications.map((userCert: any) => (
                    <Card key={userCert.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Award className="w-8 h-8 text-accent-600" />
                        <Badge variant="success">Verified</Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {userCert.certification?.title}
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        {userCert.certificationNumber && (
                          <p>Cert #: {userCert.certificationNumber}</p>
                        )}
                        <p>Issued: {new Date(userCert.issuedDate).toLocaleDateString()}</p>
                        {userCert.expiryDate && (
                          <p>Expires: {new Date(userCert.expiryDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Certification Details Modal */}
      {showCertDetails && selectedCertification && (
        <Modal
          isOpen={showCertDetails}
          onClose={() => {
            setShowCertDetails(false);
            setSelectedCertification(null);
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Certification Details</h3>
              <button
                onClick={() => {
                  setShowCertDetails(false);
                  setSelectedCertification(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Award className="w-12 h-12 text-accent-600" />
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedCertification.title}
                  </h4>
                  <Badge variant="secondary" className={difficultyColors[selectedCertification.difficultyLevel]}>
                    {selectedCertification.difficultyLevel}
                  </Badge>
                </div>
              </div>

              {selectedCertification.description && (
                <p className="text-gray-600">{selectedCertification.description}</p>
              )}

              <div className="space-y-4">
                {selectedCertification.issuingOrganization && (
                  <div>
                    <span className="font-medium text-gray-700">Issued by:</span>
                    <span className="ml-2 text-gray-600">{selectedCertification.issuingOrganization}</span>
                  </div>
                )}
                {selectedCertification.validityPeriodMonths && (
                  <div>
                    <span className="font-medium text-gray-700">Valid for:</span>
                    <span className="ml-2 text-gray-600">{selectedCertification.validityPeriodMonths} months</span>
                  </div>
                )}
                {selectedCertification.examRequired && (
                  <Badge variant="warning">Exam Required - 70% Pass Rate</Badge>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-gray-700">
                  <strong>How to earn this certification:</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                  <li>Take the certification quiz</li>
                  <li>Answer at least 70% correctly to pass</li>
                  <li>Upon passing, you'll automatically receive the certification</li>
                </ul>
              </div>

              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={() => {
                    setShowCertDetails(false);
                    setShowQuiz(true);
                  }}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Start Quiz
                </Button>
              </div>
            </div>
          </div>
          </Modal>
      )}

      {/* Quiz Modal */}
      {showQuiz && selectedCertification && (
        <QuizModal
          isOpen={showQuiz}
          onClose={() => {
            setShowQuiz(false);
            setSelectedCertification(null);
          }}
          certificationId={selectedCertification.id}
          certificationTitle={selectedCertification.title}
          onComplete={() => {
            loadData(); // Reload data to show new certification
          }}
        />
      )}
    </div>
  );
};

export default LearningDevelopmentPage;

