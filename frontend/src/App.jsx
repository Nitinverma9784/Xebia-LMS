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
import BrandingSettings from '@/features/content/BrandingSettings';

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
                  <Route path="/" element={<Navigate to="/catalog/dashboard" replace />} />
                  
                  <Route path="/catalog/dashboard" element={
                    <RouteTitle title="Dashboard">
                      <Dashboard />
                    </RouteTitle>
                  } />
                  
                  <Route path="/catalog/categories" element={
                    <RouteTitle title="Categories">
                      <CategoryManagement />
                    </RouteTitle>
                  } />

                  <Route path="/catalog/categories/new" element={
                    <RouteTitle title="Create Category">
                      <CategoryForm />
                    </RouteTitle>
                  } />

                  <Route path="/catalog/categories/:categoryId/edit" element={
                    <RouteTitle title="Edit Category">
                      <CategoryForm />
                    </RouteTitle>
                  } />
                  
                  <Route path="/catalog/categories/:categoryId" element={
                    <RouteTitle title="Category Courses">
                      <CategoryCoursesPage />
                    </RouteTitle>
                  } />
                  
                  <Route path="/catalog/courses" element={
                    <RouteTitle title="All Courses">
                      <AllCoursesPage />
                    </RouteTitle>
                  } />

                  <Route path="/catalog/courses/new" element={
                    <RouteTitle title="Create Course">
                      <CourseFormPage />
                    </RouteTitle>
                  } />

                  <Route path="/catalog/courses/:courseId/edit" element={
                    <RouteTitle title="Edit Course">
                      <CourseFormPage />
                    </RouteTitle>
                  } />
                  
                  <Route path="/catalog/courses/:courseId" element={
                    <RouteTitle title="Course Builder">
                      <CourseBuilderPage />
                    </RouteTitle>
                  } />

                  <Route path="/catalog/curriculum" element={
                    <RouteTitle title="Curriculum">
                      <CurriculumLanding />
                    </RouteTitle>
                  } />
                  
                  <Route path="/catalog/media" element={
                    <RouteTitle title="Media Library">
                      <MediaLibrary />
                    </RouteTitle>
                  } />
                  
                  <Route path="/catalog/upload-content" element={
                    <RouteTitle title="Upload Content">
                      <UploadContentPage />
                    </RouteTitle>
                  } />
                  
                  <Route path="/catalog/branding" element={
                    <RouteTitle title="Branding">
                      <BrandingSettings />
                    </RouteTitle>
                  } />

                  <Route path="*" element={<Navigate to="/catalog/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Providers>
    </Router>
  );
}
