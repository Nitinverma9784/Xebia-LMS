import { motion } from 'framer-motion';
import { PlayCircle, FileText, Presentation, FileImage, Link2, AudioLines, Download, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { learningResources } from '@/services/studentMockData';

const iconMap = {
  Video: PlayCircle,
  PDF: FileText,
  PPT: Presentation,
  Doc: FileText,
  Image: FileImage,
  Link: Link2,
  Audio: AudioLines,
};

export default function StudentLearningContentPage() {
  return (
    <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8">
      <PageHeader title="Learning Content" subtitle="Access videos, documents, slides, and bookmarks in one view." />
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {learningResources.map((resource) => {
          const Icon = iconMap[resource.type] || FileText;
          return (
            <motion.div key={resource.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-brand-border/70 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className="rounded-2xl bg-brand-surface p-3">
                  <Icon className="h-5 w-5 text-brand-primary" />
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${resource.completed ? 'bg-accent-teal/10 text-accent-teal' : 'bg-amber-500/10 text-amber-600'}`}>
                  {resource.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-brand-text-primary dark:text-slate-100">{resource.title}</h3>
              <div className="mt-3 flex items-center justify-between text-sm text-brand-text-secondary">
                <span>{resource.type}</span>
                <span>{resource.duration}</span>
              </div>
              <div className="mt-5 flex gap-2">
                <Button size="sm" variant="outline"><Download className="mr-2 h-4 w-4" />Download</Button>
                <Button size="sm">Open <ExternalLink className="ml-2 h-4 w-4" /></Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
