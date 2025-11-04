import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { careerPlanningService, CareerGoal, CareerMilestone, CreateGoalData, CreateMilestoneData, CareerStats } from '../../services/careerPlanningService';
import { Button, Card, CardHeader, CardContent, Input, Badge } from '../ui';
import { Plus, Target, CheckCircle, Clock, AlertCircle, Calendar, TrendingUp, Award, Trash2, Edit } from 'lucide-react';

const CareerPlanningPage: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<CareerGoal | null>(null);
  const [milestones, setMilestones] = useState<CareerMilestone[]>([]);
  const [stats, setStats] = useState<CareerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [goalFormData, setGoalFormData] = useState<CreateGoalData>({
    title: '',
    description: '',
    targetDate: '',
    priority: 'Medium',
    currentStatus: 'Not Started',
  });
  const [milestoneFormData, setMilestoneFormData] = useState<CreateMilestoneData>({
    goalId: 0,
    title: '',
    description: '',
    targetDate: '',
  });

  useEffect(() => {
    if (user?.role === 'student') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsData, statsData] = await Promise.all([
        careerPlanningService.getUserGoals(),
        careerPlanningService.getCareerStats(),
      ]);
      
      setGoals(goalsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading career planning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async (goalId: number) => {
    try {
      const milestonesData = await careerPlanningService.getGoalMilestones(goalId);
      setMilestones(milestonesData);
      
      // Calculate and update progress based on milestones
      await calculateAndUpdateProgress(goalId, milestonesData);
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
  };

  // Calculate progress based on milestones and update goal
  const calculateAndUpdateProgress = async (goalId: number, milestones: CareerMilestone[]) => {
    try {
      let progressPercentage = 0;
      
      if (milestones.length === 0) {
        // No milestones = 0% progress
        progressPercentage = 0;
      } else {
        // Calculate: (achieved milestones / total milestones) * 100
        const achievedCount = milestones.filter(m => m.achieved).length;
        progressPercentage = Math.round((achievedCount / milestones.length) * 100);
      }
      
      // Update the goal's progress in the database
      await careerPlanningService.updateGoalProgress(goalId, progressPercentage);
      
      // Update status based on progress
      let newStatus: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled' = 'Not Started';
      if (progressPercentage === 100) {
        newStatus = 'Completed';
      } else if (progressPercentage > 0) {
        newStatus = 'In Progress';
      }
      
      // Update goal status if needed
      const currentGoal = goals.find(g => g.id === goalId);
      if (currentGoal && currentGoal.currentStatus !== newStatus && currentGoal.currentStatus !== 'On Hold' && currentGoal.currentStatus !== 'Cancelled') {
        await careerPlanningService.updateGoal(goalId, { currentStatus: newStatus });
      }
      
      // Update local goals state with new progress
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId 
            ? { ...goal, progressPercentage, currentStatus: newStatus }
            : goal
        )
      );
      
      // Reload stats to reflect updated progress
      try {
        const statsData = await careerPlanningService.getCareerStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error reloading stats:', error);
      }
    } catch (error) {
      console.error('Error calculating progress:', error);
    }
  };

  const handleCreateGoal = async () => {
    try {
      await careerPlanningService.createGoal(goalFormData);
      await loadData();
      setShowGoalModal(false);
      setGoalFormData({ title: '', description: '', targetDate: '', priority: 'Medium', currentStatus: 'Not Started' });
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleUpdateGoal = async (goalId: number, data: Partial<CreateGoalData>) => {
    try {
      await careerPlanningService.updateGoal(goalId, data);
      await loadData();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      await careerPlanningService.deleteGoal(goalId);
      await loadData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleCreateMilestone = async () => {
    try {
      await careerPlanningService.createMilestone(milestoneFormData);
      if (selectedGoal) {
        // Reload milestones which will trigger progress recalculation
        await loadMilestones(selectedGoal.id);
      }
      setShowMilestoneModal(false);
      setMilestoneFormData({ goalId: selectedGoal?.id || 0, title: '', description: '', targetDate: '' });
    } catch (error) {
      console.error('Error creating milestone:', error);
    }
  };

  const handleToggleMilestone = async (milestoneId: number, achieved: boolean) => {
    try {
      await careerPlanningService.updateMilestone(milestoneId, { achieved: !achieved });
      if (selectedGoal) {
        // Reload milestones which will trigger progress recalculation
        await loadMilestones(selectedGoal.id);
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const handleDeleteMilestone = async (milestoneId: number) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;

    try {
      await careerPlanningService.deleteMilestone(milestoneId);
      if (selectedGoal) {
        // Reload milestones which will trigger progress recalculation
        await loadMilestones(selectedGoal.id);
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  const statusColors = {
    'Not Started': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'On Hold': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800',
  };

  const priorityColors = {
    'Low': 'bg-gray-100 text-gray-800',
    'Medium': 'bg-blue-100 text-blue-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800',
  };

  if (user?.role !== 'student') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <CardContent className="text-center">
            <p className="text-gray-600">Career Planning is only available for students.</p>
          </CardContent>
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
            <Target className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
          Career Planning
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Set goals, track milestones, and achieve your career aspirations
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Goals</p>
                <p className="text-3xl font-bold text-primary-600">{stats.totalGoals}</p>
              </div>
              <Target className="w-12 h-12 text-primary-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgressGoals}</p>
              </div>
              <Clock className="w-12 h-12 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedGoals}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Progress</p>
                <p className="text-3xl font-bold text-accent-600">{stats.averageProgress}%</p>
              </div>
              <TrendingUp className="w-12 h-12 text-accent-500" />
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Goals Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Goals</h2>
              <Button
                variant="primary"
                onClick={() => {
                  setGoalFormData({ title: '', description: '', targetDate: '', priority: 'Medium', currentStatus: 'Not Started' });
                  setShowGoalModal(true);
                }}
                className="flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Goal</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading goals...</p>
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You haven't created any goals yet.</p>
                <Button variant="primary" onClick={() => setShowGoalModal(true)}>
                  Create Your First Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map(goal => (
                  <div
                    key={goal.id}
                    onClick={() => {
                      setSelectedGoal(goal);
                      loadMilestones(goal.id);
                    }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-shadow ${
                        selectedGoal?.id === goal.id ? 'ring-2 ring-primary-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGoal(goal.id);
                            }}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    {goal.description && (
                      <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className={statusColors[goal.currentStatus]}>
                        {goal.currentStatus}
                      </Badge>
                      <Badge variant="secondary" className={priorityColors[goal.priority]}>
                        {goal.priority}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-primary-600">
                          {Math.min(100, Math.max(0, Math.round(Number(goal.progressPercentage) || 0)))}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${Math.min(100, Math.max(0, Number(goal.progressPercentage) || 0))}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedGoal?.id === goal.id && milestones.length > 0 
                          ? `${milestones.filter(m => m.achieved).length} of ${milestones.length} milestones completed`
                          : 'Complete milestones to track progress'}
                      </p>
                    </div>

                    {goal.targetDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Milestones Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Milestones
                {selectedGoal && ` - ${selectedGoal.title}`}
              </h2>
              {selectedGoal && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setMilestoneFormData({ goalId: selectedGoal.id, title: '', description: '', targetDate: '' });
                    setShowMilestoneModal(true);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Milestone</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedGoal ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Select a goal to view its milestones</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading milestones...</p>
              </div>
            ) : milestones.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No milestones for this goal yet.</p>
                <Button variant="primary" onClick={() => setShowMilestoneModal(true)}>
                  Add First Milestone
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map(milestone => (
                  <div
                    key={milestone.id}
                    className={`p-4 border rounded-lg ${
                      milestone.achieved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={milestone.achieved}
                          onChange={() => handleToggleMilestone(milestone.id, milestone.achieved)}
                          className="w-5 h-5 text-primary-600"
                        />
                        <h4 className={`font-semibold ${milestone.achieved ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {milestone.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {milestone.description && (
                      <p className={`text-sm mb-2 ${milestone.achieved ? 'text-gray-500' : 'text-gray-600'}`}>
                        {milestone.description}
                      </p>
                    )}

                    {milestone.targetDate && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(milestone.targetDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Add Goal</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowGoalModal(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={goalFormData.title}
                  onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={goalFormData.description}
                  onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date
                </label>
                <Input
                  type="date"
                  value={goalFormData.targetDate}
                  onChange={(e) => setGoalFormData({ ...goalFormData, targetDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={goalFormData.priority}
                  onChange={(e) => setGoalFormData({ ...goalFormData, priority: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="primary"
                  onClick={handleCreateGoal}
                  className="flex-1"
                  disabled={!goalFormData.title}
                >
                  Create Goal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Add Milestone</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowMilestoneModal(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={milestoneFormData.title}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={milestoneFormData.description}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date
                </label>
                <Input
                  type="date"
                  value={milestoneFormData.targetDate}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, targetDate: e.target.value })}
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="primary"
                  onClick={handleCreateMilestone}
                  className="flex-1"
                  disabled={!milestoneFormData.title}
                >
                  Add Milestone
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowMilestoneModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CareerPlanningPage;

