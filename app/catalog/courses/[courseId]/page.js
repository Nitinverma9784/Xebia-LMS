'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import Breadcrumb from '@/components/layout/Breadcrumb';
import CourseBuilderWorkspace from '@/features/course/CourseBuilderWorkspace';

export default function CourseBuilderPage({ params }) {
  const { courseId } = use(params);
  const catalog = useCatalog();
  const { showToast } = useToast();
  const course = catalog.getCourse(courseId);

  if (!catalog.hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (!course) notFound();

  const category = catalog.getCategory(course.categoryId);

  const breadcrumbItems = [
    { label: category?.name || 'Category', href: `/catalog/categories/${course.categoryId}` },
    { label: course.title },
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="px-4 py-2 border-b border-brand-border bg-white">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <CourseBuilderWorkspace
        course={course}
        category={category}
        students={catalog.students}
        catalog={catalog}
        showToast={showToast}
      />
    </div>
  );
}
