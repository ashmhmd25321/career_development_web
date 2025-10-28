import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Modal } from '../ui';
import { X, Check, XCircle, Award } from 'lucide-react';

interface QuizAnswer {
  id: number;
  answerText: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  answers: QuizAnswer[];
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificationId: number;
  certificationTitle: string;
  onComplete: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  certificationId,
  certificationTitle,
  onComplete,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: number }>({});
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; score: number } | null>(null);

  useEffect(() => {
    if (isOpen && certificationId) {
      loadQuestions();
      startAttempt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, certificationId]);

  const loadQuestions = async () => {
    try {
      const authTokens = localStorage.getItem('authTokens');
      const token = authTokens ? JSON.parse(authTokens).accessToken : null;
      
      const response = await fetch(
        `http://localhost:3001/api/quiz/certifications/${certificationId}/questions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const startAttempt = async () => {
    try {
      const authTokens = localStorage.getItem('authTokens');
      const token = authTokens ? JSON.parse(authTokens).accessToken : null;
      
      const response = await fetch(
        `http://localhost:3001/api/quiz/attempts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ certificationId }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAttemptId(data.id);
      }
    } catch (error) {
      console.error('Error starting attempt:', error);
    }
  };

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: answerId });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    
    setLoading(true);
    try {
      const authTokens = localStorage.getItem('authTokens');
      const token = authTokens ? JSON.parse(authTokens).accessToken : null;
      
      // Submit each answer
      for (const [questionId, answerId] of Object.entries(selectedAnswers)) {
        await fetch(
          `http://localhost:3001/api/quiz/attempts/${attemptId}/responses`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              questionId: parseInt(questionId),
              answerId,
            }),
          }
        );
      }
      
      // Complete quiz
      const completeResponse = await fetch(
        `http://localhost:3001/api/quiz/attempts/${attemptId}/complete`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (completeResponse.ok) {
        const data = await completeResponse.json();
        setResult(data);
        setSubmitted(true);
        onComplete(); // Refresh certifications
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  if (!isOpen) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswered = questions.every(q => selectedAnswers[q.id]);

  const handleClose = submitted ? () => {} : onClose;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 max-w-4xl mx-auto">
        {!submitted ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {certificationTitle} Quiz
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {currentQuestion && (
              <>
                <Card className="p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <Badge variant="secondary">
                      {currentQuestion.points} point{currentQuestion.points > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">
                    {currentQuestion.questionText}
                  </h4>
                  
                  <div className="space-y-3">
                    {currentQuestion.answers.map((answer) => (
                      <button
                        key={answer.id}
                        onClick={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedAnswers[currentQuestion.id] === answer.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        {answer.answerText}
                      </button>
                    ))}
                  </div>
                </Card>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={!allAnswered || loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Quiz'}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      disabled={!selectedAnswers[currentQuestion.id]}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="text-center py-8">
              {result?.passed ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-green-600 mb-4">
                    Congratulations!
                  </h3>
                  <p className="text-xl text-gray-600 mb-6">
                    You passed with a score of {result.score}%
                  </p>
                  <div className="bg-green-50 p-6 rounded-lg mb-6">
                    <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold">
                      You've earned the {certificationTitle} certification!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-red-600 mb-4">
                    Not Passed
                  </h3>
                  <p className="text-xl text-gray-600 mb-6">
                    Your score: {result?.score}% (Required: 70%)
                  </p>
                  <p className="text-gray-600 mb-6">
                    You need at least 70% to pass. Try again!
                  </p>
                </>
              )}
              
              <Button variant="primary" onClick={() => { resetQuiz(); onClose(); }}>
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default QuizModal;

