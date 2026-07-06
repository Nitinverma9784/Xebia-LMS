import { Router } from 'express';
import { authenticate, authorizeStudent } from '../middleware/auth';
import { uploadSubmission } from '../middleware/upload';
import {
  getStudentAssignments,
  getAssignmentDetail,
  submitAssignment,
  getMySubmissions,
  updateStudentProfile,
  getStudentDashboardStats,
  getLearningProgress,
} from '../controllers/student.controller';

const router = Router();

// All student routes require auth + student role
router.use(authenticate, authorizeStudent);

// Dashboard & Progress
router.get('/dashboard', getStudentDashboardStats);
router.get('/progress', getLearningProgress);

// Assignments
router.get('/assignments', getStudentAssignments);
router.get('/assignments/:id', getAssignmentDetail);

// Submissions
router.post('/submit', uploadSubmission.single('file'), submitAssignment);
router.get('/submissions', getMySubmissions);

// Profile
router.put('/profile', uploadSubmission.single('avatar'), updateStudentProfile);

export default router;
