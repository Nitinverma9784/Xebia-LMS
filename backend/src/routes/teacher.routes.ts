import { Router } from 'express';
import { authenticate, authorizeTeacher } from '../middleware/auth';
import { uploadAssignment } from '../middleware/upload';
import {
  createAssignment,
  getTeacherAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  gradeSubmission,
  getDashboardStats,
  updateTeacherProfile,
} from '../controllers/teacher.controller';

const router = Router();

// All teacher routes require auth + teacher role
router.use(authenticate, authorizeTeacher);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Assignments
router.post('/assignments', uploadAssignment.single('attachment'), createAssignment);
router.get('/assignments', getTeacherAssignments);
router.get('/assignments/:id', getAssignmentById);
router.put('/assignments/:id', uploadAssignment.single('attachment'), updateAssignment);
router.delete('/assignments/:id', deleteAssignment);

// Submissions
router.get('/submissions/:assignmentId', getSubmissions);
router.post('/grade', gradeSubmission);

// Profile
router.put('/profile', uploadAssignment.single('avatar'), updateTeacherProfile);

export default router;
