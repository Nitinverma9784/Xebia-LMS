import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { categories, initialCourses } from '../data/mockData.js'

const CourseDataContext = createContext(null)

let _nextId = 9000
const nextId = () => _nextId++

export function CourseDataProvider({ children }) {
  const [courses, setCourses] = useState(initialCourses)

  const getCourse = useCallback(
    (courseId) => courses.find((c) => String(c.id) === String(courseId)),
    [courses]
  )

  const getCategory = useCallback(
    (categoryId) => categories.find((c) => c.id === categoryId),
    []
  )

  // ── Course-level mutations ────────────────────────────────────────────
  const addCourse = useCallback((partial) => {
    setCourses((prev) => [
      ...prev,
      {
        id: nextId(),
        title: 'Untitled Course',
        slug: `untitled-course-${Date.now()}`,
        shortDescription: '',
        level: 'Beginner',
        language: 'English',
        duration: '—',
        icon: '📘',
        categoryId: categories[0].id,
        isActive: true,
        isPublished: false,
        modules: [],
        ...partial,
      },
    ])
  }, [])

  // ── Module-level mutations ────────────────────────────────────────────
  const addModule = useCallback((courseId) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) !== String(courseId)) return course
        const order = course.modules.length + 1
        return {
          ...course,
          modules: [
            ...course.modules,
            {
              id: nextId(),
              title: 'Untitled Module',
              description: '',
              moduleOrder: order,
              isActive: true,
              submodules: [],
            },
          ],
        }
      })
    )
  }, [])

  const deleteModule = useCallback((courseId, moduleId) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) !== String(courseId)) return course
        return { ...course, modules: course.modules.filter((m) => m.id !== moduleId) }
      })
    )
  }, [])

  const renameModule = useCallback((courseId, moduleId, title) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) !== String(courseId)) return course
        return {
          ...course,
          modules: course.modules.map((m) => (m.id === moduleId ? { ...m, title } : m)),
        }
      })
    )
  }, [])

  const toggleModuleActive = useCallback((courseId, moduleId) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) !== String(courseId)) return course
        return {
          ...course,
          modules: course.modules.map((m) =>
            m.id === moduleId ? { ...m, isActive: !m.isActive } : m
          ),
        }
      })
    )
  }, [])

  // ── Submodule-level mutations ──────────────────────────────────────────
  const addSubmodule = useCallback((courseId, moduleId) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) !== String(courseId)) return course
        return {
          ...course,
          modules: course.modules.map((m) => {
            if (m.id !== moduleId) return m
            const order = m.submodules.length + 1
            const id = nextId()
            return {
              ...m,
              submodules: [
                ...m.submodules,
                {
                  id,
                  title: 'Untitled Submodule',
                  slug: `untitled-submodule-${id}`,
                  submoduleOrder: order,
                  isActive: true,
                  contents: [],
                },
              ],
            }
          }),
        }
      })
    )
  }, [])

  const deleteSubmodule = useCallback((courseId, moduleId, submoduleId) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) !== String(courseId)) return course
        return {
          ...course,
          modules: course.modules.map((m) => {
            if (m.id !== moduleId) return m
            return { ...m, submodules: m.submodules.filter((s) => s.id !== submoduleId) }
          }),
        }
      })
    )
  }, [])

  const renameSubmodule = useCallback((courseId, moduleId, submoduleId, title) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) !== String(courseId)) return course
        return {
          ...course,
          modules: course.modules.map((m) => {
            if (m.id !== moduleId) return m
            return {
              ...m,
              submodules: m.submodules.map((s) => (s.id === submoduleId ? { ...s, title } : s)),
            }
          }),
        }
      })
    )
  }, [])

  const toggleSubmoduleActive = useCallback((courseId, moduleId, submoduleId) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) !== String(courseId)) return course
        return {
          ...course,
          modules: course.modules.map((m) => {
            if (m.id !== moduleId) return m
            return {
              ...m,
              submodules: m.submodules.map((s) =>
                s.id === submoduleId ? { ...s, isActive: !s.isActive } : s
              ),
            }
          }),
        }
      })
    )
  }, [])

  // ── Content-level mutations ───────────────────────────────────────────
  const addContent = useCallback((courseId, moduleId, submoduleId, type = 'text') => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) !== String(courseId)) return course
        return {
          ...course,
          modules: course.modules.map((m) => {
            if (m.id !== moduleId) return m
            return {
              ...m,
              submodules: m.submodules.map((s) => {
                if (s.id !== submoduleId) return s
                const order = s.contents.length + 1
                return {
                  ...s,
                  contents: [
                    ...s.contents,
                    {
                      id: nextId(),
                      type,
                      text: type === 'text' ? 'New content block — click the pencil to edit.' : '',
                      title: type === 'heading' ? 'New heading' : '',
                      contentOrder: order,
                      isActive: true,
                    },
                  ],
                }
              }),
            }
          }),
        }
      })
    )
  }, [])

  const deleteContent = useCallback((courseId, moduleId, submoduleId, contentId) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) !== String(courseId)) return course
        return {
          ...course,
          modules: course.modules.map((m) => {
            if (m.id !== moduleId) return m
            return {
              ...m,
              submodules: m.submodules.map((s) => {
                if (s.id !== submoduleId) return s
                return { ...s, contents: s.contents.filter((c) => c.id !== contentId) }
              }),
            }
          }),
        }
      })
    )
  }, [])

  const updateContentText = useCallback((courseId, moduleId, submoduleId, contentId, text) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) !== String(courseId)) return course
        return {
          ...course,
          modules: course.modules.map((m) => {
            if (m.id !== moduleId) return m
            return {
              ...m,
              submodules: m.submodules.map((s) => {
                if (s.id !== submoduleId) return s
                return {
                  ...s,
                  contents: s.contents.map((c) => (c.id === contentId ? { ...c, text } : c)),
                }
              }),
            }
          }),
        }
      })
    )
  }, [])

  const value = useMemo(
    () => ({
      courses,
      categories,
      getCourse,
      getCategory,
      addCourse,
      addModule,
      deleteModule,
      renameModule,
      toggleModuleActive,
      addSubmodule,
      deleteSubmodule,
      renameSubmodule,
      toggleSubmoduleActive,
      addContent,
      deleteContent,
      updateContentText,
    }),
    [
      courses,
      getCourse,
      getCategory,
      addCourse,
      addModule,
      deleteModule,
      renameModule,
      toggleModuleActive,
      addSubmodule,
      deleteSubmodule,
      renameSubmodule,
      toggleSubmoduleActive,
      addContent,
      deleteContent,
      updateContentText,
    ]
  )

  return <CourseDataContext.Provider value={value}>{children}</CourseDataContext.Provider>
}

export function useCourseData() {
  const ctx = useContext(CourseDataContext)
  if (!ctx) throw new Error('useCourseData must be used within a CourseDataProvider')
  return ctx
}
