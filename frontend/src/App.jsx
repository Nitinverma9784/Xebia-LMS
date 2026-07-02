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
import StudentPortal from '@/features/student/StudentPortal';
import StudentCoursesPage from '@/features/student/StudentCoursesPage';
import StudentCourseDetailsPage from '@/features/student/StudentCourseDetailsPage';
import StudentLearningContentPage from '@/features/student/StudentLearningContentPage';
import StudentAssignmentsPage from '@/features/student/StudentAssignmentsPage';
import StudentAssessmentsPage from '@/features/student/StudentAssessmentsPage';
import StudentProgressPage from '@/features/student/StudentProgressPage';
import StudentNotificationsPage from '@/features/student/StudentNotificationsPage';
import StudentProfilePage from '@/features/student/StudentProfilePage';
import StudentSettingsPage from '@/features/student/StudentSettingsPage';
import StudentDiscussionPage from '@/features/student/StudentDiscussionPage';
import StudentLeaderboardPage from '@/features/student/StudentLeaderboardPage';

// Pages
import CategoryCoursesPage from './pages/CategoryCoursesPage';
import AllCoursesPage from './pages/AllCoursesPage';
import CourseBuilderPage from './pages/CourseBuilderPage';
import CourseFormPage from './pages/CourseFormPage';
import LoginPage from './pages/LoginPage';
import LoginSelectorPage from './pages/LoginSelectorPage';
import UploadContentPage from './pages/UploadContentPage';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

// Student Auth & Pages
import StudentProtectedRoute from '@/auth/student/StudentProtectedRoute';
import StudentLoginPage from '@/pages/student/Login';
import StudentRegisterPage from '@/pages/student/Register';
import StudentForgotPasswordPage from '@/pages/student/ForgotPassword';
import StudentResetPasswordPage from '@/pages/student/ResetPassword';

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
          <Route path="/admin/login" element={
            <RouteTitle title="Admin Login">
              <LoginPage />
            </RouteTitle>
          } />

          <Route path="/" element={
            <RouteTitle title="Welcome to LMS">
              <LoginSelectorPage />
            </RouteTitle>
          } />

          {/* Student Login & Auth Flow (unprotected) */}
          <Route path="/student/login" element={
            <RouteTitle title="Student Login">
              <StudentLoginPage />
            </RouteTitle>
          } />
          <Route path="/student/register" element={
            <RouteTitle title="Student Registration">
              <StudentRegisterPage />
            </RouteTitle>
          } />
          <Route path="/student/forgot-password" element={
            <RouteTitle title="Forgot Password">
              <StudentForgotPasswordPage />
            </RouteTitle>
          } />
          <Route path="/student/reset-password" element={
            <RouteTitle title="Reset Password">
              <StudentResetPasswordPage />
            </RouteTitle>
          } />

          {/* Student Protected Routes */}
          <Route path="/student/*" element={
            <StudentProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={
                    <RouteTitle title="Student Dashboard">
                      <StudentPortal />
                    </RouteTitle>
                  } />

                  <Route path="courses" element={
                    <RouteTitle title="My Courses">
                      <StudentCoursesPage />
                    </RouteTitle>
                  } />

                  <Route path="courses/:courseId" element={
                    <RouteTitle title="Course Details">
                      <StudentCourseDetailsPage />
                    </RouteTitle>
                  } />

                  <Route path="learning-content" element={
                    <RouteTitle title="Learning Content">
                      <StudentLearningContentPage />
                    </RouteTitle>
                  } />

                  <Route path="assignments" element={
                    <RouteTitle title="Assignments">
                      <StudentAssignmentsPage />
                    </RouteTitle>
                  } />

                  <Route path="assessments" element={
                    <RouteTitle title="Assessments">
                      <StudentAssessmentsPage />
                    </RouteTitle>
                  } />

                  <Route path="progress" element={
                    <RouteTitle title="Progress Tracker">
                      <StudentProgressPage />
                    </RouteTitle>
                  } />

                  <Route path="notifications" element={
                    <RouteTitle title="Notifications">
                      <StudentNotificationsPage />
                    </RouteTitle>
                  } />

                  <Route path="profile" element={
                    <RouteTitle title="Profile">
                      <StudentProfilePage />
                    </RouteTitle>
                  } />

                  <Route path="settings" element={
                    <RouteTitle title="Settings">
                      <StudentSettingsPage />
                    </RouteTitle>
                  } />

                  <Route path="discussion" element={
                    <RouteTitle title="Discussion Forum">
                      <StudentDiscussionPage />
                    </RouteTitle>
                  } />

                  <Route path="leaderboard" element={
                    <RouteTitle title="Leaderboard">
                      <StudentLeaderboardPage />
                    </RouteTitle>
                  } />

                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AppLayout>
            </StudentProtectedRoute>
          } />

          {/* Admin Protected Routes */}
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
