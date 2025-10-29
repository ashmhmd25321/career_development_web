import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationTemplateService, NotificationTemplate } from '../../services/notificationTemplateService';
import { Card, CardContent, Button, Badge, Modal, Input } from '../ui';
import { FileText, Plus, Edit, Trash2, Eye, Send, X } from 'lucide-react';

export const NotificationTemplatesPage: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [preview, setPreview] = useState<{ title: string; message: string } | null>(null);
  const [availableVariables, setAvailableVariables] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    title_template: '',
    message_template: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    category: 'system' as 'job' | 'application' | 'event' | 'system' | 'message',
    description: '',
    variables: [] as string[],
    is_active: true
  });
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [sendVariables, setSendVariables] = useState<Record<string, string>>({});
  const [sendUserId, setSendUserId] = useState<string>('');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadTemplates();
    }
  }, [user]);

  useEffect(() => {
    if (formData.category) {
      loadAvailableVariables(formData.category);
    }
  }, [formData.category]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationTemplateService.getAllTemplates();
      setTemplates(data);
    } catch (err: any) {
      console.error('Error loading templates:', err);
      setError(err.response?.data?.error || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableVariables = async (category: string) => {
    try {
      const result = await notificationTemplateService.getAvailableVariables(category);
      setAvailableVariables(result.variables || []);
    } catch (err) {
      console.error('Error loading available variables:', err);
    }
  };

  const handleCreate = async () => {
    try {
      setError(null);
      await notificationTemplateService.createTemplate(formData);
      await loadTemplates();
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Error creating template:', err);
      setError(err.response?.data?.error || 'Failed to create template');
    }
  };

  const handleUpdate = async () => {
    if (!selectedTemplate) return;
    
    try {
      setError(null);
      await notificationTemplateService.updateTemplate(selectedTemplate.id, formData);
      await loadTemplates();
      setShowEditModal(false);
      setSelectedTemplate(null);
      resetForm();
    } catch (err: any) {
      console.error('Error updating template:', err);
      setError(err.response?.data?.error || 'Failed to update template');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await notificationTemplateService.deleteTemplate(id);
      await loadTemplates();
    } catch (err: any) {
      console.error('Error deleting template:', err);
      alert(err.response?.data?.error || 'Failed to delete template');
    }
  };

  const handlePreview = async (template: NotificationTemplate) => {
    try {
      setSelectedTemplate(template);
      setPreviewVariables({});
      const result = await notificationTemplateService.previewTemplate(template.id, {});
      setPreview(result);
      setShowPreviewModal(true);
    } catch (err: any) {
      console.error('Error previewing template:', err);
      alert(err.response?.data?.error || 'Failed to preview template');
    }
  };

  const handleUpdatePreview = async () => {
    if (!selectedTemplate) return;
    
    try {
      const result = await notificationTemplateService.previewTemplate(selectedTemplate.id, previewVariables);
      setPreview(result);
    } catch (err: any) {
      console.error('Error updating preview:', err);
    }
  };

  const handleEdit = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      title_template: template.title_template,
      message_template: template.message_template,
      type: template.type,
      category: template.category,
      description: template.description || '',
      variables: template.variables ? JSON.parse(template.variables) : [],
      is_active: template.is_active
    });
    setShowEditModal(true);
  };

  const handleSend = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setSendVariables({});
    setSendUserId('');
    setShowSendModal(true);
  };

  const handleSendNotification = async () => {
    if (!selectedTemplate) return;
    
    try {
      setError(null);
      const userId = sendUserId ? parseInt(sendUserId) : undefined;
      await notificationTemplateService.useTemplateToSend(
        selectedTemplate.id,
        userId,
        sendVariables
      );
      alert('Notification sent successfully!');
      setShowSendModal(false);
      setSelectedTemplate(null);
      setSendVariables({});
      setSendUserId('');
    } catch (err: any) {
      console.error('Error sending notification:', err);
      setError(err.response?.data?.error || 'Failed to send notification');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title_template: '',
      message_template: '',
      type: 'info',
      category: 'system',
      description: '',
      variables: [],
      is_active: true
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      job: 'bg-purple-100 text-purple-800',
      application: 'bg-indigo-100 text-indigo-800',
      event: 'bg-pink-100 text-pink-800',
      system: 'bg-gray-100 text-gray-800',
      message: 'bg-cyan-100 text-cyan-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

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
        <div className="text-center">
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notification Templates</h1>
            <p className="text-gray-600 mt-1">Create and manage notification templates</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {templates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Templates</h3>
            <p className="text-gray-600 mb-6">Create your first notification template</p>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className={!template.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  {!template.is_active && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      Inactive
                    </Badge>
                  )}
                </div>

                {template.description && (
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getTypeColor(template.type)}>
                    {template.type}
                  </Badge>
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  <p className="font-medium mb-1">Title:</p>
                  <p className="line-clamp-1">{template.title_template}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSend(template)}
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <TemplateModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          formData={formData}
          setFormData={setFormData}
          availableVariables={availableVariables}
          onSubmit={handleCreate}
          mode="create"
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTemplate && (
        <TemplateModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTemplate(null);
            resetForm();
          }}
          formData={formData}
          setFormData={setFormData}
          availableVariables={availableVariables}
          onSubmit={handleUpdate}
          mode="edit"
        />
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedTemplate && preview && (
        <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} size="md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Template Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview Variables
                </label>
                <div className="space-y-2 mb-4">
                  {availableVariables.map((variable) => (
                    <Input
                      key={variable}
                      type="text"
                      placeholder={variable}
                      value={previewVariables[variable] || ''}
                      onChange={(e) => {
                        setPreviewVariables({ ...previewVariables, [variable]: e.target.value });
                      }}
                    />
                  ))}
                </div>
                <Button variant="outline" onClick={handleUpdatePreview} className="mb-4">
                  Update Preview
                </Button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Title:</p>
                <p className="text-gray-900 mb-4">{preview.title}</p>
                <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                <p className="text-gray-900">{preview.message}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Send Modal */}
      {showSendModal && selectedTemplate && (
        <Modal isOpen={showSendModal} onClose={() => setShowSendModal(false)} size="md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Send Notification</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID (leave empty to send to yourself)
                </label>
                <Input
                  type="number"
                  placeholder="Optional: User ID"
                  value={sendUserId}
                  onChange={(e) => setSendUserId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Variables
                </label>
                <div className="space-y-2">
                  {availableVariables.map((variable) => (
                    <Input
                      key={variable}
                      type="text"
                      placeholder={variable}
                      value={sendVariables[variable] || ''}
                      onChange={(e) => {
                        setSendVariables({ ...sendVariables, [variable]: e.target.value });
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setShowSendModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSendNotification}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  availableVariables: string[];
  onSubmit: () => void;
  mode: 'create' | 'edit';
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  availableVariables,
  onSubmit,
  mode
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Create Template' : 'Edit Template'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <Input
              type="text"
              placeholder="Template name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              placeholder="Template description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="system">System</option>
                <option value="job">Job</option>
                <option value="application">Application</option>
                <option value="event">Event</option>
                <option value="message">Message</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title Template *
              <span className="text-xs text-gray-500 ml-2">
                Use {'{{variable_name}}'} for variables
              </span>
            </label>
            <Input
              type="text"
              placeholder="e.g., Welcome {{user_name}}!"
              value={formData.title_template}
              onChange={(e) => setFormData({ ...formData, title_template: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Template *
              <span className="text-xs text-gray-500 ml-2">
                Use {'{{variable_name}}'} for variables
              </span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={5}
              placeholder="e.g., Hello {{user_name}}, your application for {{job_title}} has been {{application_status}}."
              value={formData.message_template}
              onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Variables</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex flex-wrap gap-2">
                {availableVariables.map((variable) => (
                  <code key={variable} className="text-xs bg-white px-2 py-1 rounded border">
                    {'{{' + variable + '}}'}
                  </code>
                ))}
              </div>
            </div>
          </div>

          {mode === 'edit' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Active</label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onSubmit}
              disabled={!formData.name || !formData.title_template || !formData.message_template}
            >
              {mode === 'create' ? 'Create' : 'Update'} Template
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

