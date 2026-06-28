'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, FolderOpen, HardDrive, Percent, Bell, ArrowUpRight,
  TrendingUp, Calendar, CheckCircle, FileText, ChevronRight, Clock, Plus
} from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { formatFileSize, formatDate, getTechLogoUrl } from '@/utils';
import Button from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import ContentPreviewDrawer from '@/components/builder/ContentPreviewDrawer';

export default function Dashboard() {
  const { courses, categories, students, mediaLibrary, notifications, hydrated } = useCatalog();
  const { showToast } = useToast();
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCourses = courses.filter(c => !c.deletedAt).length;
    const totalCategories = categories.filter(c => !c.deletedAt).length;
    const totalStudents = students.length;
    const totalAssets = mediaLibrary.length;
    
    // Average completion percentage from enrolled students
    const avgCompletion = students.length 
      ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
      : 0;

    return { totalCourses, totalCategories, totalStudents, totalAssets, avgCompletion };
  }, [courses, categories, students, mediaLibrary]);

  // Student Growth mock monthly data (Jan - Jun)
  const growthData = [
    { month: 'Jan', count: 45, x: 50, y: 150 },
    { month: 'Feb', count: 62, x: 130, y: 120 },
    { month: 'Mar', count: 95, x: 210, y: 80 },
    { month: 'Apr', count: 110, x: 290, y: 70 },
    { month: 'May', count: 145, x: 370, y: 40 },
    { month: 'Jun', count: 185, x: 450, y: 15 }
  ];

  // Course Completion mock department data
  const completionData = [
    { dept: 'CSE', rate: 78, height: 120 },
    { dept: 'ECE', rate: 64, height: 100 },
    { dept: 'IT', rate: 82, height: 130 },
    { dept: 'Data Sci', rate: 88, height: 140 },
    { dept: 'AI-ML', rate: 92, height: 148 },
    { dept: 'Software', rate: 71, height: 110 }
  ];

  // Recent 5 Indian student enrollments
  const recentEnrollments = useMemo(() => {
    return [...students]
      .sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate))
      .slice(0, 5);
  }, [students]);

  // Recent 4 media uploads
  const recentUploads = useMemo(() => {
    return [...mediaLibrary]
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 4);
  }, [mediaLibrary]);

  // Recent 4 activity events
  const activityLogs = [
    { id: 1, user: 'Dr. Priya Sharma', action: 'added content to', target: 'Python Masterclass', type: 'upload', time: '10 mins ago' },
    { id: 2, user: 'System Agent', action: 'registered student', target: 'Aarav Sharma', type: 'student', time: '1 hour ago' },
    { id: 3, user: 'Amit Patel', action: 'updated description of', target: 'React Advanced Patterns', type: 'edit', time: '3 hours ago' },
    { id: 4, user: 'Dr. Sarah Chen', action: 'created new course', target: 'DevOps Pipeline Mastery', type: 'create', time: '1 day ago' },
  ];

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
          <p className="text-sm font-medium text-brand-text-secondary">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-brand-background min-h-screen text-brand-text-primary transition-colors duration-200">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Enterprise Dashboard</h1>
          <p className="text-xs lg:text-sm text-brand-text-secondary mt-0.5">Real-time statistics and course catalog operations at Xebia.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/catalog/courses">
            <Button size="sm" variant="outline"><BookOpen className="h-4 w-4 mr-2" /> View Catalog</Button>
          </Link>
          <Link to="/catalog/courses?create=true">
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Course</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: 'Total Enrolled', value: stats.totalStudents, icon: Users, desc: 'Students across batches', color: 'from-blue-500/10 to-indigo-500/10 text-indigo-600' },
          { label: 'Active Courses', value: stats.totalCourses, icon: BookOpen, desc: 'Active in catalog', color: 'from-purple-500/10 to-pink-500/10 text-purple-600' },
          { label: 'Categories', value: stats.totalCategories, icon: FolderOpen, desc: 'Structured streams', color: 'from-amber-500/10 to-orange-500/10 text-amber-600' },
          { label: 'Media Library', value: stats.totalAssets, icon: HardDrive, desc: 'Learning assets in cloud', color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600' },
          { label: 'Avg Progress', value: `${stats.avgCompletion}%`, icon: Percent, desc: 'Course completion rate', color: 'from-rose-500/10 to-red-500/10 text-rose-600' },
          { 
            label: 'Cloud Storage', 
            value: '72.4%', 
            icon: HardDrive, 
            desc: '3.62 GB of 5.0 GB used', 
            color: 'from-teal-500/10 to-brand-primary/10 text-brand-primary dark:text-brand-secondary',
            gauge: true 
          }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-brand-text-secondary dark:text-slate-450 uppercase tracking-wider">{item.label}</span>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color} border border-black/5`}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight">{item.value}</h2>
              {item.gauge ? (
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden my-1">
                  <div className="h-full bg-gradient-to-r from-accent-teal to-brand-primary" style={{ width: '72.4%' }} />
                </div>
              ) : null}
              <p className="text-[10px] text-brand-text-secondary dark:text-slate-450 mt-0.5 line-clamp-1">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student Growth Area Chart */}
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-card flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-brand-primary dark:text-brand-secondary" /> Student Growth</h3>
              <p className="text-xs text-brand-text-secondary">Monthly student signups (Jan - Jun)</p>
            </div>
            <Badge color="blue">+42% Growth</Badge>
          </div>

          {/* SVG Line / Area Chart */}
          <div className="h-48 w-full mt-2 relative">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="15" x2="450" y2="15" stroke="var(--brand-border)" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="50" y1="50" x2="450" y2="50" stroke="var(--brand-border)" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="50" y1="90" x2="450" y2="90" stroke="var(--brand-border)" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="50" y1="130" x2="450" y2="130" stroke="var(--brand-border)" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="50" y1="160" x2="450" y2="160" stroke="var(--brand-border)" strokeWidth="1" />

              {/* Area path */}
              <path
                d="M 50 160 L 50 150 C 70 140, 110 125, 130 120 C 150 115, 190 85, 210 80 C 230 75, 270 72, 290 70 C 310 68, 350 48, 370 40 C 390 32, 430 20, 450 15 L 450 160 Z"
                fill="url(#growthGradient)"
              />

              {/* Line path */}
              <path
                d="M 50 150 C 70 140, 110 125, 130 120 C 150 115, 190 85, 210 80 C 230 75, 270 72, 290 70 C 310 68, 350 48, 370 40 C 390 32, 430 20, 450 15"
                fill="none"
                stroke="var(--brand-primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Interaction Points */}
              {growthData.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredDataPoint === idx ? '6' : '4'}
                    fill="var(--brand-background)"
                    stroke="var(--brand-primary)"
                    strokeWidth="3"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredDataPoint(idx)}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  />
                  {/* Axis labels */}
                  <text x={pt.x} y="175" textAnchor="middle" fontSize="10" fill="var(--text-secondary)" className="font-semibold">{pt.month}</text>
                </g>
              ))}
            </svg>

            {/* Interactive Tooltip Overlay */}
            {hoveredDataPoint !== null && (
              <div
                className="absolute bg-white dark:bg-slate-900 border border-brand-border px-2.5 py-1 rounded-xl shadow-modal text-xs font-semibold"
                style={{
                  left: `${(growthData[hoveredDataPoint].x / 500) * 100}%`,
                  top: `${(growthData[hoveredDataPoint].y / 180) * 100 - 30}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                {growthData[hoveredDataPoint].count} Students
              </div>
            )}
          </div>
        </div>

        {/* Course Completion Rates Bar Chart */}
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-card flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-brand-success" /> Completion Rate</h3>
              <p className="text-xs text-brand-text-secondary">Average completion % by stream</p>
            </div>
            <Badge color="green">High Performers</Badge>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-48 w-full mt-2">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="15" x2="470" y2="15" stroke="var(--brand-border)" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="40" y1="55" x2="470" y2="55" stroke="var(--brand-border)" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="40" y1="95" x2="470" y2="95" stroke="var(--brand-border)" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="40" y1="135" x2="470" y2="135" stroke="var(--brand-border)" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="40" y1="160" x2="470" y2="160" stroke="var(--brand-border)" strokeWidth="1" />

              {/* Bars rendering */}
              {completionData.map((pt, idx) => {
                const xPos = 65 + idx * 68;
                const barHeight = pt.height;
                const yPos = 160 - barHeight;

                return (
                  <g key={idx} className="group">
                    {/* Background Bar track */}
                    <rect x={xPos - 12} y="15" width="24" height="145" fill="var(--brand-border)" opacity="0.15" rx="6" />

                    {/* Value Bar with gradient fill */}
                    <defs>
                      <linearGradient id={`barGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#01AC9F" />
                        <stop offset="100%" stopColor="#6C1D5F" />
                      </linearGradient>
                    </defs>
                    <rect
                      x={xPos - 12}
                      y={yPos}
                      width="24"
                      height={barHeight}
                      fill={`url(#barGrad-${idx})`}
                      rx="6"
                      className="transition-all duration-300 hover:brightness-105 cursor-pointer"
                    />

                    {/* Rate text */}
                    <text x={xPos} y={yPos - 6} textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--text-primary)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      {pt.rate}%
                    </text>

                    {/* Label */}
                    <text x={xPos} y="175" textAnchor="middle" fontSize="10" fill="var(--text-secondary)" className="font-semibold">{pt.dept}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Dynamic Data & Activity Feeds */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left: Recent Enrollments (2 columns inside feed grid) */}
        <div className="xl:col-span-2 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-card space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold">Recent Indian Enrollments</h3>
              <p className="text-xs text-brand-text-secondary">Latest students registered in system</p>
            </div>
            <Link to="/catalog/courses">
              <Button size="xs" variant="outline">View All <ArrowUpRight className="h-3 w-3 ml-1" /></Button>
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-background">
            <table className="w-full text-xs">
              <thead className="bg-brand-surface border-b border-brand-border text-left font-semibold">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Location & Phone</th>
                  <th className="px-4 py-3">Batch & Dept</th>
                  <th className="px-4 py-3 text-center">Progress</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.map((student) => (
                  <tr key={student.id} className="border-b border-brand-border last:border-0 hover:bg-brand-surface/40 transition-colors">
                    <td className="px-4 py-3 font-semibold">
                      <div className="flex items-center gap-2.5">
                        <img src={student.avatar} alt="" className="h-8 w-8 rounded-full border border-brand-border bg-brand-surface" />
                        <div>
                          <p className="font-semibold">{student.fullName}</p>
                          <p className="text-[10px] text-brand-text-secondary truncate max-w-[120px]">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-text-secondary">
                      <p className="font-medium text-brand-text-primary">{student.city}</p>
                      <p className="text-[10px]">{student.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-primary dark:text-brand-secondary">{student.department}</p>
                      <p className="text-[10px] text-brand-text-secondary">{student.batch}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-brand-border overflow-hidden">
                          <div className="h-full bg-brand-success" style={{ width: `${student.progress}%` }} />
                        </div>
                        <span className="font-bold">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-brand-text-secondary font-medium">
                      {formatDate(student.enrollmentDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Activity & Recent Notifications feed (1 column) */}
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-card space-y-5">
          <div>
            <h3 className="text-base font-bold">Audit Log & Timeline</h3>
            <p className="text-xs text-brand-text-secondary">Live events track</p>
          </div>

          <div className="relative border-l border-brand-border ml-2 pl-4 space-y-4 text-xs">
            {activityLogs.map((log) => (
              <div key={log.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-brand-background bg-brand-primary" />
                
                <div className="bg-brand-background p-3 rounded-xl border border-brand-border hover:shadow-sm transition-all">
                  <p className="text-brand-text-secondary">
                    <span className="font-semibold text-brand-text-primary">{log.user}</span> {log.action}{' '}
                    <span className="font-semibold text-brand-primary dark:text-brand-secondary">{log.target}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-brand-text-secondary">
                    <Clock className="h-3 w-3" />
                    <span>{log.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid for Media Uploads and Quick Shortcuts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Media Assets */}
        <div className="lg:col-span-2 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-card space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold">Recent Uploads</h3>
              <p className="text-xs text-brand-text-secondary">Quick access to media assets</p>
            </div>
            <Link to="/catalog/media">
              <Button size="xs" variant="outline">Media Library <ArrowUpRight className="h-3 w-3 ml-1" /></Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {recentUploads.map((file) => (
              <div
                key={file.id}
                className="group relative rounded-xl border border-brand-border bg-brand-background p-4 hover:shadow-card-hover transition-all flex items-start gap-3 cursor-pointer"
                onClick={() => setPreviewFile(file)}
              >
                {/* Thumbnail Preview Area */}
                <div className="h-12 w-12 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center shrink-0 overflow-hidden relative">
                  {file.type === 'video' ? (
                    <div className="w-full h-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-[10px] uppercase">MP4</div>
                  ) : file.type === 'pdf' ? (
                    <div className="w-full h-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-[10px] uppercase">PDF</div>
                  ) : file.type === 'ppt' ? (
                    <div className="w-full h-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-[10px] uppercase">PPT</div>
                  ) : (
                    <div className="w-full h-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-[10px] uppercase">DOC</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold truncate text-xs">{file.title}</h4>
                  <p className="text-[10px] text-brand-text-secondary truncate mt-0.5">{file.courseName}</p>
                  <div className="mt-1 flex items-center justify-between text-[9px] text-brand-text-secondary">
                    <Badge color="purple">{file.type}</Badge>
                    <span>{formatFileSize(file.fileSize)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Utilities & Technology list */}
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-card space-y-4">
          <div>
            <h3 className="text-base font-bold">Technology Matrix</h3>
            <p className="text-xs text-brand-text-secondary">Core courses by topic</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {['Python', 'Java', 'JavaScript', 'React', 'AI', 'DevOps', 'AWS', 'Azure'].map((tech) => (
              <div
                key={tech}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-brand-border bg-brand-background hover:bg-brand-surface/40 transition-colors cursor-pointer"
                onClick={() => showToast(`Opening catalog filter for: ${tech}`, 'info')}
              >
                <img src={getTechLogoUrl(tech)} alt="" className="h-5 w-5 object-contain" />
                <span className="font-semibold text-brand-text-primary truncate">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Content Preview Drawer */}
      <ContentPreviewDrawer content={previewFile} open={!!previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
