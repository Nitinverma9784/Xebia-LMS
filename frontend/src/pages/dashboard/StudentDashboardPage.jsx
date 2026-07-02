import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2, BookOpen, Award, Brain, History, Trophy, Sparkles,
  ArrowRight, Search, Bell, RefreshCw, AlertTriangle, Flame,
  Tv, Calendar, Target, Clock, GraduationCap, CheckCircle2, ChevronRight,
  TrendingUp, Award as BadgeIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

// UI Layout Components
import Button from '@/components/ui/Button';

// Hooks & Services
import { useStudentAuth } from '@/auth/student/studentAuthHooks';
import { useToast } from '@/hooks/useToast';
import {
  getStudentDashboardData,
  getStudentProgress,
  getStudentCertificates,
  getStudentAIProgress,
  getStudentHistory,
  getStudentRanking,
  getStudentRecommendations
} from '@/services/studentDashboardService';

// Dashboard Tab Panels
import LearningProgress from '@/components/dashboard/LearningProgress';
import CertificationSection from '@/components/dashboard/CertificationSection';
import AILearningProgress from '@/components/dashboard/AILearningProgress';
import LearningHistory from '@/components/dashboard/LearningHistory';
import Leaderboard from '@/components/dashboard/Leaderboard';
import RecommendedCourses from '@/components/dashboard/RecommendedCourses';

