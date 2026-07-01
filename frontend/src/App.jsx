import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from './providers';
import AppLayout from '@/components/layout/AppLayout';

// Features
import Dashboard from '@/features/dashboard/Dashboard';
import CategoryManagement from '@/features/category/CategoryManagement';
import CategoryForm from '@/features/category/CategoryForm';
import CurriculumLanding from '@/features/curriculum/CurriculumLanding';
import MediaLibrary from '@/features/content/MediaLibrary';

// Pages
import CategoryCoursesPage from './pages/CategoryCoursesPage';
import AllCoursesPage from './pages/AllCoursesPage';
import CourseBuilderPage from './pages/CourseBuilderPage';
import CourseFormPage from './pages/CourseFormPage';
import LoginPage from './pages/LoginPage';
import UploadContentPage from './pages/UploadContentPage';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

function RouteTitle({ title, children }) {
  React.useEffect(() => {
    document.title = `${title} — Xebia LMS`;
  }, [title]);
  return children;
}

export default function App() {
  return (
    <Router>
      <Providers>
        <Routes>
          <Route path="/login" element={
            <RouteTitle title="Login">
              <LoginPage />
            </RouteTitle>
          } />

          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                  
                  <Route path="/admin/dashboard" element={
                    <RouteTitle title="Dashboard">
                      <Dashboard />
                    </RouteTitle>
                  } />
                  
                  <Route path="/admin/categories" element={
                    <RouteTitle title="Categories">
                      <CategoryManagement />
                    </RouteTitle>
                  } />

                  <Route path="/admin/categories/new" element={
                    <RouteTitle title="Create Category">
                      <CategoryForm />
                    </RouteTitle>
                  } />

                  <Route path="/admin/categories/:categoryId/edit" element={
                    <RouteTitle title="Edit Category">
                      <CategoryForm />
                    </RouteTitle>
                  } />
                  
                  <Route path="/admin/categories/:categoryId" element={
                    <RouteTitle title="Category Courses">
                      <CategoryCoursesPage />
                    </RouteTitle>
                  } />
                  
                  <Route path="/admin/courses" element={
                    <RouteTitle title="All Courses">
                      <AllCoursesPage />
                    </RouteTitle>
                  } />

                  <Route path="/admin/courses/new" element={
                    <RouteTitle title="Create Course">
                      <CourseFormPage />
                    </RouteTitle>
                  } />

                  <Route path="/admin/courses/:courseId/edit" element={
                    <RouteTitle title="Edit Course">
                      <CourseFormPage />
                    </RouteTitle>
                  } />
                  
                  <Route path="/admin/curriculum/:courseId" element={
                    <RouteTitle title="Course Builder">
                      <CourseBuilderPage />
                    </RouteTitle>
                  } />

                  <Route path="/admin/curriculum" element={
                    <RouteTitle title="Curriculum">
                      <CurriculumLanding />
                    </RouteTitle>
                  } />
                  
                  <Route path="/admin/media" element={
                    <RouteTitle title="Media Library">
                      <MediaLibrary />
                    </RouteTitle>
                  } />
                  
                  <Route path="/admin/upload-content" element={
                    <RouteTitle title="Upload Content">
                      <UploadContentPage />
                    </RouteTitle>
                  } />

                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Providers>
    </Router>
  );
}
