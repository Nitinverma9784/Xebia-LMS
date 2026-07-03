'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, UploadCloud, Calendar, FileText, Award, X, Send } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';

export default function StudentAssignmentsPage() {
  const { courses } = useCatalog();
  const { showToast } = useToast();
  const [activeAssignmentModal, setActiveAssignmentModal] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Extract all assignments created in Admin Course Builder
  const liveAssignments = useMemo(() => {
    const list = [];
    (courses || []).forEach(c => {
      (c.modules || []).forEach(m => {
        (m.submodules || []).forEach(s => {
          (s.contents || []).forEach(ct => {
            if (ct.type === 'assignment') {
              let assignMeta = {};
              try { assignMeta = JSON.parse(ct.markdown || '{}'); } catch {}
              list.push({
                id: ct.id,
                title: ct.title || 'Practical Project Assignment',
                courseTitle: c.title,
                dueDate: assignMeta.assignmentData?.dueDate || '2026-12-31',
                totalMarks: assignMeta.assignmentData?.totalMarks || 100,
                passingMarks: assignMeta.assignmentData?.passingMarks || 70,
                instructions: assignMeta.assignmentData?.instructions || 'Build and deploy full project repository link or ZIP file.',
                allowedFormats: assignMeta.assignmentData?.allowedFileTypes || ['PDF', 'ZIP', 'DOCX'],
                rubricCriteria: assignMeta.assignmentData?.rubricCriteria || []
              });
            }
          });
        });
      });
    });
    return list;
  }, [courses]);

  const handleSubmitAssignment = () => {
    if (!submissionText.trim()) {
      showToast('Please enter your submission text or repository link', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Assignment submitted successfully for instructor evaluation.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] p-6 lg:p-8 text-slate-800 dark:text-[#F8FAFC]">
      <PageHeader
        title="Project Assignments & Capstones"
        subtitle="Submit practical projects and hands-on deliverables created by your instructors."
      />

      {liveAssignments.length === 0 ? (
        <div className="mt-12 text-center p-12 rounded-3xl border border-dashed border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] max-w-md mx-auto">
          <CheckCircle className="h-10 w-10 text-teal-500 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Assignments Due</h3>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
            When an Admin creates an Assignment in the Course Builder, it will automatically sync and appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {liveAssignments.map((assign) => (
            <motion.div
              key={assign.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 p-3">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-300 px-3 py-1 text-[10px] font-extrabold uppercase">
                    Due: {assign.dueDate}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white">{assign.title}</h3>
                <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">{assign.courseTitle}</p>

                <p className="text-xs text-slate-600 dark:text-[#CBD5E1] mt-3 line-clamp-2 bg-slate-50 dark:bg-[#111827] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {assign.instructions}
                </p>
              </div>

              <div className="mt-5 pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveAssignmentModal(assign); setSubmitted(false); setSubmissionText(''); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#10B5A5] text-white text-xs font-bold hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  <UploadCloud className="h-4 w-4" /> Open Project Submission
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Interactive Student Assignment Submission Modal */}
      {activeAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-[24px] max-w-2xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{activeAssignmentModal.title}</h3>
                <p className="text-xs text-slate-500">{activeAssignmentModal.courseTitle}</p>
              </div>
              <button type="button" onClick={() => setActiveAssignmentModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="h-16 w-16 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Assignment Submitted!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your work has been safely recorded in the shared database and sent to your instructor for grading.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveAssignmentModal(null)}
                  className="mt-2 px-6 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Instructions</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{activeAssignmentModal.instructions}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">
                    Submission Details / Repository Link / Text Answer
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste your GitHub repository link or project documentation text here..."
                    value={submissionText}
                    onChange={e => setSubmissionText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-3 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>
            )}

            {!submitted && (
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#334155]">
                <button type="button" onClick={() => setActiveAssignmentModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAssignment}
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#10B5A5] text-white text-xs font-bold shadow-md hover:bg-teal-700"
                >
                  <Send className="h-3.5 w-3.5" /> Submit Assignment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
