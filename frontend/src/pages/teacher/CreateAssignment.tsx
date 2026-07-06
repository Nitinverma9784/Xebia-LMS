import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Upload, X, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { teacherService } from '../../services/teacher.service';
import { getFileIcon } from '../../utils/helpers';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'English', 'History', 'Geography', 'Economics', 'Other',
].map((s) => ({ value: s, label: s }));

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructions: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  maxMarks: z.string().min(1, 'Marks are required').refine((v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 1000, 'Marks must be between 1 and 1000'),
});

type FormData = z.infer<typeof schema>;

export const CreateAssignment: React.FC = () => {
  const navigate = useNavigate();
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { maxMarks: '100' },
  });

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
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onSubmit = async (data: FormData, status: 'draft' | 'published') => {
    try {
      await teacherService.createAssignment({ ...data, maxMarks: Number(data.maxMarks), status, attachment: attachment || undefined });
      toast.success(status === 'published' ? 'Assignment published!' : 'Assignment saved as draft!');
      navigate('/teacher/assignments');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create assignment.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Layout role="teacher" title="Create Assignment" subtitle="Fill in the details below">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} /> Back to Assignments
        </button>

        <form className="space-y-5">
          <Card>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--brand-border)]">
              Basic Information
            </h3>
            <div className="space-y-4">
              <Input label="Assignment Title" placeholder="e.g. Chapter 5 — Newton's Laws" required error={errors.title?.message} {...register('title')} />
              <Select label="Subject" options={SUBJECTS} placeholder="Select a subject" required error={errors.subject?.message} {...register('subject')} />
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
                error={errors.maxMarks?.message}
                {...register('maxMarks')}
              />
            </div>
          </Card>

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
              Publish Assignment
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
