'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BRAND_DEFAULTS } from '@/constants';
import { useToast } from '@/hooks/useToast';
import { categoryApi, courseApi, moduleApi, submoduleApi, contentApi } from '@/services/api';
import { initialMockData } from '@/services/mockData';

const BRAND_KEY = 'xebia-lms-branding';
const NOTIFICATIONS_KEY = 'xebia-lms-notifications';

// ── API Response Normalizers ──────────────────────────────────────────────────
// The backend returns nested objects (e.g. category: { id, name }) but the
// frontend expects flat IDs (e.g. categoryId). These normalizers fix the shape
// so the rest of the UI works consistently regardless of data source.

function normalizeContent(ct) {
  if (!ct) return ct;
  return {
    ...ct,
    submoduleId: ct.submoduleId ?? ct.submodule?.id ?? null,
  };
}

function normalizeSubmodule(sub) {
  if (!sub) return sub;
  return {
    ...sub,
    moduleId: sub.moduleId ?? sub.module?.id ?? null,
    contents: (sub.contents || []).map(normalizeContent),
  };
}

function normalizeModule(mod) {
  if (!mod) return mod;
  return {
    ...mod,
    courseId: mod.courseId ?? mod.course?.id ?? null,
    submodules: (mod.submodules || []).map(normalizeSubmodule),
  };
}

function normalizeCourse(course) {
  if (!course) return course;
  return {
    ...course,
    // Backend returns category as a nested object; frontend expects flat categoryId
    categoryId: course.categoryId ?? course.category?.id ?? null,
    modules: (course.modules || []).map(normalizeModule),
    status: course.status ?? (course.isPublished ? 'published' : 'draft'),
    difficulty: course.difficulty ?? course.level ?? 'Beginner',
  };
}
// ─────────────────────────────────────────────────────────────────────────────

