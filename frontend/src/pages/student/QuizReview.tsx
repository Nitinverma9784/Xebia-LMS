import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Clock, Calendar, CheckCircle2, AlertCircle, FileText, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { studentService } from '../../services/student.service';
import { formatDate, formatDateTime } from '../../utils/helpers';
import type { Assignment, Submission } from '../../types';

export const QuizReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

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
      setQuiz(q);
    } catch {
      toast.error('Failed to load quiz details.');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchQuizDetails();
  }, [fetchQuizDetails]);

  // Parse student answers
  const submittedAnswersMap = useMemo(() => {
    if (!quiz?.submission?.quizAnswers) return {};
    try {
      const list = JSON.parse(quiz.submission.quizAnswers);
      const map: Record<number, string> = {};
      if (Array.isArray(list)) {
        list.forEach((ans: any) => {
          if (ans.questionId !== undefined) {
            map[ans.questionId] = ans.selectedOption;
          }
        });
      }
      return map;
    } catch {
      return {};
    }
  }, [quiz?.submission?.quizAnswers]);

  if (loading) {
    return (
      <Layout role="student" title="Quiz Review">
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-40 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!quiz || !quiz.submission) {
    return (
      <Layout role="student" title="Quiz Review">
        <Card className="py-12 text-center max-w-3xl mx-auto">
          <AlertCircle size={32} className="text-rose-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-[var(--text-primary)]">Submission Not Found</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">You have not submitted this quiz yet.</p>
          <Button variant="primary" onClick={() => navigate('/student/quizzes')}>Back to Quizzes</Button>
        </Card>
      </Layout>
    );
  }

  const sub = quiz.submission;
  const accuracy = Math.round(((sub.marks || 0) / (quiz.maxMarks || 1)) * 100);

  return (
    <Layout role="student" title="Quiz Review" subtitle={quiz.title}>
      <div className="max-w-3xl mx-auto space-y-5 select-none animate-fade-in">
        <button
          onClick={() => navigate('/student/quizzes')}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} /> Back to Quizzes
        </button>

        {/* Header Summary Card */}
        <Card className="bg-slate-50 dark:bg-[#1E293B] border border-[var(--brand-border)]">
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mb-3">
              <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Quiz Completed</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Submitted on {formatDateTime(sub.submittedAt)}
            </p>
            
            <div className="mt-5 p-4 bg-white dark:bg-slate-800/40 border border-[var(--brand-border)] rounded-2xl flex gap-6 items-center shadow-sm">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1">Your Score</p>
                <p className="text-xl font-black text-[#6C1D5F] dark:text-purple-400">
                  {sub.marks !== null && sub.marks !== undefined ? sub.marks : 'Not Graded'} 
                  <span className="text-xs font-normal text-[var(--text-secondary)]"> / {quiz.maxMarks}</span>
                </p>
              </div>
              <div className="h-8 border-r border-[var(--brand-border)]" />
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1">Accuracy</p>
                <p className="text-xl font-black text-[#01AC9F]">
                  {sub.marks !== null && sub.marks !== undefined ? `${accuracy}%` : '—'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quiz details & feedback */}
        <Card className="border border-[var(--brand-border)]">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Quiz Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-[var(--brand-border)]">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-0.5">Subject</span>
              <span className="text-xs text-[var(--text-primary)] font-medium">{quiz.subject}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-[var(--brand-border)]">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-0.5">Status</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold capitalize">{sub.status}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-[var(--brand-border)]">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-0.5">Teacher</span>
              <span className="text-xs text-[var(--text-primary)] font-medium">{quiz.teacher?.name || 'Teacher'}</span>
            </div>
          </div>

          {sub.feedback && (
            <div className="mt-4 p-3 bg-purple-50/50 dark:bg-[#6C1D5F0D] border border-purple-100 dark:border-[#6C1D5F1A] rounded-2xl">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#6C1D5F] dark:text-purple-400 mb-1 flex items-center gap-1">
                <MessageSquare size={11} /> Teacher Remarks
              </p>
              <p className="text-xs text-[var(--text-primary)] italic">
                "{sub.feedback}"
              </p>
            </div>
          )}
        </Card>

        {/* Questions Answers review */}
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 mt-5">Question Review</h3>
        <div className="space-y-4">
          {quiz.questions?.map((q, idx) => {
            const selected = submittedAnswersMap[q.id!];
            const isCorrect = String(selected).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();

            return (
              <Card
                key={q.id}
                className={`border-l-4 shadow-sm ${isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'}`}
              >
                <div className="flex items-start gap-2.5">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold shrink-0 ${
                    isCorrect ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <p className="text-xs font-bold text-[var(--text-primary)] leading-normal">{q.questionText}</p>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded shrink-0 ${
                        isCorrect ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                      }`}>
                        {isCorrect ? `+${q.marks} Marks` : '0 Marks'}
                      </span>
                    </div>

                    {q.questionType !== 'SHORT_ANSWER' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {[
                          { key: 'A', value: q.optionA },
                          { key: 'B', value: q.optionB },
                          ...(q.optionC ? [{ key: 'C', value: q.optionC }] : []),
                          ...(q.optionD ? [{ key: 'D', value: q.optionD }] : []),
                        ].map((opt) => {
                          const isSelected = selected === opt.key;
                          const isCorrectAnswer = q.correctAnswer === opt.key;

                          let optStyle = 'border-[var(--brand-border)] text-[var(--text-secondary)]';
                          if (isSelected) {
                            optStyle = isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold'
                              : 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 font-semibold';
                          } else if (isCorrectAnswer) {
                            optStyle = 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium';
                          }

                          return (
                            <div key={opt.key} className={`flex items-center gap-2 p-2 border rounded-xl text-[11px] ${optStyle}`}>
                              <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] border shrink-0 ${
                                isSelected
                                  ? isCorrect ? 'bg-emerald-500 border-transparent text-white' : 'bg-red-500 border-transparent text-white'
                                  : isCorrectAnswer ? 'bg-emerald-500/20 border-transparent text-emerald-600' : 'border-[var(--brand-border)] text-[var(--text-secondary)]'
                              }`}>
                                {opt.key}
                              </span>
                              <span className="truncate">{opt.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-1 mt-2 text-xs">
                        <p className="text-[var(--text-secondary)]">
                          Your Answer: <span className={`font-semibold ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>{selected || '(No Answer)'}</span>
                        </p>
                        {!isCorrect && (
                          <p className="text-[11px] text-[var(--text-secondary)]">
                            Correct Answer: <span className="font-semibold text-emerald-500">{q.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};
