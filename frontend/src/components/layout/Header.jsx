'use client';

import { Bell, Search, User, Sun, Moon, SlidersHorizontal, Check, X, BookOpen, Users, FolderTree, FileText, Landmark, ChevronRight, Home, Settings, LogOut } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { cn, formatDateTime } from '@/utils';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useStudentAuth } from '@/auth/student/studentAuthHooks';
import { useTheme } from '@/context/ThemeContext';

// Highlight helper
function highlightText(text, query) {
  if (!text) return '';
  if (!query.trim()) return text;
  const parts = String(text).split(new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-amber-100 dark:bg-amber-950/60 text-brand-primary dark:text-brand-secondary font-semibold rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

function getInitials(name) {
  if (!name) return 'SC';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Header({ title, subtitle }) {
  const {
    courses, categories, students, mediaLibrary, instructors,
    notifications, markAllNotificationsAsRead, clearNotifications, branding
  } = useCatalog();
  const navigate = useNavigate();
  const location = useLocation();
  const isStudentView = location.pathname.startsWith('/student');
  const adminAuth = useAuth();
  const studentAuth = useStudentAuth();
  const { user } = isStudentView ? studentAuth : adminAuth;
  const { theme, toggleTheme } = useTheme();
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([
    'courses', 'students', 'categories', 'instructors', 'videos', 'pdfs', 'ppts', 'assignments', 'published', 'draft', 'active', 'inactive'
  ]);
  
  // Notifications panel state
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Refs for closing panels on click outside
  const searchRef = useRef(null);
  const filterRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const clickHandler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

  // Filter Checkbox Toggles
  const handleFilterToggle = (val) => {
    setSelectedFilters((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const handleSelectAllFilters = () => {
    const allFilters = [
      'courses', 'students', 'categories', 'instructors', 'videos', 'pdfs', 'ppts', 'assignments', 'published', 'draft', 'active', 'inactive'
    ];
    if (selectedFilters.length === allFilters.length) {
      setSelectedFilters([]);
    } else {
      setSelectedFilters(allFilters);
    }
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
  };

  // Multi-entity search querying logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const results = [];
    const q = searchQuery.toLowerCase();

    // 1. Categories
    if (selectedFilters.includes('categories')) {
      categories.filter(c => !c.deletedAt).forEach(cat => {
        const matchName = cat.name.toLowerCase().includes(q);
        const matchDesc = cat.description?.toLowerCase().includes(q);
        const matchActive = selectedFilters.includes(cat.status);
        
        if ((matchName || matchDesc) && matchActive) {
          results.push({
            type: 'category',
            title: cat.name,
            subtitle: cat.description,
            link: `/admin/categories/${cat.id}`,
            icon: FolderTree,
            badge: 'Category'
          });
        }
      });
    }

    // 2. Courses
    if (selectedFilters.includes('courses')) {
      courses.filter(c => !c.deletedAt).forEach(course => {
        const matchTitle = course.title.toLowerCase().includes(q);
        const matchTech = course.technology?.toLowerCase().includes(q);
        const matchPub = selectedFilters.includes(course.status);
        
        if ((matchTitle || matchTech) && matchPub) {
          results.push({
            type: 'course',
            title: course.title,
            subtitle: `${course.technology} · ${course.difficulty}`,
            link: `/admin/curriculum/${course.id}`,
            icon: BookOpen,
            badge: 'Course'
          });
        }
      });
    }

    // 3. Students
    if (selectedFilters.includes('students')) {
      students.forEach(student => {
        const matchName = student.fullName.toLowerCase().includes(q);
        const matchEmail = student.email.toLowerCase().includes(q);
        const matchActive = selectedFilters.includes(student.status === 'completed' ? 'active' : student.status);
        
        if ((matchName || matchEmail) && matchActive) {
          results.push({
            type: 'student',
            title: student.fullName,
            subtitle: `${student.department} · ${student.city}`,
            link: `/admin/dashboard`, // Jump to dashboard where student list is visible
            icon: Users,
            badge: 'Student'
          });
        }
      });
    }

    // 4. Instructors
    if (selectedFilters.includes('instructors')) {
      (instructors || []).forEach(inst => {
        const matchName = inst.fullName.toLowerCase().includes(q);
        const matchEmail = inst.email.toLowerCase().includes(q);
        
        if (matchName || matchEmail) {
          results.push({
            type: 'instructor',
            title: inst.fullName,
            subtitle: `${inst.department} · ${inst.email}`,
            link: `/admin/dashboard`,
            icon: Landmark,
            badge: 'Instructor'
          });
        }
      });
    }

    // 5. Media Library / Content Files
    mediaLibrary.forEach(file => {
      const matchTitle = file.title.toLowerCase().includes(q);
      const isVideo = file.type === 'video' && selectedFilters.includes('videos');
      const isPdf = file.type === 'pdf' && selectedFilters.includes('pdfs');
      const isPpt = file.type === 'ppt' && selectedFilters.includes('ppts');
      const isDoc = file.type === 'doc' && selectedFilters.includes('assignments'); // Map Doc as Assignment
      
      const typeAllowed = isVideo || isPdf || isPpt || isDoc;
      
      if (matchTitle && (selectedFilters.length === 0 || typeAllowed)) {
        results.push({
          type: 'media',
          title: file.title,
          subtitle: `File inside Course: ${file.courseName}`,
          link: `/admin/curriculum/${file.courseId}`,
          icon: FileText,
          badge: file.type.toUpperCase()
        });
      }
    });

    return results.slice(0, 10); // Cap at 10 suggestions
  }, [searchQuery, selectedFilters, courses, categories, students, mediaLibrary, instructors]);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleSuggestionClick = (link) => {
    setSearchQuery('');
    setSearchOpen(false);
    navigate(link);
  };

  const breadcrumbItems = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = [];
    let acc = '';
    parts.forEach((part, index) => {
      acc += `/${part}`;
      if (part === 'student' || part === 'admin') {
        crumbs.push({ label: part === 'student' ? 'Student' : 'Admin', href: acc });
      } else if (part !== 'dashboard') {
        crumbs.push({ label: part.replace(/-/g, ' '), href: acc });
      }
    });
    return crumbs;
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-20 lg:h-22 items-center justify-between border-b border-brand-border dark:border-[#334155] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md px-8 py-3 transition-all duration-300">
      <div className="flex-1 md:flex-none">
        {title && (
          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-black text-[#6C1D5F] dark:text-[#F8FAFC] tracking-tight flex items-center gap-2.5">
            {title}
          </h1>
        )}
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:block flex-1 max-w-md mx-auto relative" ref={searchRef}>
        <div className="relative flex items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary dark:text-[#CBD5E1]" />
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full rounded-full border border-brand-border dark:border-[#334155] bg-brand-surface dark:bg-[#0B1120] py-2.5 pl-10 pr-4 text-sm text-brand-text-primary dark:text-[#F8FAFC] placeholder:text-brand-text-secondary/60 dark:placeholder:text-[#CBD5E1]/60 hover:border-accent-teal/30 focus:border-[#6C1D5F] focus:ring-2 focus:ring-[#6C1D5F]/20 transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary dark:text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className={cn(
                'rounded-xl border p-2.5 flex items-center justify-center transition-all',
                selectedFilters.length < 12
                  ? 'border-[#6C1D5F] bg-[#6C1D5F]/5 text-[#6C1D5F] dark:text-brand-secondary'
                  : 'border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 text-brand-text-secondary dark:text-slate-450 hover:bg-brand-surface dark:hover:bg-slate-800'
              )}
              title="Advanced Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {selectedFilters.length < 12 && (
                <span className="ml-1 text-[10px] font-bold bg-brand-primary text-white rounded-full h-4 w-4 flex items-center justify-center">
                  {selectedFilters.length}
                </span>
              )}
            </button>

            {/* Filter Panel Dropdown */}
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full mt-2 z-40 w-64 rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-modal space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-brand-border dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-brand-text-primary dark:text-slate-200">Advanced Search Filters</span>
                    <button type="button" onClick={handleClearFilters} className="text-[10px] text-brand-primary dark:text-brand-secondary hover:underline">Clear</button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin text-xs text-brand-text-primary dark:text-slate-350 pr-1">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold py-1 border-b border-brand-border/40 dark:border-slate-800/40">
                      <input
                        type="checkbox"
                        checked={selectedFilters.length === 12}
                        onChange={handleSelectAllFilters}
                        className="rounded border-brand-border bg-white dark:bg-slate-950 text-[#6C1D5F]"
                      />
                      Select All Filters
                    </label>

                    <p className="text-[10px] uppercase font-bold text-brand-text-secondary mt-2 tracking-wider">Entities</p>
                    {[
                      { val: 'courses', lbl: 'Courses' },
                      { val: 'students', lbl: 'Students' },
                      { val: 'instructors', lbl: 'Instructors' },
                      { val: 'categories', lbl: 'Categories' }
                    ].map((item) => (
                      <label key={item.val} className="flex items-center gap-2 cursor-pointer py-0.5">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(item.val)}
                          onChange={() => handleFilterToggle(item.val)}
                          className="rounded border-brand-border bg-white dark:bg-slate-950 text-[#6C1D5F]"
                        />
                        {item.lbl}
                      </label>
                    ))}

                    <p className="text-[10px] uppercase font-bold text-brand-text-secondary mt-2 tracking-wider">Media Types</p>
                    {[
                      { val: 'videos', lbl: 'Videos' },
                      { val: 'pdfs', lbl: 'PDFs' },
                      { val: 'ppts', lbl: 'PPT Slides' },
                      { val: 'assignments', lbl: 'Assignments' }
                    ].map((item) => (
                      <label key={item.val} className="flex items-center gap-2 cursor-pointer py-0.5">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(item.val)}
                          onChange={() => handleFilterToggle(item.val)}
                          className="rounded border-brand-border bg-white dark:bg-slate-950 text-[#6C1D5F]"
                        />
                        {item.lbl}
                      </label>
                    ))}

                    <p className="text-[10px] uppercase font-bold text-brand-text-secondary mt-2 tracking-wider">Statuses</p>
                    {[
                      { val: 'published', lbl: 'Published' },
                      { val: 'draft', lbl: 'Draft' },
                      { val: 'active', lbl: 'Active' },
                      { val: 'inactive', lbl: 'Inactive' }
                    ].map((item) => (
                      <label key={item.val} className="flex items-center gap-2 cursor-pointer py-0.5">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(item.val)}
                          onChange={() => handleFilterToggle(item.val)}
                          className="rounded border-brand-border bg-white dark:bg-slate-950 text-[#6C1D5F]"
                        />
                        {item.lbl}
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Live Search Suggestions Dropdown */}
        <AnimatePresence>
          {searchOpen && searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute left-0 mt-2 z-40 w-full max-w-lg rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-modal overflow-hidden"
            >
              <div className="px-3 py-1.5 border-b border-brand-border dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                Live Search Results ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-brand-text-secondary">
                  No results match "{searchQuery}" under active filters.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto scrollbar-thin">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(item.link)}
                      className="flex w-full items-center gap-3 px-3 py-2 hover:bg-brand-surface dark:hover:bg-slate-800/60 rounded-xl text-left transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 dark:bg-brand-secondary/10 text-[#6C1D5F] dark:text-brand-secondary shrink-0">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-xs text-brand-text-primary dark:text-slate-100 truncate">
                            {highlightText(item.title, searchQuery)}
                          </h4>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-surface dark:bg-slate-800 px-1.5 py-0.5 rounded text-brand-text-secondary dark:text-slate-400">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 truncate mt-0.5">
                          {highlightText(item.subtitle, searchQuery)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions group */}
      <div className="flex items-center gap-5">
        
        {/* Mobile Search Toggle (only visible on mobile) */}
        <div className="md:hidden relative" ref={searchRef}>
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-xl p-2 text-brand-text-secondary hover:bg-brand-surface transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl p-2 text-brand-text-secondary hover:bg-brand-surface transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-650" />}
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-xl p-2 text-brand-text-secondary hover:bg-brand-surface transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-2 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] px-3 py-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">System Notifications</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={markAllNotificationsAsRead} className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline">Mark all read</button>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <button type="button" onClick={clearNotifications} className="text-[10px] font-bold text-slate-400 dark:text-[#CBD5E1] hover:underline">Clear</button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs font-medium text-slate-400 dark:text-[#CBD5E1]">
                    No new notifications.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'p-3 border-b border-slate-100 dark:border-[#334155]/60 last:border-0 text-left transition-colors relative hover:bg-slate-50 dark:hover:bg-[#1E293B]',
                          !notif.read ? 'bg-purple-50/50 dark:bg-purple-950/20' : ''
                        )}
                      >
                        {!notif.read && (
                          <div className="absolute top-4 left-2.5 h-1.5 w-1.5 rounded-full bg-purple-600" />
                        )}
                        <div className="pl-3">
                          <h4 className="font-semibold text-xs text-slate-800 dark:text-[#F8FAFC]">{notif.title}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-[#CBD5E1] mt-0.5">{notif.message}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{formatDateTime(notif.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-full border border-slate-200 dark:border-[#334155] px-3.5 py-1.5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-all cursor-pointer shadow-sm"
          >
            <div className="h-7 w-7 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[10px] font-black shrink-0 border border-white/20 shadow-sm select-none">
              {getInitials(user?.fullName || 'Sarah Chen')}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">
              {user?.fullName || 'Sarah Chen'}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-2.5 shadow-2xl space-y-1 select-none"
              >
                {/* User Header Info Card */}
                <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155]/60 mb-1.5">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-[#F8FAFC] truncate">
                    {user?.fullName || 'Sarah Chen'}
                  </h4>
                  <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-0.5 uppercase tracking-wider">
                    {isStudentView ? 'Student' : 'Admin'}
                  </p>
                </div>

                {/* Profile Link */}
                <Link
                  to={isStudentView ? '/student/profile' : '/admin/settings'}
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#2D3748] transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4 text-[#7C3AED]" />
                  <span>Profile</span>
                </Link>

                {/* Settings Link */}
                <Link
                  to={isStudentView ? '/student/settings' : '/admin/settings'}
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#2D3748] transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-[#7C3AED]" />
                  <span>Settings</span>
                </Link>

                <div className="my-1.5 border-t border-slate-100 dark:border-[#334155]" />

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    if (isStudentView) studentAuth.logout();
                    else adminAuth.logout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left border-0 bg-transparent"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
