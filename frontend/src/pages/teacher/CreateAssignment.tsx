import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Upload, X, AlertCircle, ArrowLeft, ChevronDown, Search } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { SubjectSelector } from '../../components/shared/SubjectSelector';
import { teacherService } from '../../services/teacher.service';
import { getFileIcon } from '../../utils/helpers';
import { useAppDispatch, useAppSelector } from '../../store';
import { getAllBatches } from '../../store/batchSlice';
import type { Question } from '../../types';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructions: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  maxMarks: z.string().min(1, 'Marks are required').refine((v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 1000, 'Marks must be between 1 and 1000'),
  batchId: z.string().min(1, 'Batch selection is required'),
});

type FormData = z.infer<typeof schema>;

export const CreateAssignment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = window.location.search ? new URLSearchParams(window.location.search) as any : useSearchParams();
  const forcedType = searchParams?.get('type')?.toUpperCase(); // 'PDF' or 'QUIZ'

  const { batches } = useAppSelector((state) => state.batch);

  const [loading, setLoading] = useState(false);
  
  // Tab State: Standard vs Quiz
  const [assignmentType, setAssignmentType] = useState<'PDF' | 'QUIZ'>(
    forcedType === 'QUIZ' ? 'QUIZ' : forcedType === 'PDF' ? 'PDF' : 'PDF'
  );

  useEffect(() => {
    if (forcedType === 'QUIZ') {
      setAssignmentType('QUIZ');
    } else if (forcedType === 'PDF') {
      setAssignmentType('PDF');
    }
  }, [forcedType]);
  
  // Standard uploader states
  const [attachment, setAttachment] = useState<File | null>(null);
  const [existingAttachment, setExistingAttachment] = useState<string | null>(null);
  const [existingAttachmentName, setExistingAttachmentName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Quiz Excel importer states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [isExcelDragging, setIsExcelDragging] = useState(false);
  const excelRef = useRef<HTMLInputElement>(null);

  // Searchable Batch Dropdown states
  const [batchSearch, setBatchSearch] = useState('');
  const [batchOpen, setBatchOpen] = useState(false);
  const [selectedBatchName, setSelectedBatchName] = useState('');

  const { register, handleSubmit, setValue, watch, reset, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { maxMarks: '100', batchId: '' },
  });

  const watchBatchId = watch('batchId');

  // Fetch batches on mount
  useEffect(() => {
    dispatch(getAllBatches());
  }, [dispatch]);

  // Load assignment detail if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      teacherService.getAssignmentById(id)
        .then((res) => {
          reset({
            title: res.title,
            subject: res.subject,
            topic: res.topic || '',
            description: res.description,
            instructions: res.instructions,
            dueDate: res.dueDate,
            maxMarks: String(res.maxMarks),
            batchId: String(res.batchId || ''),
          });
          if (res.batchName) {
            setSelectedBatchName(res.batchName);
          }
          if (res.attachment) {
            setExistingAttachment(res.attachment);
            setExistingAttachmentName(res.attachmentName || 'attachment');
          }
          if (res.assignmentType) {
            setAssignmentType(res.assignmentType as any);
          }
          if (res.questions) {
            setQuestions(res.questions);
          }
        })
        .catch(() => toast.error('Failed to load assignment details'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, reset]);

  // Sync selectedBatchName when batches load or watchBatchId changes
  useEffect(() => {
    if (watchBatchId && batches.length > 0) {
      const found = batches.find((b) => String(b.id) === watchBatchId);
      if (found) {
        setSelectedBatchName(found.batchName);
      }
    }
  }, [watchBatchId, batches]);

  // Sync total marks dynamically based on quiz questions
  useEffect(() => {
    if (assignmentType === 'QUIZ') {
      const sum = questions.reduce((s, q) => s + Number(q.marks), 0);
      setValue('maxMarks', String(sum || 0));
    }
  }, [questions, assignmentType, setValue]);

  // Standard File drop zone handler
  const handleFile = (file: File) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/x-zip-compressed', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      toast.error('Invalid file type. Allowed: PDF, DOC, DOCX, ZIP, JPG, PNG');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File too large. Maximum 25MB allowed.');
      return;
    }
    setAttachment(file);
    setExistingAttachment(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  // Excel file drop zone handler
  const handleExcelFile = async (file: File) => {
    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!allowed.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Invalid file type. Please upload an Excel file (.xlsx or .xls).');
      return;
    }
    setLoading(true);
    try {
      const res = await teacherService.importExcel(file);
      const imported = res.data || [];
      setQuestions(imported);
      toast.success(`Successfully imported ${imported.length} questions!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to import Excel file.');
    } finally {
      setLoading(false);
    }
  };

  const onExcelDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsExcelDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleExcelFile(file);
  }, []);

  const onSubmit = async (data: FormData, status: 'draft' | 'published') => {
    if (assignmentType === 'QUIZ' && questions.length === 0) {
      toast.error('Please import or add at least one question for the quiz.');
      return;
    }
    const finalMaxMarks = assignmentType === 'QUIZ' 
      ? questions.reduce((sum, q) => sum + Number(q.marks), 0)
      : Number(data.maxMarks);

    try {
      if (isEdit && id) {
        await teacherService.updateAssignment(id, {
          title: data.title,
          subject: data.subject,
          topic: data.topic || '',
          description: data.description,
          instructions: data.instructions,
          dueDate: data.dueDate,
          maxMarks: finalMaxMarks,
          status,
          batchId: data.batchId,
          attachment: assignmentType === 'PDF' ? (attachment || undefined) : undefined,
          assignmentType,
          questions: assignmentType === 'QUIZ' ? questions : undefined,
        });
        toast.success('Assignment updated successfully!');
      } else {
        await teacherService.createAssignment({
          title: data.title,
          subject: data.subject,
          topic: data.topic || '',
          description: data.description,
          instructions: data.instructions,
          dueDate: data.dueDate,
          maxMarks: finalMaxMarks,
          status,
          batchId: data.batchId,
          attachment: assignmentType === 'PDF' ? (attachment || undefined) : undefined,
          assignmentType,
          questions: assignmentType === 'QUIZ' ? questions : undefined,
        });
        toast.success(status === 'published' ? 'Assignment published!' : 'Assignment saved as draft!');
      }
      navigate(assignmentType === 'QUIZ' ? '/teacher/quizzes' : '/teacher/assignments');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save assignment.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const filteredBatches = batches.filter((b) =>
    b.batchName.toLowerCase().includes(batchSearch.toLowerCase())
  );

  if (loading) {
    return (
      <Layout role="teacher" title={isEdit ? 'Edit Assignment' : 'Create Assignment'}>
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl p-5 space-y-3">
            <div className="skeleton h-5 w-1/2 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-3/4 rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  const pageTitle = assignmentType === 'QUIZ'
    ? (isEdit ? 'Edit Quiz' : 'Create Quiz')
    : (isEdit ? 'Edit Assignment' : 'Create Assignment');

  const backLabel = assignmentType === 'QUIZ' ? 'Back to Quizzes' : 'Back to Assignments';

  return (
    <Layout role="teacher" title={pageTitle} subtitle="Fill in the details below">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(assignmentType === 'QUIZ' ? '/teacher/quizzes' : '/teacher/assignments')}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} /> {backLabel}
        </button>

        {/* Tab Selector */}
        {!forcedType && (
          <div className="flex gap-4 p-1.5 bg-slate-100 dark:bg-slate-800/60 border border-[var(--brand-border)] rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setAssignmentType('PDF')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                assignmentType === 'PDF'
                  ? 'bg-[#6C1D5F] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Standard Assignment (File)
            </button>
            <button
              type="button"
              onClick={() => setAssignmentType('QUIZ')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                assignmentType === 'QUIZ'
                  ? 'bg-[#6C1D5F] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Quiz Assignment (Excel Import)
            </button>
          </div>
        )}

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <Card>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--brand-border)]">
              Basic Information
            </h3>
            <div className="space-y-4">
              <Input label="Assignment Title" placeholder="e.g. Chapter 5 — Newton's Laws" required error={errors.title?.message} {...register('title')} />
              <Input label="Topic" placeholder="e.g. Laws of Motion" error={errors.topic?.message} {...register('topic')} />
              
              {/* Searchable Batch Dropdown */}
              <div className="relative">
                <label className="text-sm font-medium text-[var(--text-primary)]">
                  Batch <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => setBatchOpen(!batchOpen)}
                    className="w-full bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] focus:border-[#6C1D5F] text-[var(--text-primary)] rounded-xl py-2.5 px-3.5 text-left text-sm flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{selectedBatchName || 'Select a batch'}</span>
                    <ChevronDown size={16} className="text-[var(--text-secondary)] shrink-0" />
                  </button>
                </div>
                {batchOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl shadow-lg p-2 space-y-2">
                    {batches.length > 5 && (
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                        <input
                          type="text"
                          placeholder="Search batch..."
                          value={batchSearch}
                          onChange={(e) => setBatchSearch(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-[var(--brand-border)] focus:border-[#6C1D5F] rounded-lg py-1.5 pl-8 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-colors"
                        />
                      </div>
                    )}
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredBatches.length === 0 ? (
                        <p className="text-xs text-[var(--text-secondary)] text-center py-2">No batches found</p>
                      ) : (
                        filteredBatches.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setValue('batchId', String(b.id));
                              setSelectedBatchName(b.batchName);
                              setBatchOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                              watchBatchId === String(b.id) ? 'bg-[#6C1D5F10] text-[#6C1D5F] font-semibold' : 'text-[var(--text-primary)]'
                            }`}
                          >
                            {b.batchName}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {errors.batchId?.message && <p className="text-xs text-red-500 mt-1">{errors.batchId.message}</p>}
              </div>

              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <SubjectSelector
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.subject?.message}
                    required
                  />
                )}
              />
              <Textarea
                label="Description"
                placeholder="Describe what this assignment is about..."
                required
                rows={4}
                error={errors.description?.message}
                {...register('description')}
              />
              <Textarea
                label="Instructions (Optional)"
                placeholder="Detailed instructions for students..."
                rows={3}
                error={errors.instructions?.message}
                {...register('instructions')}
              />
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--brand-border)]">
              Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Due Date"
                type="date"
                required
                min={today}
                error={errors.dueDate?.message}
                {...register('dueDate')}
              />
              <Input
                label="Maximum Marks"
                type="number"
                min={1}
                max={1000}
                required
                disabled={assignmentType === 'QUIZ'}
                error={errors.maxMarks?.message}
                {...register('maxMarks')}
              />
            </div>
            {assignmentType === 'QUIZ' && (
              <p className="text-[11px] text-[var(--text-secondary)] mt-2 italic">
                * Maximum marks is automatically calculated as the sum of quiz question points.
              </p>
            )}
          </Card>

          {/* Conditional Layout: standard file upload vs quiz builder */}
          {assignmentType === 'PDF' ? (
            <Card>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--brand-border)]">
                Attachment (Optional)
              </h3>

              {attachment ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-200 dark:border-purple-500/20">
                  <span className="text-2xl">{getFileIcon(attachment.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{attachment.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{(attachment.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : existingAttachment ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-500/5 border border-teal-200 dark:border-teal-500/20">
                  <span className="text-2xl">{getFileIcon(existingAttachmentName || '')}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{existingAttachmentName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Currently uploaded resource</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExistingAttachment(null)}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  className={`drop-zone ${isDragging ? 'dragging' : ''} p-8 text-center cursor-pointer`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                    <Upload size={22} className="text-[#6C1D5F] dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Drop file here or <span className="text-[#6C1D5F] dark:text-purple-400">browse</span>
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">PDF, DOC, DOCX, ZIP, JPG, PNG · Max 25MB</p>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                    onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                  />
                </div>
              )}
            </Card>
          ) : (
            <>
              {/* Excel Import Drag and Drop */}
              <Card>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--brand-border)]">
                  Import from Excel
                </h3>
                <div
                  className={`drop-zone ${isExcelDragging ? 'dragging' : ''} p-8 text-center cursor-pointer`}
                  onDragOver={(e) => { e.preventDefault(); setIsExcelDragging(true); }}
                  onDragLeave={() => setIsExcelDragging(false)}
                  onDrop={onExcelDrop}
                  onClick={() => excelRef.current?.click()}
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-3">
                    <Upload size={22} className="text-[#01AC9F]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Drop Excel template here or <span className="text-[#01AC9F]">browse</span>
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Accepts Excel Spreadsheets (.xlsx, .xls) · Max 10MB</p>
                  <input
                    ref={excelRef}
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={(e) => { if (e.target.files?.[0]) handleExcelFile(e.target.files[0]); }}
                  />
                </div>
              </Card>

              {/* Questions Preview Table */}
              <Card>
                <div className="flex items-center justify-between pb-3 border-b border-[var(--brand-border)] mb-4">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Quiz Questions ({questions.length})</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingQuestion({
                        questionText: '',
                        optionA: '',
                        optionB: '',
                        optionC: '',
                        optionD: '',
                        correctAnswer: 'A',
                        marks: 2,
                        difficulty: 'Medium',
                        questionType: 'MCQ'
                      });
                      setEditingQuestionIndex(null);
                    }}
                  >
                    Add Question
                  </Button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-[var(--brand-border)] rounded-2xl">
                    <p className="text-sm text-[var(--text-secondary)]">No questions imported yet.</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Upload an Excel file above or click Add Question to start building your quiz.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {questions.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-[var(--brand-border)] bg-slate-50/50 dark:bg-slate-800/20 relative group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              {idx + 1}. {q.questionText}
                            </p>
                            
                            {/* Options */}
                            {q.questionType !== 'SHORT_ANSWER' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                <p className={`text-xs p-2 rounded-lg border ${q.correctAnswer === 'A' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium' : 'border-[var(--brand-border)] text-[var(--text-secondary)]'}`}>
                                  <strong>A:</strong> {q.optionA}
                                </p>
                                <p className={`text-xs p-2 rounded-lg border ${q.correctAnswer === 'B' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium' : 'border-[var(--brand-border)] text-[var(--text-secondary)]'}`}>
                                  <strong>B:</strong> {q.optionB}
                                </p>
                                {q.optionC && (
                                  <p className={`text-xs p-2 rounded-lg border ${q.correctAnswer === 'C' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium' : 'border-[var(--brand-border)] text-[var(--text-secondary)]'}`}>
                                    <strong>C:</strong> {q.optionC}
                                  </p>
                                )}
                                {q.optionD && (
                                  <p className={`text-xs p-2 rounded-lg border ${q.correctAnswer === 'D' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium' : 'border-[var(--brand-border)] text-[var(--text-secondary)]'}`}>
                                    <strong>D:</strong> {q.optionD}
                                  </p>
                                )}
                              </div>
                            )}
                            {q.questionType === 'SHORT_ANSWER' && (
                              <p className="text-xs text-[var(--text-secondary)] mt-2">
                                Correct Answer: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{q.correctAnswer}</span>
                              </p>
                            )}
                            
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--brand-border)]">
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                {q.marks} Marks
                              </span>
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                                q.difficulty?.toLowerCase() === 'easy' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                q.difficulty?.toLowerCase() === 'hard' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                              }`}>
                                {q.difficulty}
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                {q.questionType || 'MCQ'}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1 items-end shrink-0">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuestion(q);
                                  setEditingQuestionIndex(idx);
                                }}
                                className="p-1 text-[#01AC9F] hover:bg-[#01AC9F]/10 rounded transition-colors cursor-pointer text-xs font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...questions];
                                  next.splice(idx, 1);
                                  setQuestions(next);
                                }}
                                className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer text-xs font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                            
                            {/* Reordering */}
                            <div className="flex gap-1 mt-2">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  if (idx === 0) return;
                                  const next = [...questions];
                                  const temp = next[idx];
                                  next[idx] = next[idx - 1];
                                  next[idx - 1] = temp;
                                  setQuestions(next);
                                }}
                                className="p-1.5 border border-[var(--brand-border)] text-[var(--text-secondary)] disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer text-xs"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={idx === questions.length - 1}
                                onClick={() => {
                                  if (idx === questions.length - 1) return;
                                  const next = [...questions];
                                  const temp = next[idx];
                                  next[idx] = next[idx + 1];
                                  next[idx + 1] = temp;
                                  setQuestions(next);
                                }}
                                className="p-1.5 border border-[var(--brand-border)] text-[var(--text-secondary)] disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer text-xs"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          <div className="flex items-center gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              loading={isSubmitting}
              onClick={() => handleSubmit((d: FormData) => onSubmit(d, 'draft'))()}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              onClick={() => handleSubmit((d: FormData) => onSubmit(d, 'published'))()} 
            >
              {isEdit ? 'Save Changes' : 'Publish Assignment'}
            </Button>
          </div>
        </form>
      </div>

      {/* Edit/Add Question Modal */}
      <Modal
        isOpen={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        title={editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingQuestion(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!editingQuestion || !editingQuestion.questionText) {
                  toast.error('Question text is required.');
                  return;
                }
                const next = [...questions];
                if (editingQuestionIndex !== null) {
                  next[editingQuestionIndex] = editingQuestion;
                } else {
                  next.push(editingQuestion);
                }
                setQuestions(next);
                setEditingQuestion(null);
                setEditingQuestionIndex(null);
              }}
            >
              Save Question
            </Button>
          </>
        }
      >
        {editingQuestion && (
          <div className="space-y-4">
            <Select
              label="Question Type"
              value={editingQuestion.questionType || 'MCQ'}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, questionType: e.target.value })}
              options={[
                { value: 'MCQ', label: 'Multiple Choice (MCQ)' },
                { value: 'TRUE_FALSE', label: 'True / False' },
                { value: 'SHORT_ANSWER', label: 'Short Answer' },
              ]}
            />
            
            <Textarea
              label="Question Text"
              value={editingQuestion.questionText}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
              placeholder="Enter question text..."
              rows={3}
              required
            />

            {editingQuestion.questionType !== 'SHORT_ANSWER' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Option A"
                    value={editingQuestion.optionA}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, optionA: e.target.value })}
                    required
                  />
                  <Input
                    label="Option B"
                    value={editingQuestion.optionB}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, optionB: e.target.value })}
                    required
                  />
                </div>
                {editingQuestion.questionType === 'MCQ' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Option C"
                      value={editingQuestion.optionC || ''}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, optionC: e.target.value })}
                    />
                    <Input
                      label="Option D"
                      value={editingQuestion.optionD || ''}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, optionD: e.target.value })}
                    />
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1">Correct Answer</label>
                {editingQuestion.questionType === 'SHORT_ANSWER' ? (
                  <Input
                    value={editingQuestion.correctAnswer || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                    placeholder="Correct answer"
                    required
                  />
                ) : (
                  <Select
                    value={editingQuestion.correctAnswer || 'A'}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                    options={
                      editingQuestion.questionType === 'TRUE_FALSE' ? [
                        { value: 'True', label: 'True' },
                        { value: 'False', label: 'False' },
                      ] : [
                        { value: 'A', label: 'Option A' },
                        { value: 'B', label: 'Option B' },
                        { value: 'C', label: 'Option C' },
                        { value: 'D', label: 'Option D' },
                      ]
                    }
                  />
                )}
              </div>
              <Input
                label="Marks"
                type="number"
                min={0.5}
                max={100}
                step={0.5}
                value={String(editingQuestion.marks)}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, marks: Number(e.target.value) })}
                required
              />
              <Select
                label="Difficulty"
                value={editingQuestion.difficulty || 'Medium'}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                options={[
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
