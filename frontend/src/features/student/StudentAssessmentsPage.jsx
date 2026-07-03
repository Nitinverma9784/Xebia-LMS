'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Trophy, HelpCircle, CheckCircle, Clock, Award, X } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';

export default function StudentAssessmentsPage() {
  const { courses } = useCatalog();
  const { showToast } = useToast();
  const [activeQuizModal, setActiveQuizModal] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Extract all quizzes created in Admin Course Builder
  const liveQuizzes = useMemo(() => {
    const list = [];
    (courses || []).forEach(c => {
      (c.modules || []).forEach(m => {
        (m.submodules || []).forEach(s => {
          (s.contents || []).forEach(ct => {
            if (ct.type === 'quiz') {
              let quizMeta = {};
              try { quizMeta = JSON.parse(ct.markdown || '{}'); } catch {}
              list.push({
                id: ct.id,
                title: ct.title || 'Knowledge Check Quiz',
                courseTitle: c.title,
                duration: ct.duration || '20 mins',
                quizData: quizMeta.quizData || {},
                questions: quizMeta.quizData?.questions || [
                  {
                    id: 'q1',
                    title: 'What is the primary benefit of microservices architecture?',
                    options: [
                      { text: 'Independent service deployment and loose coupling', isCorrect: true },
                      { text: 'Single monolithic database for all services', isCorrect: false },
                      { text: 'No API security requirements', isCorrect: false }
                    ]
                  }
                ]
              });
            }
          });
        });
      });
    });
    return list;
  }, [courses]);

  const handleStartQuiz = (quiz) => {
    setActiveQuizModal(quiz);
    setUserAnswers({});
    setQuizResult(null);
  };

  const handleSelectOption = (qIdx, oIdx) => {
    setUserAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    const questions = activeQuizModal.questions || [];
    questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      if (selected !== undefined && q.options && q.options[selected]?.isCorrect) {
        score += 1;
      }
    });
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= (activeQuizModal.quizData?.passingPercentage || 70);

    setQuizResult({ score, total, percentage, passed });
    showToast(passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Try again to improve score.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] p-6 lg:p-8 text-slate-800 dark:text-[#F8FAFC]">
      <PageHeader
        title="Quizzes & Knowledge Assessments"
        subtitle="Test your mastery across published course modules with real-time scoring and feedback."
      />

      {liveQuizzes.length === 0 ? (
        <div className="mt-12 text-center p-12 rounded-3xl border border-dashed border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] max-w-md mx-auto">
          <Trophy className="h-10 w-10 text-purple-500 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Quizzes Available</h3>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
            When an Admin creates a Quiz in the Course Builder, it will automatically sync and appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {liveQuizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 p-3">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300 px-3 py-1 text-[10px] font-extrabold uppercase">
                    Published Quiz
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white">{quiz.title}</h3>
                <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">{quiz.courseTitle}</p>

                <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-500 dark:text-[#CBD5E1] bg-slate-50 dark:bg-[#111827] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between"><span>Time Limit:</span><span className="font-extrabold text-slate-800 dark:text-white">{quiz.duration}</span></div>
                  <div className="flex justify-between"><span>Questions:</span><span className="font-extrabold text-slate-800 dark:text-white">{quiz.questions?.length || 1}</span></div>
                  <div className="flex justify-between"><span>Passing Score:</span><span className="font-extrabold text-purple-600">70%</span></div>
                </div>
              </div>

              <div className="mt-5 pt-2">
                <button
                  type="button"
                  onClick={() => handleStartQuiz(quiz)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  <PlayCircle className="h-4 w-4" /> Start Knowledge Quiz
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Interactive Student Quiz Taking Modal */}
      {activeQuizModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-[24px] max-w-2xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{activeQuizModal.title}</h3>
                <p className="text-xs text-slate-500">{activeQuizModal.courseTitle}</p>
              </div>
              <button type="button" onClick={() => setActiveQuizModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {quizResult ? (
              <div className="text-center py-6 space-y-4">
                <div className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center ${quizResult.passed ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'}`}>
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {quizResult.passed ? 'Passed Quiz!' : 'Quiz Needs Review'}
                </h3>
                <p className="text-xs text-slate-500">
                  Your Score: <strong className="text-purple-600">{quizResult.score} / {quizResult.total} ({quizResult.percentage}%)</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setQuizResult(null)}
                  className="px-6 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Retake Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {activeQuizModal.questions?.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="p-4 rounded-2xl border border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827]/50 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Q{qIdx + 1}. {q.title}
                    </h4>
                    <div className="space-y-2">
                      {q.options?.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectOption(qIdx, oIdx)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer text-xs font-medium flex items-center gap-3 ${userAnswers[qIdx] === oIdx ? 'bg-purple-50 dark:bg-purple-950/50 border-[#7C3AED] text-purple-900 dark:text-purple-300 font-bold' : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'}`}
                        >
                          <input type="radio" checked={userAnswers[qIdx] === oIdx} onChange={() => {}} className="h-4 w-4 accent-purple-600" />
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!quizResult && (
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#334155]">
                <button type="button" onClick={() => setActiveQuizModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold shadow-md hover:bg-purple-700"
                >
                  Submit Quiz Answers
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