function loadNotifications() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* use defaults */ }
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
  } catch { /* use defaults */ }
  return BRAND_DEFAULTS;
}

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [data, setData] = useState({ categories: [], courses: [] });
  // dataRef always holds the latest state so callbacks never close over stale data
  const dataRef = useRef({ categories: [], courses: [] });
  const [branding, setBrandingState] = useState(BRAND_DEFAULTS);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [students] = useState(initialMockData.students || []);
  const [instructors] = useState(initialMockData.instructors || []);
  const { showToast } = useToast();

  // Keep ref in sync with state
  useEffect(() => { dataRef.current = data; }, [data]);

  // Fetch initial data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, coursesRes] = await Promise.all([
          categoryApi.list(),
          courseApi.list(),
        ]);
        setData({
          categories: categoriesRes.data || [],
          courses: (coursesRes.data || []).map(normalizeCourse),
        });
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        showToast('Failed to load data from server', 'error');
      } finally {
        setLoading(false);
        setHydrated(true);
      }
    };

    fetchData();
    setBrandingState(loadBranding());
    setNotifications(loadNotifications());
  }, [showToast]);

  // ── Notifications ──
  const addNotification = useCallback((type, title, message) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type, title, message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // ── Branding ──
  const setBranding = useCallback((updates) => {
    setBrandingState((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(BRAND_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && branding) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor);
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor);
    }
  }, [branding]);

  // ── Categories ──
  const getCategory = useCallback((id) =>
    dataRef.current.categories.find((c) => Number(c.id) === Number(id) || c.id === id),
  []);

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
          Number(c.id) === Number(id) ? updatedCat : c
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
        categories: prev.categories.filter((c) => Number(c.id) !== Number(id)),
      }));
    } catch (error) {
      console.error('Failed to delete category:', error);
      showToast('Failed to delete category', 'error');
    }
  }, [showToast]);

  // ── Courses ──
  const getCourse = useCallback((id) =>
    dataRef.current.courses.find((c) => Number(c.id) === Number(id) || c.id === id),
  []);

  const getCoursesByCategory = useCallback((categoryId) =>
    dataRef.current.courses.filter(
      (c) => Number(c.categoryId) === Number(categoryId) || c.categoryId === categoryId
    ),
  []);

  const createCourse = useCallback(async (payload) => {
    try {
      const response = await courseApi.create(payload);
      const course = normalizeCourse(response.data);
      setData((prev) => ({ ...prev, courses: [...prev.courses, course] }));
      return course;
    } catch (error) {
      console.error('Failed to create course:', error);
      showToast('Failed to create course', 'error');
      return null;
    }
  }, [showToast]);

  const updateCourse = useCallback(async (id, updates) => {
    const existing = dataRef.current.courses.find((c) => Number(c.id) === Number(id));
    if (!existing) {
      showToast('Course not found', 'error');
      return;
    }

    try {
      const merged = { ...existing, ...updates };

      const payload = {
        title: merged.title,
        slug: merged.slug || merged.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `course-${id}`,
        description: merged.description || '',
        shortDescription: merged.shortDescription || '',
        level: merged.difficulty || merged.level || 'Beginner',
        language: merged.language || 'English',
        duration: merged.duration || '4 weeks',
        icon: merged.icon || '',
        thumbnail: merged.thumbnail || '',
        bannerImage: merged.bannerImage || '',
        isActive: merged.isActive !== undefined ? merged.isActive : true,
        isFeatured: merged.isFeatured !== undefined ? merged.isFeatured : false,
        isPublished: merged.status === 'published' || merged.isPublished === true,
        categoryId: Number(merged.categoryId),
        metaTitle: merged.metaTitle || merged.title || '',
        metaDescription: merged.metaDescription || merged.shortDescription || '',
        metaKeywords: merged.metaKeywords || '',
        canonicalUrl: merged.canonicalUrl || '',
        primaryKeyword: merged.primaryKeyword || '',
        secondaryKeywords: merged.secondaryKeywords || '',
        focusKeywords: merged.focusKeywords || '',
        robots: merged.robots || 'index, follow',
        author: merged.author || merged.createdBy || 'Admin',
        seoCategory: merged.seoCategory || '',
        seoTags: merged.seoTags || '',
        ogTitle: merged.ogTitle || merged.title || '',
        ogDescription: merged.ogDescription || merged.shortDescription || '',
        ogImage: merged.ogImage || merged.thumbnail || '',
        ogUrl: merged.ogUrl || '',
        ogType: merged.ogType || 'website',
        twitterTitle: merged.twitterTitle || merged.title || '',
        twitterDescription: merged.twitterDescription || merged.shortDescription || '',
        twitterImage: merged.twitterImage || merged.thumbnail || '',
        twitterCard: merged.twitterCard || 'summary_large_image',
        schemaMarkup: merged.schemaMarkup || '',
        faqSchema: merged.faqSchema || '',
        breadcrumbSchema: merged.breadcrumbSchema || '',
        youtubeVideoUrl: merged.youtubeVideoUrl || '',
        previewVideoUrl: merged.previewVideoUrl || '',
        learningOutcomes: merged.learningOutcomes || '',
        prerequisites: merged.prerequisites || '',
        targetAudience: merged.targetAudience || '',
        courseHighlights: merged.courseHighlights || '',
        careerOpportunities: merged.careerOpportunities || '',
        searchIntent: merged.searchIntent || '',
        semanticKeywords: merged.semanticKeywords || '',
        relatedTopics: merged.relatedTopics || '',
        searchSynonyms: merged.searchSynonyms || '',
        faqContent: merged.faqContent || '',
        customHeadScript: merged.customHeadScript || '',
        customBodyScript: merged.customBodyScript || '',
        totalViews: merged.totalViews || 0,
        totalClicks: merged.totalClicks || 0,
        ctr: merged.ctr || 0.0,
        seoScore: merged.seoScore || 0,
        allowIndexing: merged.allowIndexing !== undefined ? merged.allowIndexing : true,
        showInSearch: merged.showInSearch !== undefined ? merged.showInSearch : true,
      };

      const response = await courseApi.update(Number(id), payload);
      const updatedCourse = normalizeCourse(response.data);
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) =>
          Number(c.id) === Number(id)
            ? { ...c, ...updatedCourse, modules: c.modules || [] }
            : c
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
        courses: prev.courses.filter((c) => Number(c.id) !== Number(id)),
      }));
    } catch (error) {
      console.error('Failed to delete course:', error);
      showToast('Failed to delete course', 'error');
    }
  }, [showToast]);

  // ── Modules ──
  // Lookup helper — reads from ref so it's always current
  const _findModule = useCallback((moduleId) => {
    for (const c of dataRef.current.courses) {
      const m = (c.modules || []).find((m) => Number(m.id) === Number(moduleId));
      if (m) return { course: c, module: m };
    }
    return null;
  }, []);

  const addModule = useCallback(async (courseId, payload = {}) => {
    try {
      // Determine order from current count so new modules go at the end
      const course = dataRef.current.courses.find((c) => Number(c.id) === Number(courseId));
      const currentCount = (course?.modules || []).length;

      // ModuleRequestDTO requires: title (NotBlank) + courseId (NotNull)
      const body = {
        courseId: Number(courseId),
        title: payload.title || 'Untitled Module',
        description: payload.description || '',
        moduleOrder: payload.moduleOrder ?? (currentCount + 1),
        isActive: payload.isActive !== undefined ? payload.isActive : true,
      };

      const response = await moduleApi.create(body);
      const mod = normalizeModule(response.data);
      if (!mod.submodules) mod.submodules = [];

      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => {
          if (Number(c.id) !== Number(courseId)) return c;
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

  const updateModule = useCallback(async (courseIdOrId, idOrUpdates, optionalUpdates) => {
    try {
      let id, updates;
      if (optionalUpdates !== undefined) {
        // Called as updateModule(courseId, moduleId, updates)
        id = idOrUpdates;
        updates = optionalUpdates;
      } else {
        // Called as updateModule(moduleId, updates)
        id = courseIdOrId;
        updates = idOrUpdates;
      }

      // Find existing module so we can merge and send a COMPLETE payload
      // (backend ModuleRequestDTO requires courseId + title on every PUT)
      const found = _findModule(id);
      if (!found) {
        showToast('Module not found', 'error');
        return null;
      }
      const { course, module: existing } = found;

      const body = {
        courseId: Number(course.id),
        title: updates.title ?? existing.title ?? 'Untitled Module',
        description: updates.description ?? existing.description ?? '',
        moduleOrder: updates.moduleOrder ?? existing.moduleOrder ?? 1,
        isActive: updates.isActive ?? existing.isActive ?? true,
      };

      const response = await moduleApi.update(Number(id), body);
      const updatedModule = normalizeModule(response.data);

      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => {
            if (Number(m.id) !== Number(id)) return m;
            return { ...m, ...updatedModule, submodules: m.submodules || updatedModule.submodules || [] };
          }),
        })),
      }));
      return updatedModule;
    } catch (error) {
      console.error('Failed to update module:', error);
      showToast('Failed to update module', 'error');
      return null;
    }
  }, [showToast, _findModule]);

  const deleteModule = useCallback(async (courseIdOrId, optionalId) => {
    try {
      const id = optionalId !== undefined ? optionalId : courseIdOrId;
      await moduleApi.delete(id);
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).filter((m) => Number(m.id) !== Number(id)),
        })),
      }));
    } catch (error) {
      console.error('Failed to delete module:', error);
      showToast('Failed to delete module', 'error');
    }
  }, [showToast]);

  // Reorder is LOCAL-ONLY — backend PUT requires a full ModuleRequestDTO payload
  // (courseId + title are @NotNull/@NotBlank) and there is no dedicated reorder endpoint.
  const reorderModules = useCallback((courseId, orderedIds) => {
    setData((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => {
        if (Number(c.id) !== Number(courseId)) return c;
        const map = new Map((c.modules || []).map((m) => [String(m.id), m]));
        const reordered = orderedIds
          .map((id, index) => {
            const m = map.get(String(id));
            return m ? { ...m, moduleOrder: index + 1 } : null;
          })
          .filter(Boolean);
        return { ...c, modules: reordered };
      }),
    }));
  }, []);

  // ── Submodules ──
  const _findSubmodule = useCallback((submoduleId) => {
    for (const c of dataRef.current.courses) {
      for (const m of (c.modules || [])) {
        const s = (m.submodules || []).find((s) => Number(s.id) === Number(submoduleId));
        if (s) return { course: c, module: m, submodule: s };
      }
    }
    return null;
  }, []);

  const addSubmodule = useCallback(async (courseIdOrModuleId, moduleIdOrPayload, optionalPayload = {}) => {
    try {
      let moduleId, payload;
      if (typeof moduleIdOrPayload === 'number' || typeof moduleIdOrPayload === 'string') {
        // Called as addSubmodule(courseId, moduleId, payload?)
        moduleId = moduleIdOrPayload;
        payload = optionalPayload;
      } else {
        // Called as addSubmodule(moduleId, payload?)
        moduleId = courseIdOrModuleId;
        payload = moduleIdOrPayload || {};
      }

      // Compute order from current submodule count
      let currentCount = 0;
      for (const c of dataRef.current.courses) {
        const m = (c.modules || []).find((m) => Number(m.id) === Number(moduleId));
        if (m) { currentCount = (m.submodules || []).length; break; }
      }

      // SubmoduleRequestDTO requires: title (NotBlank) + moduleId (NotNull) + slug (NotBlank)
      const title = payload.title || 'Untitled Submodule';
      const slug = payload.slug || `submodule-${Date.now()}`;
      const body = {
        moduleId: Number(moduleId),
        title,
        slug,
        description: payload.description || '',
        submoduleOrder: payload.submoduleOrder ?? (currentCount + 1),
        isActive: payload.isActive !== undefined ? payload.isActive : true,
      };

      const response = await submoduleApi.create(body);
      const sub = normalizeSubmodule(response.data);
      if (!sub.contents) sub.contents = [];

      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => {
            if (Number(m.id) !== Number(moduleId)) return m;
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

  const updateSubmodule = useCallback(async (arg1, arg2, arg3, arg4) => {
    try {
      let id, updates;
      if (arg4 !== undefined) { id = arg3; updates = arg4; }
      else if (arg3 !== undefined) { id = arg2; updates = arg3; }
      else { id = arg1; updates = arg2; }

      // Find existing submodule to build complete payload
      // SubmoduleRequestDTO requires: title (NotBlank) + moduleId (NotNull) + slug (NotBlank)
      const found = _findSubmodule(id);
      if (!found) {
        showToast('Submodule not found', 'error');
        return null;
      }
      const { module: parentModule, submodule: existing } = found;

      const body = {
        moduleId: Number(parentModule.id),
        title: updates.title ?? existing.title ?? 'Untitled Submodule',
        slug: updates.slug ?? existing.slug ?? `submodule-${existing.id}`,
        description: updates.description ?? existing.description ?? '',
        submoduleOrder: updates.submoduleOrder ?? existing.submoduleOrder ?? 1,
        isActive: updates.isActive ?? existing.isActive ?? true,
        metaTitle: updates.metaTitle ?? existing.metaTitle ?? null,
        metaDescription: updates.metaDescription ?? existing.metaDescription ?? null,
        canonicalUrl: updates.canonicalUrl ?? existing.canonicalUrl ?? null,
        ogTitle: updates.ogTitle ?? existing.ogTitle ?? null,
        ogDescription: updates.ogDescription ?? existing.ogDescription ?? null,
        ogImage: updates.ogImage ?? existing.ogImage ?? null,
      };

      const response = await submoduleApi.update(Number(id), body);
      const updatedSub = normalizeSubmodule(response.data);

      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            submodules: (m.submodules || []).map((s) => {
              if (Number(s.id) !== Number(id)) return s;
              return { ...s, ...updatedSub, contents: s.contents || updatedSub.contents || [] };
            }),
          })),
        })),
      }));
      return updatedSub;
    } catch (error) {
      console.error('Failed to update submodule:', error);
      showToast('Failed to update submodule', 'error');
      return null;
    }
  }, [showToast, _findSubmodule]);

  const deleteSubmodule = useCallback(async (arg1, arg2, arg3) => {
    try {
      const id = arg3 !== undefined ? arg3 : (arg2 !== undefined ? arg2 : arg1);
      await submoduleApi.delete(id);
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            submodules: (m.submodules || []).filter((s) => Number(s.id) !== Number(id)),
          })),
        })),
      }));
    } catch (error) {
      console.error('Failed to delete submodule:', error);
      showToast('Failed to delete submodule', 'error');
    }
  }, [showToast]);

  // Reorder is LOCAL-ONLY — same reason as reorderModules
  const reorderSubmodules = useCallback((courseId, moduleId, orderedIds) => {
    setData((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => {
        if (Number(c.id) !== Number(courseId)) return c;
        return {
          ...c,
          modules: (c.modules || []).map((m) => {
            if (Number(m.id) !== Number(moduleId)) return m;
            const map = new Map((m.submodules || []).map((s) => [String(s.id), s]));
            const reordered = orderedIds
              .map((id, index) => {
                const s = map.get(String(id));
                return s ? { ...s, submoduleOrder: index + 1 } : null;
              })
              .filter(Boolean);
            return { ...m, submodules: reordered };
          }),
        };
      }),
    }));
  }, []);

  // ── Content ──
  const _findContent = useCallback((contentId) => {
    for (const c of dataRef.current.courses) {
      for (const m of (c.modules || [])) {
        for (const s of (m.submodules || [])) {
          const ct = (s.contents || []).find((ct) => Number(ct.id) === Number(contentId));
          if (ct) return { course: c, module: m, submodule: s, content: ct };
        }
      }
    }
    return null;
  }, []);

  const addContent = useCallback(async (arg1, arg2, arg3, arg4) => {
    try {
      let submoduleId, payload;
      if (arg4 !== undefined) { submoduleId = arg3; payload = arg4; }
      else if (arg3 !== undefined) { submoduleId = arg2; payload = arg3; }
      else { submoduleId = arg1; payload = arg2; }

      // Compute order from current content count
      let currentCount = 0;
      outer: for (const c of dataRef.current.courses) {
        for (const m of (c.modules || [])) {
          const s = (m.submodules || []).find((s) => Number(s.id) === Number(submoduleId));
          if (s) { currentCount = (s.contents || []).length; break outer; }
        }
      }

      // ContentRequestDTO requires: type (NotBlank) + submoduleId (NotNull)
      const body = {
        submoduleId: Number(submoduleId),
        type: payload.type || 'text',
        title: payload.title || 'Untitled Content',
        text: payload.text || payload.markdown || '',
        code: payload.code || '',
        language: payload.language || '',
        videoUrl: payload.videoUrl || '',
        imageUrl: payload.imageUrl || '',
        alt: payload.alt || '',
        caption: payload.caption || '',
        headingLevel: payload.headingLevel || 1,
        contentOrder: payload.contentOrder ?? (currentCount + 1),
        isActive: payload.isActive !== undefined ? payload.isActive : true,
      };

      const response = await contentApi.create(body);
      const item = normalizeContent(response.data);

      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            submodules: (m.submodules || []).map((s) => {
              if (Number(s.id) !== Number(submoduleId)) return s;
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

  const updateContent = useCallback(async (arg1, arg2, arg3, arg4, arg5) => {
    try {
      let id, updates;
      if (arg5 !== undefined) { id = arg4; updates = arg5; }
      else if (arg4 !== undefined) { id = arg3; updates = arg4; }
      else if (arg3 !== undefined) { id = arg2; updates = arg3; }
      else { id = arg1; updates = arg2; }

      // Find existing content to build complete payload
      // ContentRequestDTO requires: type (NotBlank) + submoduleId (NotNull)
      const found = _findContent(id);
      if (!found) {
        showToast('Content not found', 'error');
        return null;
      }
      const { submodule: parentSub, content: existing } = found;

      const body = {
        submoduleId: Number(parentSub.id),
        type: updates.type ?? existing.type ?? 'text',
        title: updates.title ?? existing.title ?? '',
        text: updates.text ?? updates.markdown ?? existing.text ?? '',
        code: updates.code ?? existing.code ?? '',
        language: updates.language ?? existing.language ?? '',
        videoUrl: updates.videoUrl ?? existing.videoUrl ?? '',
        imageUrl: updates.imageUrl ?? existing.imageUrl ?? '',
        alt: updates.alt ?? existing.alt ?? '',
        caption: updates.caption ?? existing.caption ?? '',
        headingLevel: updates.headingLevel ?? existing.headingLevel ?? 1,
        contentOrder: updates.contentOrder ?? existing.contentOrder ?? 1,
        isActive: updates.isActive ?? existing.isActive ?? true,
      };

      const response = await contentApi.update(Number(id), body);
      const updatedContent = normalizeContent(response.data);

      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            submodules: (m.submodules || []).map((s) => ({
              ...s,
              contents: (s.contents || []).map((ct) => {
                if (Number(ct.id) !== Number(id)) return ct;
                return { ...ct, ...updatedContent };
              }),
            })),
          })),
        })),
      }));
      return updatedContent;
    } catch (error) {
      console.error('Failed to update content:', error);
      showToast('Failed to update content', 'error');
      return null;
    }
  }, [showToast, _findContent]);

  const deleteContent = useCallback(async (arg1, arg2, arg3, arg4) => {
    try {
      const id = arg4 !== undefined ? arg4 : (arg3 !== undefined ? arg3 : (arg2 !== undefined ? arg2 : arg1));
      await contentApi.delete(id);
      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            submodules: (m.submodules || []).map((s) => ({
              ...s,
              contents: (s.contents || []).filter((ct) => Number(ct.id) !== Number(id)),
            })),
          })),
        })),
      }));
    } catch (error) {
      console.error('Failed to delete content:', error);
      showToast('Failed to delete content', 'error');
    }
  }, [showToast]);

  const duplicateCourse = useCallback(async (courseId, options = {}) => {
    const course = dataRef.current.courses.find((c) => Number(c.id) === Number(courseId));
    if (!course) return null;
    try {
      const payload = {
        categoryId: course.categoryId,
        title: `Copy of ${course.title}`,
        slug: `${course.slug}-copy-${Date.now()}`,
        description: course.description,
        shortDescription: course.shortDescription,
        technology: course.technology,
        difficulty: course.difficulty,
        duration: course.duration,
        language: course.language,
        status: 'draft',
      };
      const response = await courseApi.create(payload);
      let newCourse = normalizeCourse(response.data);
      newCourse.modules = [];

      if (options.withContent && course.modules) {
        for (const mod of course.modules) {
          const modPayload = {
            courseId: Number(newCourse.id),
            title: mod.title,
            description: mod.description || '',
            moduleOrder: mod.moduleOrder,
            isActive: mod.isActive,
          };
          const modRes = await moduleApi.create(modPayload);
          const newMod = normalizeModule(modRes.data);
          newMod.submodules = [];

          if (mod.submodules) {
            for (const sub of mod.submodules) {
              const subPayload = {
                moduleId: Number(newMod.id),
                title: sub.title,
                slug: `${sub.slug}-copy-${Date.now()}`,
                description: sub.description || '',
                submoduleOrder: sub.submoduleOrder,
                isActive: sub.isActive,
              };
              const subRes = await submoduleApi.create(subPayload);
              const newSub = normalizeSubmodule(subRes.data);
              newSub.contents = [];

              if (sub.contents) {
                for (const ct of sub.contents) {
                  const ctPayload = {
                    submoduleId: Number(newSub.id),
                    type: ct.type,
                    title: ct.title,
                    text: ct.text || ct.markdown || '',
                    code: ct.code || '',
                    language: ct.language || '',
                    videoUrl: ct.videoUrl || '',
                    imageUrl: ct.imageUrl || '',
                    alt: ct.alt || '',
                    caption: ct.caption || '',
                    headingLevel: ct.headingLevel || 1,
                    contentOrder: ct.contentOrder,
                    isActive: ct.isActive,
                  };
                  const ctRes = await contentApi.create(ctPayload);
                  const newCt = normalizeContent(ctRes.data);
                  newSub.contents.push(newCt);
                }
              }
              newMod.submodules.push(newSub);
            }
          }
          newCourse.modules.push(newMod);
        }
      }

      setData((prev) => ({
        ...prev,
        courses: [...prev.courses, newCourse],
      }));
      addNotification('course_created', 'Course Duplicated', `"${newCourse.title}" was duplicated successfully.`);
      return newCourse;
    } catch (error) {
      console.error('Failed to duplicate course:', error);
      showToast('Failed to duplicate course', 'error');
      return null;
    }
  }, [addNotification, showToast]);

  const duplicateModule = useCallback(async (courseId, moduleId) => {
    const course = dataRef.current.courses.find((c) => Number(c.id) === Number(courseId));
    const mod = (course?.modules || []).find((m) => Number(m.id) === Number(moduleId));
    if (!mod) return null;
    try {
      const payload = {
        courseId: Number(courseId),
        title: `Copy of ${mod.title}`,
        description: mod.description || '',
        moduleOrder: (course.modules?.length || 0) + 1,
        isActive: mod.isActive,
      };
      const response = await moduleApi.create(payload);
      const newMod = normalizeModule(response.data);
      newMod.submodules = [];

      if (mod.submodules) {
        for (const sub of mod.submodules) {
          const subPayload = {
            moduleId: Number(newMod.id),
            title: sub.title,
            slug: `${sub.slug}-copy-${Date.now()}`,
            description: sub.description || '',
            submoduleOrder: sub.submoduleOrder,
            isActive: sub.isActive,
          };
          const subRes = await submoduleApi.create(subPayload);
          const newSub = normalizeSubmodule(subRes.data);
          newSub.contents = [];

          if (sub.contents) {
            for (const ct of sub.contents) {
              const ctPayload = {
                submoduleId: Number(newSub.id),
                type: ct.type,
                title: ct.title,
                text: ct.text || ct.markdown || '',
                code: ct.code || '',
                language: ct.language || '',
                videoUrl: ct.videoUrl || '',
                imageUrl: ct.imageUrl || '',
                alt: ct.alt || '',
                caption: ct.caption || '',
                headingLevel: ct.headingLevel || 1,
                contentOrder: ct.contentOrder,
                isActive: ct.isActive,
              };
              const ctRes = await contentApi.create(ctPayload);
              const newCt = normalizeContent(ctRes.data);
              newSub.contents.push(newCt);
            }
          }
          newMod.submodules.push(newSub);
        }
      }

      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => {
          if (Number(c.id) !== Number(courseId)) return c;
          return { ...c, modules: [...(c.modules || []), newMod] };
        }),
      }));
      return newMod;
    } catch (error) {
      console.error('Failed to duplicate module:', error);
      showToast('Failed to duplicate module', 'error');
      return null;
    }
  }, [showToast]);

  const duplicateSubmodule = useCallback(async (courseId, moduleId, submoduleId) => {
    const course = dataRef.current.courses.find((c) => Number(c.id) === Number(courseId));
    const mod = (course?.modules || []).find((m) => Number(m.id) === Number(moduleId));
    const sub = (mod?.submodules || []).find((s) => Number(s.id) === Number(submoduleId));
    if (!sub) return null;
    try {
      const payload = {
        moduleId: Number(moduleId),
        title: `Copy of ${sub.title}`,
        slug: `${sub.slug}-copy-${Date.now()}`,
        description: sub.description || '',
        submoduleOrder: (mod.submodules?.length || 0) + 1,
        isActive: sub.isActive,
      };
      const response = await submoduleApi.create(payload);
      const newSub = normalizeSubmodule(response.data);
      newSub.contents = [];

      if (sub.contents) {
        for (const ct of sub.contents) {
          const ctPayload = {
            submoduleId: Number(newSub.id),
            type: ct.type,
            title: ct.title,
            text: ct.text || ct.markdown || '',
            code: ct.code || '',
            language: ct.language || '',
            videoUrl: ct.videoUrl || '',
            imageUrl: ct.imageUrl || '',
            alt: ct.alt || '',
            caption: ct.caption || '',
            headingLevel: ct.headingLevel || 1,
            contentOrder: ct.contentOrder,
            isActive: ct.isActive,
          };
          const ctRes = await contentApi.create(ctPayload);
          const newCt = normalizeContent(ctRes.data);
          newSub.contents.push(newCt);
        }
      }

      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => {
            if (Number(m.id) !== Number(moduleId)) return m;
            return { ...m, submodules: [...(m.submodules || []), newSub] };
          }),
        })),
      }));
      return newSub;
    } catch (error) {
      console.error('Failed to duplicate submodule:', error);
      showToast('Failed to duplicate submodule', 'error');
      return null;
    }
  }, [showToast]);

  const duplicateContent = useCallback(async (courseId, moduleId, submoduleId, contentId) => {
    const course = dataRef.current.courses.find((c) => Number(c.id) === Number(courseId));
    const mod = (course?.modules || []).find((m) => Number(m.id) === Number(moduleId));
    const sub = (mod?.submodules || []).find((s) => Number(s.id) === Number(submoduleId));
    const ct = (sub?.contents || []).find((x) => Number(x.id) === Number(contentId));
    if (!ct) return null;
    try {
      const payload = {
        submoduleId: Number(submoduleId),
        type: ct.type,
        title: `Copy of ${ct.title}`,
        text: ct.text || ct.markdown || '',
        code: ct.code || '',
        language: ct.language || '',
        videoUrl: ct.videoUrl || '',
        imageUrl: ct.imageUrl || '',
        alt: ct.alt || '',
        caption: ct.caption || '',
        headingLevel: ct.headingLevel || 1,
        contentOrder: (sub.contents?.length || 0) + 1,
        isActive: ct.isActive,
      };
      const response = await contentApi.create(payload);
      const newCt = normalizeContent(response.data);

      setData((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            submodules: (m.submodules || []).map((s) => {
              if (Number(s.id) !== Number(submoduleId)) return s;
              return { ...s, contents: [...(s.contents || []), newCt] };
            }),
          })),
        })),
      }));
      return newCt;
    } catch (error) {
      console.error('Failed to duplicate content:', error);
      showToast('Failed to duplicate content', 'error');
      return null;
    }
  }, [showToast]);

  const reorderContent = useCallback((courseId, moduleId, submoduleId, orderedIds) => {
    setData((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => {
        if (Number(c.id) !== Number(courseId)) return c;
        return {
          ...c,
          modules: (c.modules || []).map((m) => {
            if (Number(m.id) !== Number(moduleId)) return m;
            return {
              ...m,
              submodules: (m.submodules || []).map((s) => {
                if (Number(s.id) !== Number(submoduleId)) return s;
                const map = new Map((s.contents || []).map((ct) => [String(ct.id), ct]));
                const reordered = orderedIds
                  .map((id, index) => {
                    const ct = map.get(String(id));
                    return ct ? { ...ct, contentOrder: index + 1 } : null;
                  })
                  .filter(Boolean);
                return { ...s, contents: reordered };
              }),
            };
          }),
        };
      }),
    }));
  }, []);

  // ── Media Library ──
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
                fileUrl: content.fileUrl || content.videoUrl || content.imageUrl,
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
      hydrated,
      students,
      instructors,
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
      reorderModules,
      addSubmodule,
      updateSubmodule,
      deleteSubmodule,
      reorderSubmodules,
      addContent,
      updateContent,
      deleteContent,
      reorderContent,
      duplicateCourse,
      duplicateModule,
      duplicateSubmodule,
      duplicateContent,
    }),
    [
      data, mediaLibrary, notifications, addNotification, markAllNotificationsAsRead, clearNotifications,
      loading, hydrated, students, instructors, branding, setBranding,
      getCategory, getCourse, getCoursesByCategory,
      createCategory, updateCategory, deleteCategory,
      createCourse, updateCourse, deleteCourse,
      addModule, updateModule, deleteModule, reorderModules,
      addSubmodule, updateSubmodule, deleteSubmodule, reorderSubmodules,
      addContent, updateContent, deleteContent, reorderContent,
      duplicateCourse, duplicateModule, duplicateSubmodule, duplicateContent,
    ]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
