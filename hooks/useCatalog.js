'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BRAND_DEFAULTS } from '@/constants';
import { useToast } from '@/hooks/useToast';
import { categoryApi, courseApi, moduleApi, submoduleApi, contentApi } from '@/services/api';

const BRAND_KEY = 'xebia-lms-branding';
const NOTIFICATIONS_KEY = 'xebia-lms-notifications';

function loadNotifications() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* use defaults */
  }
  return [
    { id: 'notif-1', type: 'student_registered', title: 'Student Registered', message: 'Aarav Sharma registered for Python Masterclass', read: false, createdAt: new Date(Date.now() - 3600 * 2000).toISOString() },
    { id: 'notif-2', type: 'course_updated', title: 'Course Updated', message: 'DevOps Pipeline Mastery course was updated by Admin', read: false, createdAt: new Date(Date.now() - 3600 * 8000).toISOString() },
    { id: 'notif-3', type: 'content_uploaded', title: 'Content Uploaded', message: 'Lab Manual.pdf (12.4 MB) added to AWS Solutions Architect', read: true, createdAt: new Date(Date.now() - 3600 * 24000).toISOString() },
    { id: 'notif-4', type: 'course_created', title: 'New Course Added', message: 'New Course: Azure AI Engineer created as Draft', read: true, createdAt: new Date(Date.now() - 3600 * 48000).toISOString() },
  ];
}

