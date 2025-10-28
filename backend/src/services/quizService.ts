import { RowDataPacket, OkPacket } from 'mysql2/promise';
import { getConnection } from '@/database/connection';
import { logger } from '@/utils/logger';

export interface QuizQuestion {
  id: number;
  certificationId: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  orderIndex: number;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: number;
  questionId: number;
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface UserQuizAttempt {
  id: number;
  userId: number;
  certificationId: number;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  passingScore: number;
  passed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserQuizResponse {
  id: number;
  attemptId: number;
  questionId: number;
  answerId: number | null;
  responseText: string | null;
  isCorrect: boolean;
  pointsEarned: number;
  createdAt: string;
}

const toCamelCase = (row: any) => {
  if (!row) return row;
  const camelCaseRow: any = {};
  for (const key in row) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelCaseRow[camelKey] = row[key];
  }
  return camelCaseRow;
};

export const quizService = {
  async getQuizQuestions(certificationId: number): Promise<QuizQuestion[]> {
    const connection = getConnection();
    
    // Get questions
    const [questions] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM quiz_questions WHERE certification_id = ? ORDER BY order_index',
      [certificationId]
    );
    
    // Get answers for each question
    const questionsWithAnswers = await Promise.all(
      questions.map(async (q: any) => {
        const [answers] = await connection.execute<RowDataPacket[]>(
          'SELECT * FROM quiz_answers WHERE question_id = ? ORDER BY order_index',
          [q.id]
        );
        
        return {
          id: q.id,
          certificationId: q.certification_id,
          questionText: q.question_text,
          questionType: q.question_type,
          points: q.points,
          orderIndex: q.order_index,
          answers: answers.map((a: any) => ({
            id: a.id,
            questionId: a.question_id,
            answerText: a.answer_text,
            isCorrect: a.is_correct,
            orderIndex: a.order_index,
          })),
        };
      })
    );
    
    return questionsWithAnswers;
  },

  async startQuizAttempt(userId: number, certificationId: number): Promise<UserQuizAttempt> {
    const connection = getConnection();
    
    const [result] = await connection.execute<OkPacket>(
      `INSERT INTO user_quiz_attempts (user_id, certification_id, passing_score)
       VALUES (?, ?, 70.00)`,
      [userId, certificationId]
    );
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM user_quiz_attempts WHERE id = ?',
      [result.insertId]
    );
    
    return toCamelCase(rows[0]) as UserQuizAttempt;
  },

  async submitQuizResponse(
    attemptId: number,
    questionId: number,
    answerId: number | null,
    responseText: string | null
  ): Promise<{ isCorrect: boolean; pointsEarned: number }> {
    const connection = getConnection();
    
    if (answerId) {
      // For multiple choice/true false, check if answer is correct
      const [answerRow] = await connection.execute<RowDataPacket[]>(
        'SELECT is_correct, (SELECT points FROM quiz_questions WHERE id = ?) as points FROM quiz_answers WHERE id = ?',
        [questionId, answerId]
      );
      
      const isCorrect = answerRow[0]?.is_correct || false;
      const points = answerRow[0]?.points || 0;
      const pointsEarned = isCorrect ? points : 0;
      
      await connection.execute(
        'INSERT INTO user_quiz_responses (attempt_id, question_id, answer_id, is_correct, points_earned) VALUES (?, ?, ?, ?, ?)',
        [attemptId, questionId, answerId, isCorrect, pointsEarned]
      );
      
      return { isCorrect, pointsEarned };
    }
    
    // For short answer questions (manual grading needed, auto-graded as incorrect)
    await connection.execute(
      'INSERT INTO user_quiz_responses (attempt_id, question_id, response_text, is_correct, points_earned) VALUES (?, ?, ?, ?, ?)',
      [attemptId, questionId, responseText, false, 0]
    );
    
    return { isCorrect: false, pointsEarned: 0 };
  },

  async completeQuizAttempt(attemptId: number): Promise<{ passed: boolean; score: number }> {
    const connection = getConnection();
    
    // Calculate score
    const [responses] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        SUM(points_earned) as total_points,
        SUM((SELECT points FROM quiz_questions WHERE id = user_quiz_responses.question_id)) as max_points
       FROM user_quiz_responses
       WHERE attempt_id = ?`,
      [attemptId]
    );
    
    const totalPoints = responses[0]?.total_points || 0;
    const maxPoints = responses[0]?.max_points || 1;
    const score = Math.round((totalPoints / maxPoints) * 100);
    const passed = score >= 70;
    
    // Update attempt
    await connection.execute(
      `UPDATE user_quiz_attempts 
       SET completed_at = CURRENT_TIMESTAMP, 
           score = ?, 
           passed = ?
       WHERE id = ?`,
      [score, passed, attemptId]
    );
    
    // If passed, award certification
    if (passed) {
      const [attempt] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM user_quiz_attempts WHERE id = ?',
        [attemptId]
      );
      
      const userId = attempt[0].user_id;
      const certificationId = attempt[0].certification_id;
      
      // Check if user already has this certification
      const [existing] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM user_certifications WHERE user_id = ? AND certification_id = ?',
        [userId, certificationId]
      );
      
      if (existing.length === 0) {
        // Get certification validity period
        const [cert] = await connection.execute<RowDataPacket[]>(
          'SELECT validity_period_months FROM certifications WHERE id = ?',
          [certificationId]
        );
        
        const validityMonths = cert[0]?.validity_period_months || 24;
        
        // Award certification
        await connection.execute(
          `INSERT INTO user_certifications (user_id, certification_id, issued_date, expiry_date, verified)
           VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? MONTH), TRUE)`,
          [userId, certificationId, validityMonths]
        );
      }
    }
    
    return { passed, score };
  },

  async getUserAttempts(userId: number): Promise<UserQuizAttempt[]> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM user_quiz_attempts WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    return rows.map(toCamelCase) as UserQuizAttempt[];
  },

  async getAttemptById(attemptId: number, userId: number): Promise<UserQuizAttempt | null> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM user_quiz_attempts WHERE id = ? AND user_id = ?',
      [attemptId, userId]
    );
    
    if (rows.length === 0) return null;
    return toCamelCase(rows[0]) as UserQuizAttempt;
  },
};

