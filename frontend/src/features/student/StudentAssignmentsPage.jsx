import { motion } from 'framer-motion';
import { FileUp, Eye, Download, RefreshCcw, MessageSquareQuote, Search } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { assignments } from '@/services/studentMockData';

export default function StudentAssignmentsPage() {
  return (
    <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8">
      <PageHeader title="Assignments" subtitle="Track submissions, feedback, and due dates from one place." />
      <div className="mt-6 flex items-center gap-3 rounded-3xl border border-brand-border/70 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <Search className="h-4 w-4 text-brand-text-secondary" />
        <input placeholder="Search assignments" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="mt-6 overflow-hidden rounded-3xl border border-brand-border/70 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-brand-surface/80 text-xs uppercase tracking-wide text-brand-text-secondary">
            <tr>
              <th className="px-4 py-3">Assignment</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Marks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="border-t border-brand-border/70 text-brand-text-primary">
                <td className="px-4 py-4 font-semibold">{assignment.name}</td>
                <td className="px-4 py-4">{assignment.course}</td>
                <td className="px-4 py-4">{assignment.dueDate}</td>
                <td className="px-4 py-4">{assignment.marks}</td>
                <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${assignment.status === 'Graded' ? 'bg-accent-teal/10 text-accent-teal' : assignment.status === 'Submitted' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-amber-500/10 text-amber-600'}`}>{assignment.status}</span></td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline"><Eye className="mr-2 h-4 w-4" />View</Button>
                    <Button size="sm" variant="outline"><Download className="mr-2 h-4 w-4" />Question</Button>
                    <Button size="sm"><FileUp className="mr-2 h-4 w-4" />Upload</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
