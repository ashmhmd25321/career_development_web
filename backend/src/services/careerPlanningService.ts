import { RowDataPacket, OkPacket } from 'mysql2/promise';
import { getConnection } from '@/database/connection';
import { logger } from '@/utils/logger';

export interface CareerGoal {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  targetDate: string | null;
  currentStatus: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  progressPercentage: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CareerMilestone {
  id: number;
  goalId: number;
  title: string;
  description: string | null;
  targetDate: string | null;
  achieved: boolean;
  achievedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalData {
  title: string;
  description?: string;
  targetDate?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  currentStatus?: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
}

export interface CreateMilestoneData {
  goalId: number;
  title: string;
  description?: string;
  targetDate?: string;
}

const toCamelCaseGoal = (goal: any): CareerGoal => {
  if (!goal) return goal;
  return {
    id: goal.id,
    userId: goal.user_id,
    title: goal.title,
    description: goal.description,
    targetDate: goal.target_date,
    currentStatus: goal.current_status,
    priority: goal.priority,
    progressPercentage: goal.progress_percentage,
    completedAt: goal.completed_at,
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
  };
};

const toCamelCaseMilestone = (milestone: any): CareerMilestone => {
  if (!milestone) return milestone;
  return {
    id: milestone.id,
    goalId: milestone.goal_id,
    title: milestone.title,
    description: milestone.description,
    targetDate: milestone.target_date,
    achieved: milestone.achieved,
    achievedDate: milestone.achieved_date,
    createdAt: milestone.created_at,
    updatedAt: milestone.updated_at,
  };
};

export const careerPlanningService = {
  // ==================== GOALS ====================
  
  // Get all goals for a user
  async getUserGoals(userId: number): Promise<CareerGoal[]> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM career_goals WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return rows.map(toCamelCaseGoal);
  },

  // Get goal by ID
  async getGoalById(goalId: number, userId: number): Promise<CareerGoal | null> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM career_goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    );