export default function StudentDashboardPage() {
  const { user } = useStudentAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [aiProgress, setAIProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Local student profile credentials fallback
  const userName = user?.fullName || 'Rohit';
  const userAvatar = user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Rohit';

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [
        dashRes,
        progRes,
        certRes,
        aiRes,
        histRes,
        rankRes,
        recRes
      ] = await Promise.all([
        getStudentDashboardData(),
        getStudentProgress(),
        getStudentCertificates(),
        getStudentAIProgress(),
        getStudentHistory(),
        getStudentRanking(),
        getStudentRecommendations()
      ]);

      setDashboardData(dashRes);
      setProgressData(progRes);
      setCertificates(certRes);
      setAIProgress(aiRes);
      setHistory(histRes);
      setRanking(rankRes);
      setRecommendations(recRes);
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
      setError('We could not connect to the Learning Management System server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calendar dates layout helpers
  const getCalendarDays = () => {
    const days = [];
    const today = new Date();
    // Render past 2 days, today, and next 4 days
    for (let i = -2; i <= 4; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      days.push({
        date: d.getDate(),
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        isToday: i === 0,
        hasDeadline: i === 1 || i === 3
      });
    }
    return days;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-brand-border/60" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-brand-border/60" />
        </div>
        <div className="h-28 w-full animate-pulse rounded-2xl bg-brand-border/60" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-48 animate-pulse rounded-2xl bg-brand-border/60" />
          <div className="h-48 animate-pulse rounded-2xl bg-brand-border/60" />
          <div className="h-48 animate-pulse rounded-2xl bg-brand-border/60" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8 flex items-center justify-center">
        <div className="rounded-3xl border border-brand-border/70 bg-white p-8 text-center shadow-card max-w-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h3 className="mt-4 text-xl font-bold text-brand-text-primary">Connection Offline</h3>
          <p className="mt-2 text-sm text-brand-text-secondary">{error}</p>
          <div className="mt-6">
            <Button onClick={fetchDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" /> Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8">
      
      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#6C1D5F] to-[#511345] text-white p-6 md:p-8 shadow-xl relative"
      >
        <div className="absolute top-[-30%] right-[-10%] h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-5%] h-48 w-48 rounded-full bg-purple-500/10 blur-2xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={userAvatar}
              alt={userName}
              className="h-16 w-16 md:h-20 md:w-20 rounded-full border-2 border-white/20 object-cover shadow-md bg-white/10 shrink-0"
            />
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                Welcome back, {userName}! 👋
              </h2>
              <p className="text-sm text-purple-200 mt-1.5 leading-relaxed font-medium">
                Ready to continue your learning journey? Expand your skill catalog today.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            {/* Streak metric */}
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-xs font-semibold text-purple-200 block">Learning Streak</span>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Flame className="h-5 w-5 text-orange-400 fill-orange-400 animate-pulse" />
                <span className="text-lg font-bold">5 Days</span>
              </div>
            </div>

            {/* Progress completion metric */}
            <div className="text-center px-3">
              <span className="text-xs font-semibold text-purple-200 block">Overall Completion</span>
              <span className="text-lg font-bold block mt-1">74%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs Navigation (Matches Admin Design) ── */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-brand-border pb-px select-none">
        {[
          { id: 'overview', label: 'My Dashboard', icon: BarChart2 },
          { id: 'progress', label: 'Learning Progress', icon: BookOpen },
          { id: 'certificates', label: 'Certifications', icon: Award },
          { id: 'ai', label: 'AI Analytics', icon: Brain },
          { id: 'history', label: 'Learning History', icon: History },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'recommendations', label: 'Recommended', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'border-[#6C1D5F] text-[#6C1D5F]'
                  : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Active Panel Render ── */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            
            {/* ── OVERVIEW PANEL REDESIGN ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* 1. Quick Actions Row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  
                  {/* Browse courses */}
                  <Link to="/student/courses" className="group">
                    <div className="flex items-center justify-between p-4 bg-white hover:bg-purple-50/50 border border-brand-border/85 rounded-2xl shadow-sm transition-all hover:shadow-md cursor-pointer dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-115 transition-transform shrink-0">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Browse Courses</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  {/* AI Assistant */}
                  <div onClick={() => setActiveTab('ai')} className="group cursor-pointer">
                    <div className="flex items-center justify-between p-4 bg-white hover:bg-purple-50/50 border border-brand-border/85 rounded-2xl shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-115 transition-transform shrink-0">
                          <Brain className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Assistant</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Certificates */}
                  <div onClick={() => setActiveTab('certificates')} className="group cursor-pointer">
                    <div className="flex items-center justify-between p-4 bg-white hover:bg-purple-50/50 border border-brand-border/85 rounded-2xl shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-115 transition-transform shrink-0">
                          <Award className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Certificates</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* View Assignments */}
                  <div onClick={() => showToast('Redirecting to assignment manager...', 'info')} className="group cursor-pointer">
                    <div className="flex items-center justify-between p-4 bg-white hover:bg-purple-50/50 border border-brand-border/85 rounded-2xl shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-115 transition-transform shrink-0">
                          <Target className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">View Assignments</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                </div>

                {/* 2. Three-Column Main Widgets Layout */}
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  
                  {/* ── COLUMN 1: Learning Path & Classes ── */}
                  <div className="space-y-6">
                    {/* Continue Learning card */}
                    <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          Continue Learning
                        </span>
                        <span className="text-xs text-brand-text-secondary">{dashboardData?.continueLearning?.progress}% Done</span>
                      </div>
                      
                      <div className="overflow-hidden rounded-xl border border-brand-border/60 mb-4">
                        <img
                          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
                          alt="Learning preview"
                          className="h-28 w-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <h4 className="text-sm font-bold text-brand-text-primary dark:text-slate-100 leading-snug">
                        {dashboardData?.continueLearning?.subtitle}
                      </h4>
                      <p className="mt-1 text-xs text-brand-text-secondary leading-relaxed line-clamp-2">
                        {dashboardData?.continueLearning?.description}
                      </p>

                      <div className="mt-4 space-y-3">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-brand-border/60">
                          <div
                            className="h-full rounded-full bg-[#6C1D5F]"
                            style={{ width: `${dashboardData?.continueLearning?.progress}%` }}
                          />
                        </div>
                        <Button className="w-full flex items-center justify-center gap-2 py-2 text-xs bg-[#6C1D5F] hover:bg-[#511345] border-0 cursor-pointer">
                          Resume Session <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Upcoming Live Sessions Widget */}
                    <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-2 mb-4 border-b border-brand-border/50 pb-2.5">
                        <Tv className="h-5 w-5 text-purple-600" />
                        <h3 className="text-sm font-bold text-brand-text-primary dark:text-slate-100">Live Sessions</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-brand-border bg-brand-surface/40 hover:bg-brand-surface/80 transition-colors">
                          <div>
                            <p className="text-xs font-bold text-brand-text-primary">DevOps Best Practices</p>
                            <p className="text-[10px] text-brand-text-secondary mt-0.5">Today, 3:30 PM</p>
                          </div>
                          <Button size="xs" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1 cursor-pointer">Join</Button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl border border-brand-border bg-brand-surface/40 hover:bg-brand-surface/80 transition-colors">
                          <div>
                            <p className="text-xs font-bold text-brand-text-primary">React 19 Hooks Workshop</p>
                            <p className="text-[10px] text-brand-text-secondary mt-0.5">Tomorrow, 11:00 AM</p>
                          </div>
                          <Button size="xs" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1 cursor-pointer">Join</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── COLUMN 2: Insights, Skills & Achievements ── */}
                  <div className="space-y-6">
                    {/* Skill Progress */}
                    <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between mb-4 border-b border-brand-border/50 pb-2.5">
                        <span className="text-xs font-bold text-brand-text-primary dark:text-slate-100">Skill Progress</span>
                        <span className="text-[10px] text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full font-bold">Technologies</span>
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { name: 'React & Front-end', level: 85 },
                          { name: 'Python Engineering', level: 70 },
                          { name: 'AWS Cloud Services', level: 60 },
                          { name: 'Data Modeling & SQL', level: 90 }
                        ].map((skill) => (
                          <div key={skill.name}>
                            <div className="flex justify-between text-xs text-brand-text-secondary mb-1">
                              <span>{skill.name}</span>
                              <span className="font-semibold">{skill.level}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-brand-border/60 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full" style={{ width: `${skill.level}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning Insights */}
                    <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-2 mb-4 border-b border-brand-border/50 pb-2.5">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <h3 className="text-sm font-bold text-brand-text-primary dark:text-slate-100">Learning Insights</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-brand-surface/40 p-3 rounded-2xl border border-brand-border">
                          <span className="text-[10px] text-brand-text-secondary block">Weekly Hours</span>
                          <span className="text-base font-bold text-brand-text-primary mt-0.5 block">5.4h</span>
                        </div>
                        <div className="bg-brand-surface/40 p-3 rounded-2xl border border-brand-border">
                          <span className="text-[10px] text-brand-text-secondary block">Completed</span>
                          <span className="text-base font-bold text-brand-text-primary mt-0.5 block">2 Courses</span>
                        </div>
                        <div className="bg-brand-surface/40 p-3 rounded-2xl border border-brand-border">
                          <span className="text-[10px] text-brand-text-secondary block">Quiz Average</span>
                          <span className="text-base font-bold text-brand-text-primary mt-0.5 block">88%</span>
                        </div>
                        <div className="bg-brand-surface/40 p-3 rounded-2xl border border-brand-border">
                          <span className="text-[10px] text-brand-text-secondary block">Rank</span>
                          <span className="text-base font-bold text-brand-text-primary mt-0.5 block">4th</span>
                        </div>
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between mb-4 border-b border-brand-border/50 pb-2.5">
                        <h4 className="text-sm font-bold text-brand-text-primary dark:text-slate-100">Recent Achievements</h4>
                        <span onClick={() => setActiveTab('certificates')} className="text-xs text-brand-primary hover:underline cursor-pointer">View All</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                            <BadgeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-brand-text-primary">Streak Master Badge</p>
                            <p className="text-[10px] text-brand-text-secondary mt-0.5">Earned for 5 days login streak</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-brand-text-primary">Python Basics Certificate</p>
                            <p className="text-[10px] text-brand-text-secondary mt-0.5">Completed Python Foundations course</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* ── COLUMN 3: Goals, Streak Calendar & Deadlines ── */}
                  <div className="space-y-6">
                    {/* Weekly Learning Goal */}
                    <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="h-5 w-5 text-purple-600" />
                        <h4 className="text-sm font-bold text-brand-text-primary dark:text-slate-100">Weekly Goal</h4>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-brand-text-secondary">
                          <span>Hours Learned</span>
                          <span className="font-semibold">4.5 / 6h</span>
                        </div>
                        <div className="h-2 w-full bg-brand-border/60 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600 rounded-full" style={{ width: '75%' }} />
                        </div>
                        <p className="text-[10px] text-brand-text-secondary italic mt-1">You are 75% close to your weekly goal!</p>
                      </div>
                    </div>

                    {/* Learning Streak widget */}
                    <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-2 mb-4 border-b border-brand-border/50 pb-2.5">
                        <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
                        <h4 className="text-sm font-bold text-brand-text-primary dark:text-slate-100">Learning Streak</h4>
                      </div>

                      <div className="grid grid-cols-7 gap-2 text-center text-xs">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                          const isActive = idx < 5; // Monday to Friday active
                          return (
                            <div key={idx} className="space-y-1">
                              <span className="text-[10px] text-brand-text-secondary block">{day}</span>
                              <div className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center ${isActive ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold' : 'bg-brand-border/40 text-brand-text-secondary'}`}>
                                {isActive ? '🔥' : idx + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Calendar Widget with Deadlines */}
                    <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-2 mb-4 border-b border-brand-border/50 pb-2.5">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <h4 className="text-sm font-bold text-brand-text-primary dark:text-slate-100">Calendar Deadlines</h4>
                      </div>

                      <div className="grid grid-cols-7 gap-2 text-center text-xs mb-3">
                        {getCalendarDays().map((day, idx) => (
                          <div key={idx} className="space-y-1">
                            <span className="text-[9px] text-brand-text-secondary block uppercase">{day.dayLabel}</span>
                            <div className={`h-8 w-8 mx-auto rounded-lg flex flex-col items-center justify-center relative ${
                              day.isToday 
                                ? 'bg-purple-600 text-white font-bold' 
                                : 'bg-brand-surface/60 border border-brand-border/40 text-brand-text-primary'
                            }`}>
                              <span>{day.date}</span>
                              {day.hasDeadline && (
                                <span className={`absolute bottom-1 h-1 w-1 rounded-full ${day.isToday ? 'bg-white' : 'bg-red-500'}`} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 mt-4">
                        <div className="flex items-start gap-2 text-[11px] text-brand-text-secondary leading-snug">
                          <span className="h-2 w-2 rounded-full bg-red-500 mt-1 shrink-0" />
                          <p>Tomorrow: Project Milestone 2 submission</p>
                        </div>
                        <div className="flex items-start gap-2 text-[11px] text-brand-text-secondary leading-snug">
                          <span className="h-2 w-2 rounded-full bg-red-500 mt-1 shrink-0" />
                          <p>In 3 days: React core quiz deadline</p>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* 3. Recommended courses widget list */}
                <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-4 border-b border-brand-border/50 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <h4 className="text-sm font-bold text-brand-text-primary dark:text-slate-100">Recommended for Rohit</h4>
                    </div>
                    <span onClick={() => setActiveTab('recommendations')} className="text-xs text-brand-primary hover:underline cursor-pointer font-bold">Explore More</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {recommendations.slice(0, 3).map((course) => (
                      <div key={course.id} className="group flex flex-col justify-between p-4 rounded-2xl border border-brand-border bg-brand-surface/40 hover:bg-brand-surface/90 hover:shadow-sm transition-all duration-200">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{course.category}</span>
                          <h5 className="text-xs font-bold text-brand-text-primary mt-2 group-hover:text-purple-700 transition-colors line-clamp-1">{course.title}</h5>
                          <p className="text-[10px] text-brand-text-secondary mt-1 leading-normal line-clamp-2">{course.description}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-[10px] font-semibold text-brand-text-secondary">
                          <span>{course.duration} · {course.level}</span>
                          <span className="text-brand-primary font-bold group-hover:underline flex items-center gap-0.5">Learn Now &rarr;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* PROGRESS PANEL */}
            {activeTab === 'progress' && (
              <LearningProgress progressData={progressData} />
            )}

            {/* CERTIFICATES PANEL */}
            {activeTab === 'certificates' && (
              <CertificationSection certificates={certificates} />
            )}

            {/* AI PROGRESS PANEL */}
            {activeTab === 'ai' && (
              <AILearningProgress aiData={aiProgress} />
            )}

            {/* HISTORY PANEL */}
            {activeTab === 'history' && (
              <LearningHistory history={history} />
            )}

            {/* LEADERBOARD PANEL */}
            {activeTab === 'leaderboard' && (
              <Leaderboard ranking={ranking} />
            )}

            {/* RECOMMENDATIONS PANEL */}
            {activeTab === 'recommendations' && (
              <RecommendedCourses recommendations={recommendations} />
            )}

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
