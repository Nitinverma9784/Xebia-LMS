import { Router } from 'express';
import {
  teacherRegister,
  teacherLogin,
  studentRegister,
  studentLogin,
  getMe,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Teacher auth
router.post('/teacher/register', teacherRegister);
router.post('/teacher/login', teacherLogin);

// Student auth
router.post('/student/register', studentRegister);
router.post('/student/login', studentLogin);

// Get current user
router.get('/me', authenticate, getMe);

export default router;
