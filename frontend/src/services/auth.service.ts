import api from './api';
import type { LoginCredentials, TeacherRegisterData, StudentRegisterData } from '../types';

export const authService = {
  teacherLogin: async (data: LoginCredentials) => {
    const res = await api.post('/auth/teacher/login', data);
    return res.data;
  },

  teacherRegister: async (data: TeacherRegisterData) => {
    const res = await api.post('/auth/teacher/register', data);
    return res.data;
  },

  studentLogin: async (data: LoginCredentials) => {
    const res = await api.post('/auth/student/login', data);
    return res.data;
  },

  studentRegister: async (data: StudentRegisterData) => {
    const res = await api.post('/auth/student/register', data);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