function loadBranding() {
  if (typeof window === 'undefined') return BRAND_DEFAULTS;
  try {
    const stored = localStorage.getItem(BRAND_KEY);
    if (stored) return { ...BRAND_DEFAULTS, ...JSON.parse(stored) };
  } catch {
    /* use defaults */
  }
  return BRAND_DEFAULTS;
}

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [data, setData] = useState({ categories: [], courses: [] });
  const [branding, setBrandingState] = useState(BRAND_DEFAULTS);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Fetch initial data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, coursesRes] = await Promise.all([
          categoryApi.list(),
          courseApi.list(),
        ]);
        setData({
          categories: categoriesRes.data || [],
          courses: coursesRes.data || [],
        });
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        showToast('Failed to load data from server', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setBrandingState(loadBranding());
    setNotifications(loadNotifications());
  }, [showToast]);

  const addNotification = useCallback((type, title, message) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const setBranding = useCallback((updates) => {
    setBrandingState((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(BRAND_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // ── Categories ──
  const getCategory = useCallback(
    (id) => data.categories.find((c) => c.id === Number(id) || c.id === id),
    [data.categories]
  );

  const createCategory = useCallback(async (payload) => {
    try {
      const response = await categoryApi.create(payload);
      const cat = response.data;
      setData((prev) => ({ ...prev, categories: [...prev.categories, cat] }));
      return cat;
    } catch (error) {
      console.error('Failed to create category:', error);
      showToast('Failed to create category', 'error');
      return null;
    }
  }, [showToast]);

  const updateCategory = useCallback(async (id, updates) => {
    try {
      const response = await categoryApi.update(id, updates);
      const updatedCat = response.data;
      setData((prev) => ({
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === id ? updatedCat : c
        ),
      }));
    } catch (error) {
      console.error('Failed to update category:', error);
      showToast('Failed to update category', 'error');
    }
  }, [showToast]);

  const deleteCategory = useCallback(async (id) => {
    try {
      await categoryApi.delete(id);
      setData((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete category:', error);
      showToast('Failed to delete category', 'error');
    }
  }, [showToast]);

  // ── Courses ──
  const getCourse = useCallback(
    (id) => data.courses.find((c) => c.id === Number(id) || c.id === id),
    [data.courses]
  );

  const getCoursesByCategory = useCallback(
    (categoryId) => data.courses.filter((c) => c.categoryId === Number(categoryId) || c.categoryId === categoryId),
    [data.courses]
  );

  const createCourse = useCallback(async (payload) => {
    try {
      const response = await courseApi.create(payload);
      const course = response.data;
      setData((prev) => ({
        ...prev,
        courses: [...prev.courses, course],
      }));
      return course;
    } catch (error) {
      console.error('Failed to create course:', error);
      showToast('Failed to create course', 'error');
      return null;
    }
  }, [showToast]);

  const updateCourse = useCallback(async (id, updates) => {
    try {
      const response = await courseApi.update(id, updates);
      const updatedCourse = response.data;
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === id ? updatedCourse : c
        ),
      }));
    } catch (error) {
      console.error('Failed to update course:', error);
      showToast('Failed to update course', 'error');
    }
  }, [showToast]);

  const deleteCourse = useCallback(async (id) => {
    try {
      await courseApi.delete(id);
      setData((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete course:', error);
      showToast('Failed to delete course', 'error');
    }
  }, [showToast]);

  // ── Modules ──
  const addModule = useCallback(async (courseId, payload = {}) => {
    try {
      const response = await moduleApi.create(payload);
      const mod = response.data;
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => {
          if (c.id !== courseId) return c;
          return { ...c, modules: [...(c.modules || []), mod] };
        }),
      }));
      return mod;
    } catch (error) {
      console.error('Failed to create module:', error);
      showToast('Failed to create module', 'error');
      return null;
    }
  }, [showToast]);

  const updateModule = useCallback(async (id, updates) => {
    try {
      const response = await moduleApi.update(id, updates);
      const updatedModule = response.data;
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) =>
            m.id === id ? updatedModule : m
          ),
        })),
      }));
    } catch (error) {
      console.error('Failed to update module:', error);
      showToast('Failed to update module', 'error');
    }
  }, [showToast]);

  const deleteModule = useCallback(async (id) => {
    try {
      await moduleApi.delete(id);
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).filter((m) => m.id !== id),
        })),
      }));
    } catch (error) {
      console.error('Failed to delete module:', error);
      showToast('Failed to delete module', 'error');
    }
  }, [showToast]);

  // ── Submodules ──
  const addSubmodule = useCallback(async (moduleId, payload = {}) => {
    try {
      const response = await submoduleApi.create(payload);
      const sub = response.data;
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => {
            if (m.id !== moduleId) return m;
            return { ...m, submodules: [...(m.submodules || []), sub] };
          }),
        })),
      }));
      return sub;
    } catch (error) {
      console.error('Failed to create submodule:', error);
      showToast('Failed to create submodule', 'error');
      return null;
    }
  }, [showToast]);

  const updateSubmodule = useCallback(async (id, updates) => {
    try {
      const response = await submoduleApi.update(id, updates);
      const updatedSubmodule = response.data;
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            submodules: (m.submodules || []).map((s) =>
              s.id === id ? updatedSubmodule : s
            ),
          })),
        })),
      }));
    } catch (error) {
      console.error('Failed to update submodule:', error);
      showToast('Failed to update submodule', 'error');
    }
  }, [showToast]);

  const deleteSubmodule = useCallback(async (id) => {
    try {
      await submoduleApi.delete(id);
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            submodules: (m.submodules || []).filter((s) => s.id !== id),
          })),
        })),
      }));
    } catch (error) {
      console.error('Failed to delete submodule:', error);
      showToast('Failed to delete submodule', 'error');
    }
  }, [showToast]);

  // ── Content ──
  const addContent = useCallback(async (submoduleId, payload) => {
    try {
      const response = await contentApi.create(payload);
      const item = response.data;
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            submodules: (m.submodules || []).map((s) => {
              if (s.id !== submoduleId) return s;
              return { ...s, contents: [...(s.contents || []), item] };
            }),
          })),
        })),
      }));
      return item;
    } catch (error) {
      console.error('Failed to create content:', error);
      showToast('Failed to create content', 'error');
      return null;
    }
  }, [showToast]);

  const updateContent = useCallback(async (id, updates) => {
    try {
      const response = await contentApi.update(id, updates);
      const updatedContent = response.data;
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            submodules: (m.submodules || []).map((s) => ({
              ...s,
              contents: (s.contents || []).map((ct) =>
                ct.id === id ? updatedContent : ct
              ),
            })),
          })),
        })),
      }));
    } catch (error) {
      console.error('Failed to update content:', error);
      showToast('Failed to update content', 'error');
    }
  }, [showToast]);

  const deleteContent = useCallback(async (id) => {
    try {
      await contentApi.delete(id);
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            submodules: (m.submodules || []).map((s) => ({
              ...s,
              contents: (s.contents || []).filter((ct) => ct.id !== id),
            })),
          })),
        })),
      }));
    } catch (error) {
      console.error('Failed to delete content:', error);
      showToast('Failed to delete content', 'error');
    }
  }, [showToast]);

  const mediaLibrary = useMemo(() => {
    const items = [];
    data.courses.forEach((course) => {
      (course.modules || []).forEach((mod) => {
        (mod.submodules || []).forEach((sub) => {
          (sub.contents || []).forEach((content) => {
            if (content.type !== 'link' && content.type !== 'notes') {
              items.push({
                id: `${course.id}-${mod.id}-${sub.id}-${content.id}`,
                title: content.title,
                type: content.type,
                fileSize: content.fileSize,
                fileUrl: content.fileUrl,
                courseId: course.id,
                courseName: course.title,
                uploadedAt: content.createdAt,
                updatedAt: content.updatedAt,
              });
            }
          });
        });
      });
    });
    return items;
  }, [data.courses]);

  const value = useMemo(
    () => ({
      ...data,
      mediaLibrary,
      notifications,
      addNotification,
      markAllNotificationsAsRead,
      clearNotifications,
      loading,
      branding,
      setBranding,
      getCategory,
      getCourse,
      getCoursesByCategory,
      createCategory,
      updateCategory,
      deleteCategory,
      createCourse,
      updateCourse,
      deleteCourse,
      addModule,
      updateModule,
      deleteModule,
      addSubmodule,
      updateSubmodule,
      deleteSubmodule,
      addContent,
      updateContent,
      deleteContent,
    }),
    [
      data, mediaLibrary, notifications, addNotification, markAllNotificationsAsRead, clearNotifications, loading, branding, setBranding,
      getCategory, getCourse, getCoursesByCategory,
      createCategory, updateCategory, deleteCategory,
      createCourse, updateCourse, deleteCourse,
      addModule, updateModule, deleteModule,
      addSubmodule, updateSubmodule, deleteSubmodule,
      addContent, updateContent, deleteContent,
    ]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