    if (rows.length === 0) return null;
    return toCamelCaseGoal(rows[0]);
  },

  // Create a new goal
  async createGoal(userId: number, data: CreateGoalData): Promise<CareerGoal> {
    const connection = getConnection();
    const [result] = await connection.execute<OkPacket>(
      `INSERT INTO career_goals (user_id, title, description, target_date, priority, current_status, progress_percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.title,
        data.description || null,
        data.targetDate || null,
        data.priority || 'Medium',
        data.currentStatus || 'Not Started',
        0,
      ]
    );

    const newGoal = await this.getGoalById(result.insertId, userId);
    if (!newGoal) throw new Error('Failed to create goal');
    return newGoal;
  },

  // Update a goal
  async updateGoal(goalId: number, userId: number, data: Partial<CreateGoalData>): Promise<CareerGoal> {
    const connection = getConnection();
    
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }

    if (data.targetDate !== undefined) {
      updates.push('target_date = ?');
      params.push(data.targetDate);
    }

    if (data.priority !== undefined) {
      updates.push('priority = ?');
      params.push(data.priority);
    }

    if (data.currentStatus !== undefined) {
      updates.push('current_status = ?');
      params.push(data.currentStatus);
      
      // Update completed_at if status is Completed
      if (data.currentStatus === 'Completed') {
        updates.push('completed_at = CURRENT_TIMESTAMP');
      } else {
        updates.push('completed_at = NULL');
      }
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(userId, goalId);

    await connection.execute(
      `UPDATE career_goals 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND id = ?`,
      params
    );

    const updatedGoal = await this.getGoalById(goalId, userId);
    if (!updatedGoal) throw new Error('Failed to update goal');
    return updatedGoal;
  },

  // Update goal progress
  async updateGoalProgress(goalId: number, userId: number, progressPercentage: number): Promise<CareerGoal> {
    const connection = getConnection();
    
    await connection.execute(
      'UPDATE career_goals SET progress_percentage = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND id = ?',
      [progressPercentage, userId, goalId]
    );

    const updatedGoal = await this.getGoalById(goalId, userId);
    if (!updatedGoal) throw new Error('Failed to update goal progress');
    return updatedGoal;
  },

  // Delete a goal
  async deleteGoal(goalId: number, userId: number): Promise<void> {
    const connection = getConnection();
    await connection.execute(
      'DELETE FROM career_goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    );
  },

  // ==================== MILESTONES ====================

  // Get all milestones for a goal
  async getGoalMilestones(goalId: number, userId: number): Promise<CareerMilestone[]> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT cm.* FROM career_milestones cm
       INNER JOIN career_goals cg ON cm.goal_id = cg.id
       WHERE cm.goal_id = ? AND cg.user_id = ?
       ORDER BY cm.target_date ASC, cm.created_at ASC`,
      [goalId, userId]
    );

    return rows.map(toCamelCaseMilestone);
  },

  // Create a milestone
  async createMilestone(userId: number, data: CreateMilestoneData): Promise<CareerMilestone> {
    const connection = getConnection();
    
    // Verify that the goal belongs to the user
    const goal = await this.getGoalById(data.goalId, userId);
    if (!goal) throw new Error('Goal not found or access denied');

    const [result] = await connection.execute<OkPacket>(
      `INSERT INTO career_milestones (goal_id, title, description, target_date)
       VALUES (?, ?, ?, ?)`,
      [
        data.goalId,
        data.title,
        data.description || null,
        data.targetDate || null,
      ]
    );

    const newMilestone = await this.getMilestoneById(result.insertId, userId);
    if (!newMilestone) throw new Error('Failed to create milestone');
    return newMilestone;
  },

  // Get milestone by ID
  async getMilestoneById(milestoneId: number, userId: number): Promise<CareerMilestone | null> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT cm.* FROM career_milestones cm
       INNER JOIN career_goals cg ON cm.goal_id = cg.id
       WHERE cm.id = ? AND cg.user_id = ?`,
      [milestoneId, userId]
    );

    if (rows.length === 0) return null;
    return toCamelCaseMilestone(rows[0]);
  },

  // Update a milestone
  async updateMilestone(milestoneId: number, userId: number, data: Partial<CreateMilestoneData & { achieved?: boolean }>): Promise<CareerMilestone> {
    const connection = getConnection();
    
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }

    if (data.targetDate !== undefined) {
      updates.push('target_date = ?');
      params.push(data.targetDate);
    }

    if (data.achieved !== undefined) {
      updates.push('achieved = ?');
      params.push(data.achieved);
      
      if (data.achieved) {
        updates.push('achieved_date = CURRENT_TIMESTAMP');
      } else {
        updates.push('achieved_date = NULL');
      }
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    // Verify milestone belongs to user's goal
    const milestone = await this.getMilestoneById(milestoneId, userId);
    if (!milestone) throw new Error('Milestone not found or access denied');

    params.push(milestoneId);

    await connection.execute(
      `UPDATE career_milestones 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      params
    );

    const updatedMilestone = await this.getMilestoneById(milestoneId, userId);
    if (!updatedMilestone) throw new Error('Failed to update milestone');
    return updatedMilestone;
  },

  // Delete a milestone
  async deleteMilestone(milestoneId: number, userId: number): Promise<void> {
    const connection = getConnection();
    
    // Verify milestone belongs to user's goal
    const milestone = await this.getMilestoneById(milestoneId, userId);
    if (!milestone) throw new Error('Milestone not found or access denied');

    await connection.execute(
      'DELETE FROM career_milestones WHERE id = ?',
      [milestoneId]
    );
  },

  // ==================== STATISTICS ====================

  // Get user's career planning statistics
  async getCareerStats(userId: number): Promise<{
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    inProgressGoals: number;
    totalMilestones: number;
    achievedMilestones: number;
    averageProgress: number;
  }> {
    const connection = getConnection();
    
    // Goals statistics
    const [goals] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN current_status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN current_status = 'Completed' THEN 1 ELSE 0 END) as completed,
        AVG(progress_percentage) as avg_progress
       FROM career_goals
       WHERE user_id = ?`,
      [userId]
    );

    const goalsData = goals[0];

    // Milestones statistics
    const [milestones] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN achieved = true THEN 1 ELSE 0 END) as achieved
       FROM career_milestones cm
       INNER JOIN career_goals cg ON cm.goal_id = cg.id
       WHERE cg.user_id = ?`,
      [userId]
    );

    const milestonesData = milestones[0];

    return {
      totalGoals: goalsData.total || 0,
      activeGoals: (goalsData.total || 0) - (goalsData.completed || 0),
      completedGoals: goalsData.completed || 0,
      inProgressGoals: goalsData.in_progress || 0,
      totalMilestones: milestonesData.total || 0,
      achievedMilestones: milestonesData.achieved || 0,
      averageProgress: Math.round(goalsData.avg_progress || 0),
    };
  },
};

