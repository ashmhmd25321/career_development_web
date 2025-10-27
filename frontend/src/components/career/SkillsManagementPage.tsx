import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { skillService, Skill, SkillWithUserData, CreateUserSkillData } from '../../services/skillService';
import { Button, Card, CardHeader, CardContent, Input, Badge } from '../ui';
import { Search, Plus, Edit, Trash2, CheckCircle, Filter, TrendingUp, Award } from 'lucide-react';

const SkillsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<SkillWithUserData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<Partial<CreateUserSkillData>>({
    proficiencyLevel: 'Beginner',
    experienceYears: 0,
    certified: false,
    notes: '',
  });

  useEffect(() => {
    if (user?.role === 'student') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allSkillsData, userSkillsData, categoriesData] = await Promise.all([
        skillService.getAllSkills(),
        skillService.getUserSkills(),
        skillService.getCategories(),
      ]);
      
      setAllSkills(allSkillsData);
      setUserSkills(userSkillsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading skills data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkill) return;

    try {
      await skillService.addUserSkill({
        skillId: selectedSkill.id,
        proficiencyLevel: formData.proficiencyLevel || 'Beginner',
        experienceYears: formData.experienceYears || 0,
        certified: formData.certified || false,
        certificationDate: formData.certificationDate,
        notes: formData.notes,
      });
      await loadData();
      setShowAddModal(false);
      setSelectedSkill(null);
      setFormData({
        proficiencyLevel: 'Beginner',
        experienceYears: 0,
        certified: false,
        notes: '',
      });
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleUpdateSkill = async (skillId: number, data: Partial<CreateUserSkillData>) => {
    try {
      await skillService.updateUserSkill(skillId, data);
      await loadData();
    } catch (error) {
      console.error('Error updating skill:', error);
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    if (!window.confirm('Are you sure you want to remove this skill?')) return;

    try {
      await skillService.removeUserSkill(skillId);
      await loadData();
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  const handleAssessSkill = async (skillId: number) => {
    try {
      await skillService.assessSkill(skillId);
      await loadData();
    } catch (error) {
      console.error('Error assessing skill:', error);
    }
  };

  const filteredSkills = allSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || skill.category === selectedCategory;
    const hasSkill = userSkills.some(us => us.id === skill.id && us.userSkill);
    return matchesSearch && matchesCategory && !hasSkill;
  });

  const userSkillsList = userSkills.filter(skill => skill.userSkill);

  const proficiencyColors = {
    Beginner: 'bg-green-100 text-green-800',
    Intermediate: 'bg-blue-100 text-blue-800',
    Advanced: 'bg-purple-100 text-purple-800',
    Expert: 'bg-orange-100 text-orange-800',
  };

  if (user?.role !== 'student') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <CardContent className="text-center">
            <p className="text-gray-600">Skills Management is only available for students.</p>
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
            <Award className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
          Skills Management
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Track your skills, assess your proficiency, and showcase your capabilities
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Skills</p>
              <p className="text-3xl font-bold text-primary-600">{userSkillsList.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-primary-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Certified Skills</p>
              <p className="text-3xl font-bold text-secondary-600">
                {userSkillsList.filter(s => s.userSkill?.certified).length}
              </p>
            </div>
            <Award className="w-12 h-12 text-secondary-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Self-Assessed</p>
              <p className="text-3xl font-bold text-accent-600">
                {userSkillsList.filter(s => s.userSkill?.selfAssessed).length}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-accent-500" />
          </div>
        </Card>
      </div>

      {/* My Skills Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">My Skills</h2>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Skill</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading skills...</p>
            </div>
          ) : userSkillsList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't added any skills yet.</p>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                Add Your First Skill
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userSkillsList.map(skill => (
                <Card key={skill.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                      {skill.description && (
                        <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className={proficiencyColors[skill.userSkill?.proficiencyLevel || 'Beginner']}>
                      {skill.userSkill?.proficiencyLevel}
                    </Badge>
                    {skill.category && (
                      <Badge variant="outline">{skill.category}</Badge>
                    )}
                    {skill.userSkill?.certified && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Award className="w-3 h-3 mr-1" />
                        Certified
                      </Badge>
                    )}
                    {skill.userSkill?.selfAssessed && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Self-Assessed
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    <p>Experience: {skill.userSkill?.experienceYears || 0} year(s)</p>
                    {skill.userSkill?.certificationDate && (
                      <p>Certified: {new Date(skill.userSkill.certificationDate).toLocaleDateString()}</p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAssessSkill(skill.id)}
                      disabled={skill.userSkill?.selfAssessed}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {skill.userSkill?.selfAssessed ? 'Assessed' : 'Mark as Assessed'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Skill Section */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Discover Skills</h2>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading skills...</p>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No skills found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map(skill => (
                <div
                  key={skill.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedSkill(skill);
                    setShowAddModal(true);
                  }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                      <Plus className="w-5 h-5 text-primary-600" />
                    </div>
                    {skill.description && (
                      <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {skill.category && (
                        <Badge variant="outline">{skill.category}</Badge>
                      )}
                      <Badge variant="secondary" className={proficiencyColors[skill.difficultyLevel]}>
                        {skill.difficultyLevel}
                      </Badge>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Skill Modal */}
      {showAddModal && selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Add Skill</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-2">{selectedSkill.name}</p>
                {selectedSkill.description && (
                  <p className="text-sm text-gray-600">{selectedSkill.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proficiency Level
                </label>
                <select
                  value={formData.proficiencyLevel}
                  onChange={(e) => setFormData({ ...formData, proficiencyLevel: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (years)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.experienceYears || 0}
                  onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="certified"
                  checked={formData.certified}
                  onChange={(e) => setFormData({ ...formData, certified: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="certified" className="text-sm font-medium text-gray-700">
                  I am certified in this skill
                </label>
              </div>

              {formData.certified && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certification Date
                  </label>
                  <Input
                    type="date"
                    value={formData.certificationDate || ''}
                    onChange={(e) => setFormData({ ...formData, certificationDate: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="primary"
                  onClick={handleAddSkill}
                  className="flex-1"
                >
                  Add Skill
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedSkill(null);
                  }}
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

export default SkillsManagementPage;

