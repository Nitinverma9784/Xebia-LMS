'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, FolderOpen, HardDrive, Percent, ArrowUpRight,
  TrendingUp, Calendar, CheckCircle, Clock, Plus, BarChart2,
  Filter, Award, Download, Zap, Brain, Shield, ChevronDown
} from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';

export default function Dashboard() {
  const { showToast } = useToast();
  
  // Tab states
  const [activeTab, setActiveTab] = useState('summary');

  // Filter states
  const [filters, setFilters] = useState({
    year: '2026',
    quarter: 'all',
    region: 'all',
    location: 'all',
    businessUnit: 'all',
    department: 'all',
    practice: 'all',
    employeeGrade: 'all',
  });

  // Data states
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard metrics
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      Object.keys(filters).forEach(k => {
        if (filters[k] !== 'all') {
          params[k] = filters[k];
        }
      });
      const response = await api.get('/analytics/dashboard', { params });
      setData(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Could not connect to Spring Boot backend. Please check the backend console.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // CSV Export logic
  const handleExportCSV = () => {
    if (!data) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `Xebia_LMS_${activeTab}_Report.csv`;
    
    if (activeTab === 'summary') {
      const s = data.executiveSummary;
      csvContent += "Metric,Value\n";
      csvContent += `Total Employees,${s.totalEmployees}\n`;
      csvContent += `Employees Nominated,${s.employeesNominated}\n`;
      csvContent += `Employees Trained,${s.employeesTrained}\n`;
      csvContent += `Learning Coverage %,${s.learningCoveragePct}%\n`;
      csvContent += `Sessions Conducted,${s.totalSessionsConducted}\n`;
      csvContent += `Learning Hours,${s.totalLearningHours}\n`;
      csvContent += `Certifications Completed,${s.totalCertificationsCompleted}\n`;
      csvContent += `AI Trained,${s.employeesTrainedInAI}\n`;
    } else if (activeTab === 'coverage') {
      csvContent += "Dimension,Name,Coverage %\n";
      Object.entries(data.learningCoverage.regionCoverage).forEach(([k, v]) => {
        csvContent += `Region,${k},${v}%\n`;
      });
      Object.entries(data.learningCoverage.locationCoverage).forEach(([k, v]) => {
        csvContent += `Location,${k},${v}%\n`;
      });
      Object.entries(data.learningCoverage.gradeCoverage).forEach(([k, v]) => {
        csvContent += `Grade,${k},${v}%\n`;
      });
    } else if (activeTab === 'hours') {
      csvContent += "Learner Name,Total Hours\n";
      data.learningHoursAnalytics.topLearners.forEach(l => {
        csvContent += `"${l.name}",${l.hours}\n`;
      });
    } else if (activeTab === 'pillars') {
      csvContent += "Pillar Name,Hours,Trained Employees\n";
      data.learningPillars.forEach(p => {
        csvContent += `"${p.pillar}",${p.hours},${p.trained}\n`;
      });
    } else if (activeTab === 'ai') {
      const ai = data.aiTransformation;
      csvContent += "AI Metric,Value\n";
      csvContent += `AI Readiness Index,${ai.aiReadinessIndex}%\n`;
      csvContent += `Trained on AI,${ai.employeesTrainedOnAI}\n`;
      csvContent += `Certified on AI,${ai.employeesCertifiedOnAI}\n`;
      csvContent += `AI Learning Hours,${ai.aiLearningHours}\n`;
    } else if (activeTab === 'certifications') {
      csvContent += "Technology,Completed Certifications\n";
      Object.entries(data.certificationTracker.certificationsByTechnology).forEach(([k, v]) => {
        csvContent += `"${k}",${v}\n`;
      });
    } else if (activeTab === 'flagship') {
      csvContent += "Program Name,Participants,Hours,Feedback Rating\n";
      data.flagshipPrograms.forEach(p => {
        csvContent += `"${p.program}",${p.participants},${p.learningHours},${p.feedback}\n`;
      });
    } else if (activeTab === 'trends') {
      csvContent += "Month,Sessions,Trained,Hours,Certs\n";
      data.learningTrends.forEach(t => {
        csvContent += `"${t.label}",${t.sessions},${t.trained},${t.hours},${t.certs}\n`;
      });
    } else if (activeTab === 'effectiveness') {
      const e = data.trainingEffectiveness;
      csvContent += "Effectiveness Metric,Score\n";
      csvContent += `Feedback Rating,${e.feedbackScore}/5\n`;
      csvContent += `Trainer Rating,${e.trainerRating}/5\n`;
      csvContent += `Recommendation %,${e.recommendationPct}%\n`;
      csvContent += `Completion %,${e.completionRate}%\n`;
    } else if (activeTab === 'champions') {
      csvContent += "Champion Category,Name\n";
      csvContent += `Top Learner of Quarter,${data.learningChampions.topLearnerOfTheQuarter}\n`;
      csvContent += `Top AI Learner,${data.learningChampions.topAILearner}\n`;
      csvContent += `Top Certified,${data.learningChampions.topCertifiedEmployee}\n`;
    } else if (activeTab === 'investment') {
      csvContent += "Project,Trained Employees,Hours,Certs,AI Score,Coverage\n";
      data.projectInvestment.forEach(p => {
        csvContent += `"${p.project}",${p.trained},${p.hours},${p.certs},${p.aiScore},${p.coverage}%\n`;
      });
    } else if (activeTab === 'fresher') {
      csvContent += "Freshers Hired,Training Completion %,Deployment %\n";
      csvContent += `${data.fresherJourney.freshersHired},${data.fresherJourney.trainingCompletionRate}%,${data.fresherJourney.deploymentRate}%\n`;
    } else {
      csvContent += "Skill,Current Level,Required Level\n";
      data.futureEnhancements.skillGapAnalysis.forEach(sg => {
        csvContent += `"${sg.skill}",${sg.current}%,${sg.required}%\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Successfully exported ${filename}`, 'success');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Predefined options matching Spring Boot Controller mappings
  const yearOptions = ['2026', '2025'];
  const quarterOptions = [
    { label: 'All Quarters', value: 'all' },
    { label: 'Q1 (Jan - Mar)', value: 'q1' },
    { label: 'Q2 (Apr - Jun)', value: 'q2' },
    { label: 'Q3 (Jul - Sep)', value: 'q3' },
    { label: 'Q4 (Oct - Dec)', value: 'q4' }
  ];
  const regionOptions = ['all', 'India', 'US', 'UK'];
  const locationOptions = ['all', 'Delhi', 'Gurgaon', 'Bangalore', 'Pune', 'Noida', 'Mumbai'];
  const buOptions = ['all', 'Digital', 'Cloud & Infra', 'Data & AI', 'Advisory'];
  const deptOptions = ['all', 'Computer Science', 'Information Technology', 'DevOps & Cloud', 'AI & Analytics'];
  const practiceOptions = ['all', 'Java', 'Python', 'Cloud Native', 'GenAI', 'Security'];
  const gradeOptions = ['all', 'E1', 'E2', 'E3', 'M1', 'M2'];

  if (loading && !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#01ac9f] border-t-transparent" />
          <p className="text-sm font-medium text-brand-text-secondary">Connecting to Backend Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-surface p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h2 className="text-xl font-bold text-brand-text-primary">Analytics Connection Offline</h2>
          <p className="text-sm text-brand-text-secondary">{error}</p>
          <Button onClick={fetchDashboardData} className="w-full">
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface p-6 lg:p-8">
      <PageHeader
        title="Admin Analytics Panel"
        subtitle="Real-time reporting, learning trends, and transformation metrics"
        action={
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-background px-3 py-1.5 text-xs font-semibold text-brand-text-primary hover:bg-brand-surface transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export Report (CSV)
            </button>
            <Link to="/admin/courses/new">
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Course</Button>
            </Link>
          </div>
        }
      />

      {/* ── Dynamic Filters Toolbar ── */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-background p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 border-b border-brand-border/60 pb-2 select-none">
          <Filter className="h-4 w-4 text-[#01ac9f]" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-text-primary">Organizational Filters</span>
        </div>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          {/* Year */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-brand-text-secondary uppercase">Year</label>
            <select
              value={filters.year}
              onChange={e => handleFilterChange('year', e.target.value)}
              className="rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs text-brand-text-primary focus:outline-none cursor-pointer"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Quarter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-brand-text-secondary uppercase">Quarter</label>
            <select
              value={filters.quarter}
              onChange={e => handleFilterChange('quarter', e.target.value)}
              className="rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs text-brand-text-primary focus:outline-none cursor-pointer"
            >
              {quarterOptions.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>
          </div>

          {/* Region */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-brand-text-secondary uppercase">Region</label>
            <select
              value={filters.region}
              onChange={e => handleFilterChange('region', e.target.value)}
              className="rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs text-brand-text-primary focus:outline-none cursor-pointer"
            >
              {regionOptions.map(r => <option key={r} value={r}>{r === 'all' ? 'All Regions' : r}</option>)}
            </select>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-brand-text-secondary uppercase">Location</label>
            <select
              value={filters.location}
              onChange={e => handleFilterChange('location', e.target.value)}
              className="rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs text-brand-text-primary focus:outline-none cursor-pointer"
            >
              {locationOptions.map(l => <option key={l} value={l}>{l === 'all' ? 'All Locations' : l}</option>)}
            </select>
          </div>

          {/* Business Unit */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-brand-text-secondary uppercase">BU</label>
            <select
              value={filters.businessUnit}
              onChange={e => handleFilterChange('businessUnit', e.target.value)}
              className="rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs text-brand-text-primary focus:outline-none cursor-pointer"
            >
              {buOptions.map(bu => <option key={bu} value={bu}>{bu === 'all' ? 'All BUs' : bu}</option>)}
            </select>
          </div>

          {/* Department */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-brand-text-secondary uppercase">Department</label>
            <select
              value={filters.department}
              onChange={e => handleFilterChange('department', e.target.value)}
              className="rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs text-brand-text-primary focus:outline-none cursor-pointer"
            >
              {deptOptions.map(d => <option key={d} value={d}>{d === 'all' ? 'All Depts' : d}</option>)}
            </select>
          </div>

          {/* Practice */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-brand-text-secondary uppercase">Practice</label>
            <select
              value={filters.practice}
              onChange={e => handleFilterChange('practice', e.target.value)}
              className="rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs text-brand-text-primary focus:outline-none cursor-pointer"
            >
              {practiceOptions.map(p => <option key={p} value={p}>{p === 'all' ? 'All Practices' : p}</option>)}
            </select>
          </div>

          {/* Employee Grade */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-brand-text-secondary uppercase">Grade</label>
            <select
              value={filters.employeeGrade}
              onChange={e => handleFilterChange('employeeGrade', e.target.value)}
              className="rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs text-brand-text-primary focus:outline-none cursor-pointer"
            >
              {gradeOptions.map(g => <option key={g} value={g}>{g === 'all' ? 'All Grades' : g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-brand-border pb-px select-none">
        {[
          { id: 'summary', label: 'Executive Summary', icon: BarChart2 },
          { id: 'coverage', label: 'Learning Coverage', icon: Users },
          { id: 'hours', label: 'Learning Hours', icon: Clock },
          { id: 'pillars', label: 'Training Pillars', icon: FolderOpen },
          { id: 'ai', label: 'AI Transformation', icon: Brain },
          { id: 'certifications', label: 'Certifications', icon: Award },
          { id: 'flagship', label: 'Flagship Programs', icon: Zap },
          { id: 'trends', label: 'Trends', icon: TrendingUp },
          { id: 'effectiveness', label: 'Effectiveness', icon: CheckCircle },
          { id: 'champions', label: 'Champions', icon: Award },
          { id: 'investment', label: 'Project Investment', icon: HardDrive },
          { id: 'fresher', label: 'Fresher Journey', icon: Users },
          { id: 'future', label: 'Future Analytics', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'border-[#01ac9f] text-[#01ac9f]'
                  : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Content View ── */}
      {loading ? (
        <div className="flex py-20 justify-center items-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#01ac9f] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm">
                  <div className="flex justify-between items-start text-brand-text-secondary">
                    <span className="text-xs font-bold uppercase">Learning Reach</span>
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-brand-text-primary mt-2">
                    {data.executiveSummary.employeesTrained} / {data.executiveSummary.totalEmployees}
                  </h2>
                  <p className="text-[11px] text-brand-text-secondary mt-1">Employees Trained (Coverage: {data.executiveSummary.learningCoveragePct}%)</p>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm">
                  <div className="flex justify-between items-start text-brand-text-secondary">
                    <span className="text-xs font-bold uppercase">Total Learning Hours</span>
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-brand-text-primary mt-2">
                    {data.executiveSummary.totalLearningHours} hrs
                  </h2>
                  <p className="text-[11px] text-brand-text-secondary mt-1">
                    Avg {data.executiveSummary.avgHoursPerSession} hrs across {data.executiveSummary.totalSessionsConducted} sessions
                  </p>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm">
                  <div className="flex justify-between items-start text-brand-text-secondary">
                    <span className="text-xs font-bold uppercase">AI readiness funnel</span>
                    <Brain className="h-5 w-5 text-[#84117C]" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-brand-text-primary mt-2">
                    {data.executiveSummary.employeesTrainedInAI} Trained
                  </h2>
                  <p className="text-[11px] text-brand-text-secondary mt-1">
                    {data.executiveSummary.aiCertificationsAchieved} AI Certs ({data.executiveSummary.aiLearningHours} AI Hours)
                  </p>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm">
                  <div className="flex justify-between items-start text-brand-text-secondary">
                    <span className="text-xs font-bold uppercase">Average Feedback</span>
                    <CheckCircle className="h-5 w-5 text-[#01ac9f]" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-brand-text-primary mt-2">
                    {data.executiveSummary.avgFeedbackRating} / 5.0
                  </h2>
                  <p className="text-[11px] text-brand-text-secondary mt-1">
                    {data.executiveSummary.recommendationPct}% Recommendation score
                  </p>
                </div>
              </div>

              {/* Quick Summary list */}
              <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm">
                <h3 className="text-sm font-bold text-brand-text-primary mb-4">Summary Dashboard Overview</h3>
                <div className="grid gap-6 md:grid-cols-3 text-xs text-brand-text-secondary">
                  <div className="space-y-2 border-r border-brand-border pr-4">
                    <p className="font-semibold text-brand-text-primary">Reach & Delivery</p>
                    <p>Total Nominations: <strong>{data.executiveSummary.totalNominations}</strong></p>
                    <p>Attendees Trained: <strong>{data.executiveSummary.totalAttendees}</strong></p>
                    <p>Sessions Conducted: <strong>{data.executiveSummary.totalSessionsConducted}</strong></p>
                  </div>
                  <div className="space-y-2 border-r border-brand-border pr-4">
                    <p className="font-semibold text-brand-text-primary">Certifications Status</p>
                    <p>Total Completed: <strong>{data.executiveSummary.totalCertificationsCompleted}</strong></p>
                    <p>Zoho Approved: <strong>{data.executiveSummary.totalCertificationsCompleted}</strong></p>
                    <p>Estimated Growth: <strong className="text-green-500">+{data.executiveSummary.certificationGrowthPct}% MoM</strong></p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-brand-text-primary">Satisfaction Metrics</p>
                    <p>Training Satisfaction: <strong>{data.executiveSummary.trainingSatisfactionScore}%</strong></p>
                    <p>Recommendation Index: <strong>{data.executiveSummary.recommendationPct}%</strong></p>
                    <p>Avg Rating Score: <strong>{data.executiveSummary.avgFeedbackRating} / 5</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEARNING COVERAGE */}
          {activeTab === 'coverage' && (
            <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
              <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text-primary">Coverage by Region & Location</h3>
                <div className="space-y-3">
                  {Object.entries(data.learningCoverage.locationCoverage).map(([loc, val]) => (
                    <div key={loc} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{loc} location</span>
                        <span>{val}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-brand-surface overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-[#01ac9f]" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text-primary">Coverage by Employee Grade & BU</h3>
                <div className="space-y-3">
                  {Object.entries(data.learningCoverage.gradeCoverage).map(([grade, val]) => (
                    <div key={grade} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Grade {grade}</span>
                        <span>{val}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-brand-surface overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-[#6c1d5f]" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-brand-border/60 my-4 pt-3" />
                  {Object.entries(data.learningCoverage.businessUnitCoverage).map(([bu, val]) => (
                    <div key={bu} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>BU: {bu}</span>
                        <span>{val}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-brand-surface overflow-hidden">
                        <div className="h-full bg-[#01ac9f]" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEARNING HOURS */}
          {activeTab === 'hours' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">TOTAL LEARNING HOURS</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#01ac9f]">{data.learningHoursAnalytics.totalLearningHours} hrs</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">AVG HOURS PER EMPLOYEE</p>
                  <p className="text-3xl font-extrabold mt-1 text-brand-primary">{data.learningHoursAnalytics.avgLearningHoursPerEmployee} hrs</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">AVG HOURS PER ACTIVE LEARNER</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#84117C]">{data.learningHoursAnalytics.avgLearningHoursPerActiveLearner} hrs</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Top 10 Learners</h3>
                  <div className="overflow-x-auto rounded-lg border border-brand-border bg-brand-surface">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-brand-background border-b border-brand-border font-bold">
                          <th className="px-4 py-2">Learner</th>
                          <th className="px-4 py-2 text-right">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.learningHoursAnalytics.topLearners.map((l, idx) => (
                          <tr key={idx} className="border-b border-brand-border last:border-0">
                            <td className="px-4 py-2 font-medium">{l.name}</td>
                            <td className="px-4 py-2 text-right font-bold text-[#01ac9f]">{l.hours} hrs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Hours by Project & Region</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-brand-text-secondary">Projects Investment</p>
                      {data.learningHoursAnalytics.topProjects.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span>{p.project}</span>
                          <span className="font-semibold text-brand-text-primary">{p.hours} hrs</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-brand-border/60 my-4" />
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-brand-text-secondary">Regions Distribution</p>
                      {data.learningHoursAnalytics.topRegions.map((r, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span>{r.region}</span>
                          <span className="font-semibold text-brand-text-primary">{r.hours} hrs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRAINING PILLARS */}
          {activeTab === 'pillars' && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-fade-in">
              {data.learningPillars.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-brand-border/60 pb-2">
                    <h4 className="text-xs font-bold text-brand-text-primary">{p.pillar}</h4>
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div className="flex justify-between text-xs text-brand-text-secondary">
                    <span>Trained Employees:</span>
                    <strong className="text-brand-text-primary">{p.trained}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-brand-text-secondary">
                    <span>Total Learning Hours:</span>
                    <strong className="text-[#01ac9f]">{p.hours} hrs</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: AI TRANSFORMATION */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">AI READINESS INDEX</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#84117C]">{data.aiTransformation.aiReadinessIndex}%</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">TRAINED ON AI</p>
                  <p className="text-3xl font-extrabold mt-1 text-brand-primary">{data.aiTransformation.employeesTrainedOnAI}</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">AI CERTIFICATIONS</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#01ac9f]">{data.aiTransformation.employeesCertifiedOnAI}</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">AI MATURITY SCORE</p>
                  <p className="text-3xl font-extrabold mt-1 text-amber-500">{data.aiTransformation.aiMaturityScore} / 100</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Adoption Funnel</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Registered Pool', val: data.aiTransformation.funnel.registered, pct: 100, color: 'bg-slate-500' },
                      { label: 'Nominated Pool', val: data.aiTransformation.funnel.attended, pct: Math.round((data.aiTransformation.funnel.attended / data.aiTransformation.funnel.registered) * 100), color: 'bg-blue-500' },
                      { label: 'Trained Pool', val: data.aiTransformation.funnel.completed, pct: Math.round((data.aiTransformation.funnel.completed / data.aiTransformation.funnel.registered) * 100), color: 'bg-purple-500' },
                      { label: 'Certified Pool', val: data.aiTransformation.funnel.certified, pct: Math.round((data.aiTransformation.funnel.certified / data.aiTransformation.funnel.registered) * 100), color: 'bg-green-500' },
                      { label: 'Active Tool Usage', val: data.aiTransformation.funnel.usingAITools, pct: Math.round((data.aiTransformation.funnel.usingAITools / data.aiTransformation.funnel.registered) * 100), color: 'bg-amber-500' }
                    ].map((step, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>{step.label}</span>
                          <span>{step.val} ({step.pct}%)</span>
                        </div>
                        <div className="h-3 w-full rounded-lg bg-brand-surface overflow-hidden">
                          <div className={`h-full ${step.color}`} style={{ width: `${step.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Tools Adoption</h3>
                  <div className="space-y-4">
                    {data.aiTransformation.toolsAdoption.map((ta, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-brand-border/60 pb-2 last:border-0">
                        <span className="font-semibold">{ta.tool}</span>
                        <Badge color="blue">{ta.count} active developers</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Certification Pipeline Funnel</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Assigned Certifications', count: data.certificationTracker.funnel.assigned, color: '#f59e0b' },
                      { label: 'Enrolled & Started', count: data.certificationTracker.funnel.enrolled, color: '#3b82f6' },
                      { label: 'Completed & Submitted', count: data.certificationTracker.funnel.completed, color: '#8b5cf6' },
                      { label: 'Zoho Approved', count: data.certificationTracker.funnel.approvedInZoho, color: '#10b981' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-brand-border/60 pb-2.5">
                        <span className="font-medium text-brand-text-secondary">{item.label}</span>
                        <span className="font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: item.color }}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Certifications by Technology</h3>
                  <div className="space-y-3">
                    {Object.entries(data.certificationTracker.certificationsByTechnology).map(([tech, count]) => (
                      <div key={tech} className="flex justify-between items-center text-xs">
                        <span>{tech}</span>
                        <strong className="text-[#01ac9f]">{count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FLAGSHIP PROGRAMS */}
          {activeTab === 'flagship' && (
            <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-brand-text-primary">Flagship Programs Analytics</h3>
              <div className="overflow-x-auto rounded-lg border border-brand-border bg-brand-surface">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-brand-background border-b border-brand-border font-bold">
                      <th className="px-4 py-3">Program Name</th>
                      <th className="px-4 py-3">Participants</th>
                      <th className="px-4 py-3">Completion Rate</th>
                      <th className="px-4 py-3">Total Learning Hours</th>
                      <th className="px-4 py-3 text-right">Feedback Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.flagshipPrograms.map((p, idx) => (
                      <tr key={idx} className="border-b border-brand-border last:border-0">
                        <td className="px-4 py-3 font-semibold text-brand-text-primary">{p.program}</td>
                        <td className="px-4 py-3">{p.participants} members</td>
                        <td className="px-4 py-3 font-semibold text-green-600">{p.completionRate}%</td>
                        <td className="px-4 py-3 font-semibold text-[#01ac9f]">{p.learningHours} hrs</td>
                        <td className="px-4 py-3 text-right font-bold text-amber-500">⭐ {p.feedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: TRENDS */}
          {activeTab === 'trends' && (
            <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-brand-text-primary">Month-over-Month Learning Progress</h3>
              <div className="overflow-x-auto rounded-lg border border-brand-border bg-brand-surface">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-brand-background border-b border-brand-border font-bold">
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">Sessions Conducted</th>
                      <th className="px-4 py-3">Employees Trained</th>
                      <th className="px-4 py-3">Total Learning Hours</th>
                      <th className="px-4 py-3 text-right">Certifications Achieved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.learningTrends.map((t, idx) => (
                      <tr key={idx} className="border-b border-brand-border last:border-0">
                        <td className="px-4 py-3 font-semibold">{t.label}</td>
                        <td className="px-4 py-3">{t.sessions} sessions</td>
                        <td className="px-4 py-3">{t.trained} trainees</td>
                        <td className="px-4 py-3 font-bold text-brand-primary">{t.hours} hrs</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#01ac9f]">{t.certs} certs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: TRAINING EFFECTIVENESS */}
          {activeTab === 'effectiveness' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">FEEDBACK SCORE</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#01ac9f]">{data.trainingEffectiveness.feedbackScore} / 5.0</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">TRAINER RATING</p>
                  <p className="text-3xl font-extrabold mt-1 text-brand-primary">{data.trainingEffectiveness.trainerRating} / 5.0</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">RECOMMENDATION %</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#84117C]">{data.trainingEffectiveness.recommendationPct}%</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Best Rated Courses</h3>
                  <div className="space-y-3">
                    {data.trainingEffectiveness.bestRatedTrainings.map((br, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-brand-border/60 pb-2 last:border-0">
                        <span className="font-semibold">{br.title}</span>
                        <span className="text-amber-500 font-bold">⭐ {br.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Top Trainers</h3>
                  <div className="space-y-3">
                    {data.trainingEffectiveness.bestRatedTrainers.map((br, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-brand-border/60 pb-2 last:border-0">
                        <span className="font-semibold">{br.name}</span>
                        <span className="text-[#01ac9f] font-bold">⭐ {br.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: LEARNING CHAMPIONS */}
          {activeTab === 'champions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-brand-text-secondary uppercase">Top Learner of Quarter</p>
                  <h4 className="text-lg font-bold text-[#01ac9f]">{data.learningChampions.topLearnerOfTheQuarter}</h4>
                  <p className="text-[10px] text-brand-text-secondary">Highest study hours recorded</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-brand-text-secondary uppercase">Top AI Transformation Learner</p>
                  <h4 className="text-lg font-bold text-[#84117C]">{data.learningChampions.topAILearner}</h4>
                  <p className="text-[10px] text-brand-text-secondary">Top scorer in AI certifications</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-brand-text-secondary uppercase">Top Certified Pioneer</p>
                  <h4 className="text-lg font-bold text-brand-primary">{data.learningChampions.topCertifiedEmployee}</h4>
                  <p className="text-[10px] text-brand-text-secondary">Completed multiple certifications</p>
                </div>
              </div>

              <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text-primary">Executive Learning Champions List</h3>
                <div className="grid gap-3 sm:grid-cols-5 text-center">
                  {data.learningChampions.learningChampionsList.map((champ, idx) => (
                    <div key={idx} className="bg-brand-surface p-3 rounded-lg border border-brand-border">
                      <span className="text-xl">🏆</span>
                      <p className="text-xs font-bold text-brand-text-primary mt-1">{champ}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: PROJECT INVESTMENT */}
          {activeTab === 'investment' && (
            <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-brand-text-primary">Project learning investments</h3>
              <div className="overflow-x-auto rounded-lg border border-brand-border bg-brand-surface">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-brand-background border-b border-brand-border font-bold">
                      <th className="px-4 py-3">Project Code</th>
                      <th className="px-4 py-3">Employees Trained</th>
                      <th className="px-4 py-3">Total Hours Invested</th>
                      <th className="px-4 py-3">Certifications Achieved</th>
                      <th className="px-4 py-3">AI Readiness Score</th>
                      <th className="px-4 py-3 text-right">Coverage Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.projectInvestment.map((p, idx) => (
                      <tr key={idx} className="border-b border-brand-border last:border-0">
                        <td className="px-4 py-3 font-semibold text-brand-text-primary">{p.project}</td>
                        <td className="px-4 py-3">{p.trained} trainees</td>
                        <td className="px-4 py-3 font-semibold text-[#01ac9f]">{p.hours} hrs</td>
                        <td className="px-4 py-3">{p.certs} completed</td>
                        <td className="px-4 py-3 font-bold text-[#84117C]">{p.aiScore} pts</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">{p.coverage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 12: FRESHER JOURNEY */}
          {activeTab === 'fresher' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">CAMPUS RECRUITS</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#01ac9f]">{data.fresherJourney.freshersHired}</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">TRAINING COMPLETION</p>
                  <p className="text-3xl font-extrabold mt-1 text-green-600">{data.fresherJourney.trainingCompletionRate}%</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">DEPLOYMENT RATE</p>
                  <p className="text-3xl font-extrabold mt-1 text-brand-primary">{data.fresherJourney.deploymentRate}%</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">AVG TIME TO DEPLOY</p>
                  <p className="text-3xl font-extrabold mt-1 text-amber-500">{data.fresherJourney.avgTimeToDeploymentDays} Days</p>
                </div>
              </div>

              <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text-primary">Campus to Deployment Funnel Tracker</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Hired & Inducted', count: data.fresherJourney.funnel.campusHiring, color: 'bg-slate-400' },
                    { label: 'Enrolled in Technical Training', count: data.fresherJourney.funnel.trainingEnrollment, color: 'bg-blue-400' },
                    { label: 'Completed Learning Journey', count: data.fresherJourney.funnel.trainingCompletion, color: 'bg-purple-400' },
                    { label: 'Acquired Certification', count: data.fresherJourney.funnel.certificationCompletion, color: 'bg-pink-400' },
                    { label: 'Project Allocated', count: data.fresherJourney.funnel.projectAllocation, color: 'bg-amber-400' },
                    { label: 'Billably Deployed', count: data.fresherJourney.funnel.billableDeployment, color: 'bg-green-500' }
                  ].map((step, idx) => {
                    const maxCount = data.fresherJourney.funnel.campusHiring;
                    const pct = maxCount > 0 ? Math.round((step.count / maxCount) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>{step.label}</span>
                          <span>{step.count} candidates ({pct}%)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-lg bg-brand-surface overflow-hidden">
                          <div className={`h-full ${step.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* FUTURE ANALYTICS */}
          {activeTab === 'future' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-[#84117C]" /> Skill Gap Analysis Matrix
                  </h3>
                  <div className="space-y-4">
                    {data.futureEnhancements.skillGapAnalysis.map((sg, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>{sg.skill}</span>
                          <span>Current: {sg.current}% / Target: {sg.required}%</span>
                        </div>
                        <div className="relative h-3 w-full rounded-lg bg-brand-surface overflow-hidden">
                          {/* target indicator */}
                          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${sg.required}%` }} title="Target Required" />
                          <div className="h-full bg-gradient-to-r from-[#01ac9f] to-[#84117C]" style={{ width: `${sg.current}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Predictive Forecasts & Risk Indicators</h3>
                  <div className="space-y-3">
                    <div className="bg-green-500/10 border border-green-500/30 text-green-700 p-3 rounded-lg text-xs">
                      <strong>🔮 Certification Forecast:</strong> {data.futureEnhancements.predictiveForecasts.certificationCompletionPrediction}
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-3 rounded-lg text-xs">
                      <strong>⚠️ Risk Warning:</strong> {data.futureEnhancements.predictiveForecasts.learningRiskIndicators}
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 text-blue-700 p-3 rounded-lg text-xs">
                      <strong>🚀 AI Readiness Forecast:</strong> {data.futureEnhancements.predictiveForecasts.aiReadinessForecast}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-brand-text-primary">Suggested Skills Mitigation Courses</h3>
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  {data.futureEnhancements.suggestedCourses.map((sc, idx) => (
                    <div key={idx} className="bg-brand-surface p-3.5 rounded-lg border border-brand-border space-y-1">
                      <p className="font-bold text-brand-text-primary">{sc.title}</p>
                      <p className="text-brand-text-secondary">{sc.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
