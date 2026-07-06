import React, { useEffect, useState } from 'react';
import { FileText, Users, CheckCircle, Clock, Zap, TrendingUp } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { StatCard } from '../../components/ui/Card';
import { StatCardSkeleton } from '../../components/shared/LoadingSkeleton';
import { teacherService } from '../../services/teacher.service';
import { useAuth } from '../../contexts/AuthContext';
import type { DashboardStats } from '../../types';

export const TeacherDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    teacherService.getDashboardStats()
      .then((res) => setStats(res.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { title: 'Total Assignments', value: stats.totalAssignments, icon: <FileText size={20} />, color: 'purple' as const },
    { title: 'Active Assignments', value: stats.activeAssignments, icon: <Zap size={20} />, color: 'teal' as const },
    { title: 'Submitted', value: stats.submittedAssignments, icon: <CheckCircle size={20} />, color: 'green' as const },
    { title: 'Pending Review', value: stats.pendingAssignments, icon: <Clock size={20} />, color: 'amber' as const },
    { title: 'Total Students', value: stats.totalStudents, icon: <Users size={20} />, color: 'blue' as const },
  ] : [];

  return (
    <Layout role="teacher" title="Dashboard" subtitle={`Good day, ${user?.name?.split(' ')[0]}!`}>
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#6C1D5F] via-[#511345] to-[#84117C] rounded-2xl p-6 mb-6 text-white">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-[#01AC9F]/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-[#01AC9F]" />
            <span className="text-[#01AC9F] text-sm font-medium">Overview</span>
          </div>
          <h2 className="text-xl font-bold mb-1">Welcome to your Teacher Portal</h2>
          <p className="text-white/70 text-sm">
            Manage assignments, grade submissions, and track student progress all in one place.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          : cards.map((c) => (
              <StatCard key={c.title} title={c.title} value={c.value} icon={c.icon} color={c.color} />
            ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6C1D5F]" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <a href="/teacher/assignments/create" className="flex items-center gap-3 p-3 rounded-xl border border-[var(--brand-border)] hover:border-[#6C1D5F] hover:bg-[#6C1D5F08] transition-all group">
              <div className="w-8 h-8 rounded-lg bg-[#6C1D5F] flex items-center justify-center">
                <FileText size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#6C1D5F]">Create New Assignment</p>
                <p className="text-xs text-[var(--text-secondary)]">Publish or save as draft</p>
              </div>
            </a>
            <a href="/teacher/submitted" className="flex items-center gap-3 p-3 rounded-xl border border-[var(--brand-border)] hover:border-[#01AC9F] hover:bg-[#01AC9F08] transition-all group">
              <div className="w-8 h-8 rounded-lg bg-[#01AC9F] flex items-center justify-center">
                <CheckCircle size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#01AC9F]">Review Submissions</p>
                <p className="text-xs text-[var(--text-secondary)]">Grade pending submissions</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#01AC9F]" />
            Overview Summary
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="skeleton h-3 w-32 rounded" />
                  <div className="skeleton h-3 w-10 rounded" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-3">
              {[
                { label: 'Completion Rate', value: stats.totalAssignments > 0
                    ? `${Math.round((stats.submittedAssignments / (stats.totalAssignments * Math.max(stats.totalStudents, 1))) * 100)}%`
                    : '0%', color: 'text-[#01AC9F]' },
                { label: 'Assignments Published', value: `${stats.activeAssignments}/${stats.totalAssignments}`, color: 'text-[#6C1D5F] dark:text-purple-300' },
                { label: 'Pending to Review', value: stats.pendingAssignments, color: 'text-amber-500' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-[var(--brand-border)] last:border-0">
                  <span className="text-sm text-[var(--text-secondary)]">{row.label}</span>
                  <span className={`text-sm font-semibold ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
};
