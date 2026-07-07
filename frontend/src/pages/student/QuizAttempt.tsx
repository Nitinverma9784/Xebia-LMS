import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Award, HelpCircle, CheckCircle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { studentService } from '../../services/student.service';
import type { Assignment, Question } from '../../types';

export const QuizAttempt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Quiz navigation and attempt state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // Maps question ID to selected answer/option
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // seconds

  const fetchQuizDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await studentService.getAssignmentDetail(id);
      const q = res.assignment;
      if (q.assignmentType !== 'QUIZ') {
        toast.error('This is not a quiz.');
        navigate('/student/quizzes');
        return;
      }
      if (q.submissionStatus === 'submitted' || q.submissionStatus === 'reviewed') {
        toast.error('You have already submitted this quiz.');
        navigate(`/student/quizzes/${id}/review`);
        return;
      }

      setQuiz(q);
      
      // Calculate duration dynamically: 5 minutes per question
      const durationSeconds = (q.questions ? q.questions.length : 6) * 5 * 60;
      setTimeLeft(durationSeconds);
    } catch {
      toast.error('Failed to load quiz questions.');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchQuizDetails();
  }, [fetchQuizDetails]);

  // Handle countdown timer
  useEffect(() => {
    if (timeLeft === null || submitting) return;
    if (timeLeft <= 0) {
      toast.error('Time is up! Submitting your answers automatically.');
      autoSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

  const autoSubmitQuiz = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const quizAnswersList = (quiz.questions || []).map(q => ({
        questionId: q.id,
        selectedOption: answers[Number(q.id)] || ''
      }));

      await studentService.submitAssignment(quiz.id, {
        quizAnswersJson: JSON.stringify(quizAnswersList)
      });
      toast.success('Your quiz has been submitted successfully.');
      navigate(`/student/quizzes/${quiz.id}/review`);
    } catch {
      toast.error('Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    
    // Check if there are unanswered questions
    const totalQuestions = quiz.questions?.length || 0;
    const answeredCount = Object.keys(answers).length;
    
    if (answeredCount < totalQuestions) {
      const confirm = window.confirm(`You have not answered ${totalQuestions - answeredCount} questions. Are you sure you want to submit?`);
      if (!confirm) return;
    } else {
      const confirm = window.confirm('Are you sure you want to submit your quiz answers?');
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      const quizAnswersList = (quiz.questions || []).map(q => ({
        questionId: q.id,
        selectedOption: answers[Number(q.id)] || ''
      }));

      await studentService.submitAssignment(quiz.id, {
        quizAnswersJson: JSON.stringify(quizAnswersList)
      });
      toast.success('Your quiz has been submitted successfully.');
      navigate(`/student/quizzes/${quiz.id}/review`);
    } catch {
      toast.error('Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectOption = (questionId: number, optionKey: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  // Format Time Helper
  const formatSeconds = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout role="student" title="Online Quiz Attempt">
        <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
          <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-40 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!quiz) return null;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <Layout role="student" title="Quiz Attempt" subtitle={quiz.title}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
        
        {/* =================================LEFT PANEL: Navigation & Info ================================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* Timer Card */}
          <Card className="bg-[#6C1D5F0D] border-[#6C1D5F1A] dark:bg-[#6C1D5F]/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-[#6C1D5F]" /> Time Remaining
              </span>
              <span className={`text-base font-black font-mono ${
                timeLeft !== null && timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-[#6C1D5F] dark:text-purple-400'
              }`}>
                {timeLeft !== null ? formatSeconds(timeLeft) : '—'}
              </span>
            </div>
          </Card>

          {/* Question Navigator */}
          <Card className="border border-[var(--brand-border)]">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Questions Progress</h3>
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[Number(q.id)] !== undefined && answers[Number(q.id)] !== '';
                
                let stateStyle = 'bg-slate-50 dark:bg-slate-800 text-[var(--text-secondary)] border-[var(--brand-border)]';
                if (isCurrent) {
                  stateStyle = 'bg-[#6C1D5F] text-white border-transparent ring-2 ring-purple-300 dark:ring-purple-900';
                } else if (isAnswered) {
                  stateStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-teal-400 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold border cursor-pointer transition-all ${stateStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-[var(--brand-border)] space-y-2 text-[10px] text-[var(--text-secondary)] font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-[#6C1D5F] block" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/15 border border-emerald-500 block" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-[var(--brand-border)] block" />
                <span>Unanswered</span>
              </div>
            </div>
          </Card>
        </div>

        {/* =================================RIGHT PANEL: Question display & actions ================================= */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="min-h-[350px] flex flex-col justify-between border border-[var(--brand-border)]">
            {currentQuestion ? (
              <div className="space-y-6">
                {/* Question Info Header */}
                <div className="flex justify-between items-center pb-3 border-b border-[var(--brand-border)]">
                  <span className="text-xs font-bold text-[var(--text-secondary)]">
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-xs font-semibold text-[#01AC9F] bg-[#01AC9F0D] px-2.5 py-1 rounded-xl border border-[#01AC9F1A] flex items-center gap-1">
                    <Award size={12} /> {currentQuestion.marks} Marks
                  </span>
                </div>

                {/* Question Text */}
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-[var(--text-primary)] leading-normal">
                    {currentQuestion.questionText}
                  </h2>

                  {/* Options (MCQ Options vs Descriptive Input) */}
                  {currentQuestion.questionType !== 'SHORT_ANSWER' ? (
                    <div className="grid grid-cols-1 gap-3.5 mt-5">
                      {[
                        { key: 'A', value: currentQuestion.optionA },
                        { key: 'B', value: currentQuestion.optionB },
                        ...(currentQuestion.optionC ? [{ key: 'C', value: currentQuestion.optionC }] : []),
                        ...(currentQuestion.optionD ? [{ key: 'D', value: currentQuestion.optionD }] : []),
                      ].map((opt) => {
                        const isSelected = answers[Number(currentQuestion.id)] === opt.key;

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => handleSelectOption(Number(currentQuestion.id), opt.key)}
                            className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left text-xs font-medium cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'bg-[#6C1D5F10] border-[#6C1D5F] text-[#6C1D5F] dark:text-purple-400 font-bold shadow-sm'
                                : 'bg-white dark:bg-[#1E293B] border-[var(--brand-border)] text-[var(--text-primary)] hover:border-slate-400'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                              isSelected ? 'bg-[#6C1D5F] text-white border-transparent' : 'border-[var(--brand-border)] text-[var(--text-secondary)]'
                            }`}>
                              {opt.key}
                            </span>
                            {opt.value}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Descriptive Short Answer field */
                    <div className="space-y-2 mt-5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">Your Answer</label>
                      <input
                        type="text"
                        value={answers[Number(currentQuestion.id)] || ''}
                        onChange={(e) => handleSelectOption(Number(currentQuestion.id), e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] focus:border-[#6C1D5F] text-[var(--text-primary)] rounded-xl py-3 px-4 text-sm transition-colors focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <HelpCircle size={32} className="text-[var(--text-secondary)]" />
                <p className="text-sm font-semibold text-[var(--text-secondary)] mt-2">No question loaded.</p>
              </div>
            )}

            {/* Bottom Navigation Toolbar */}
            <div className="flex justify-between items-center pt-5 mt-6 border-t border-[var(--brand-border)]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
                disabled={currentIndex === 0}
                icon={<ChevronLeft size={16} />}
              >
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitQuiz}
                  loading={submitting}
                  disabled={submitting}
                  icon={<CheckCircle size={16} />}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentIndex(prev => Math.min(prev + 1, totalQuestions - 1))}
                  icon={<ChevronRight size={16} />}
                  iconPosition="right"
                >
                  Next
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
