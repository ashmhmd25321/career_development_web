import { Response } from 'express';
import { quizService } from '@/services/quizService';
import { logger } from '@/utils/logger';
import { AuthRequest } from '@/middleware/auth';

export const quizController = {
  async getQuestions(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { certificationId } = req.params;
      const questions = await quizService.getQuizQuestions(parseInt(certificationId));
      return res.json(questions);
    } catch (error) {
      logger.error('Error fetching quiz questions:', error);
      return res.status(500).json({ error: 'Failed to fetch quiz questions' });
    }
  },

  async startQuiz(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { certificationId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      if (!certificationId) {
        return res.status(400).json({ error: 'certificationId is required' });
      }
      
      const attempt = await quizService.startQuizAttempt(userId, parseInt(certificationId));
      return res.status(201).json(attempt);
    } catch (error) {
      logger.error('Error starting quiz:', error);
      return res.status(500).json({ error: 'Failed to start quiz' });
    }
  },

  async submitResponse(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { attemptId } = req.params;
      const { questionId, answerId, responseText } = req.body;
      
      const result = await quizService.submitQuizResponse(
        parseInt(attemptId),
        questionId,
        answerId,
        responseText
      );
      
      return res.json(result);
    } catch (error) {
      logger.error('Error submitting response:', error);
      return res.status(500).json({ error: 'Failed to submit response' });
    }
  },

  async completeQuiz(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { attemptId } = req.params;
      
      const result = await quizService.completeQuizAttempt(parseInt(attemptId));
      return res.json(result);
    } catch (error) {
      logger.error('Error completing quiz:', error);
      return res.status(500).json({ error: 'Failed to complete quiz' });
    }
  },

  async getAttempt(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { attemptId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const attempt = await quizService.getAttemptById(parseInt(attemptId), userId);
      
      if (!attempt) {
        return res.status(404).json({ error: 'Attempt not found' });
      }
      
      return res.json(attempt);
    } catch (error) {
      logger.error('Error fetching attempt:', error);
      return res.status(500).json({ error: 'Failed to fetch attempt' });
    }
  },

  async getUserAttempts(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const attempts = await quizService.getUserAttempts(userId);
      return res.json(attempts);
    } catch (error) {
      logger.error('Error fetching user attempts:', error);
      return res.status(500).json({ error: 'Failed to fetch attempts' });
    }
  },
};

