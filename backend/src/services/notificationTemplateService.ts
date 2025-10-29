import { getConnection } from '../database/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { notificationService } from './notificationService';
import { notificationPreferencesService } from './notificationPreferencesService';

export interface NotificationTemplate {
  id: number;
  name: string;
  title_template: string;
  message_template: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'job' | 'application' | 'event' | 'system' | 'message';
  variables?: string; // JSON array
  description?: string;
  created_by?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTemplateData {
  name: string;
  title_template: string;
  message_template: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: 'job' | 'application' | 'event' | 'system' | 'message';
  variables?: string[];
  description?: string;
  created_by: number;
}

export interface UpdateTemplateData {
  name?: string;
  title_template?: string;
  message_template?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: 'job' | 'application' | 'event' | 'system' | 'message';
  variables?: string[];
  description?: string;
  is_active?: boolean;
}

// Common template variables
const COMMON_VARIABLES = [
  'user_name',
  'user_email',
  'job_title',
  'company_name',
  'application_status',
  'event_title',
  'event_date',
  'notification_date',
  'platform_name'
];

export const notificationTemplateService = {
  // Get all templates
  async getAllTemplates(activeOnly: boolean = false): Promise<NotificationTemplate[]> {
    const connection = getConnection();
    
    let query = 'SELECT * FROM notification_templates';
    const params: any[] = [];
    
    if (activeOnly) {
      query += ' WHERE is_active = TRUE';
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await connection.execute<RowDataPacket[]>(query, params);
    return rows.map(row => ({ ...row } as NotificationTemplate));
  },

  // Get template by ID
  async getTemplateById(id: number): Promise<NotificationTemplate | null> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM notification_templates WHERE id = ?',
      [id]
    );
    
    return rows.length > 0 ? (rows[0] as NotificationTemplate) : null;
  },

  // Create template
  async createTemplate(data: CreateTemplateData): Promise<NotificationTemplate> {
    const connection = getConnection();
    
    const variablesJson = data.variables ? JSON.stringify(data.variables) : JSON.stringify(COMMON_VARIABLES);
    
    const query = `
      INSERT INTO notification_templates (
        name, title_template, message_template, type, category, variables, description, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute<ResultSetHeader>(
      query,
      [
        data.name,
        data.title_template,
        data.message_template,
        data.type || 'info',
        data.category || 'system',
        variablesJson,
        data.description || null,
        data.created_by
      ]
    );
    
    const template = await this.getTemplateById(result.insertId);
    if (!template) {
      throw new Error('Failed to retrieve created template');
    }
    
    return template;
  },

  // Update template
  async updateTemplate(id: number, data: UpdateTemplateData): Promise<NotificationTemplate> {
    const connection = getConnection();
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.title_template !== undefined) {
      updates.push('title_template = ?');
      values.push(data.title_template);
    }
    if (data.message_template !== undefined) {
      updates.push('message_template = ?');
      values.push(data.message_template);
    }
    if (data.type !== undefined) {
      updates.push('type = ?');
      values.push(data.type);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.variables !== undefined) {
      updates.push('variables = ?');
      values.push(JSON.stringify(data.variables));
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(data.is_active);
    }
    
    if (updates.length === 0) {
      const existing = await this.getTemplateById(id);
      if (!existing) {
        throw new Error('Template not found');
      }
      return existing;
    }
    
    values.push(id);
    
    await connection.execute(
      `UPDATE notification_templates SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    const updated = await this.getTemplateById(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated template');
    }
    
    return updated;
  },

  // Delete template
  async deleteTemplate(id: number): Promise<void> {
    const connection = getConnection();
    
    await connection.execute(
      'DELETE FROM notification_templates WHERE id = ?',
      [id]
    );
  },

  // Render template with variables
  renderTemplate(template: NotificationTemplate, variables: Record<string, any>): { title: string; message: string } {
    let title = template.title_template;
    let message = template.message_template;
    
    // Replace variables in format {{variable_name}}
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      const value = variables[key] || '';
      title = title.replace(regex, value);
      message = message.replace(regex, value);
    });
    
    return { title, message };
  },

  // Get available variables for a category
  getAvailableVariables(category: string): string[] {
    const categoryVariables: Record<string, string[]> = {
      job: [...COMMON_VARIABLES, 'job_title', 'company_name', 'job_location', 'job_salary', 'application_deadline'],
      application: [...COMMON_VARIABLES, 'job_title', 'company_name', 'application_status', 'interview_date', 'interview_location'],
      event: [...COMMON_VARIABLES, 'event_title', 'event_date', 'event_location', 'event_type', 'organizer_name'],
      system: COMMON_VARIABLES,
      message: [...COMMON_VARIABLES, 'sender_name', 'message_preview']
    };
    
    return categoryVariables[category] || COMMON_VARIABLES;
  },

  // Use template to send notification
  async useTemplateToSend(
    templateId: number,
    userId: number,
    variables: Record<string, any>,
    relatedId?: number
  ): Promise<void> {
    const template = await this.getTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    
    if (!template.is_active) {
      throw new Error('Template is not active');
    }
    
    // Check user preferences
    const shouldSend = await notificationPreferencesService.shouldSendNotification(
      userId,
      template.type,
      template.category,
      'in_app'
    );
    
    if (!shouldSend) {
      return; // User has disabled this notification type/category
    }
    
    // Render template
    const rendered = this.renderTemplate(template, variables);
    
    // Create notification
    await notificationService.createNotification({
      user_id: userId,
      title: rendered.title,
      message: rendered.message,
      type: template.type,
      category: template.category,
      related_id: relatedId
    });
  }
};

