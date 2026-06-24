import CourseManagement from '@/features/course/CourseManagement';

export const metadata = { title: 'Category Courses — Xebia LMS' };

export default async function CategoryCoursesPage({ params }) {
  const { categoryId } = await params;
  return <CourseManagement categoryId={categoryId} />;
}
