import api from './api';
import type { CreateAssignmentData, GradeSubmissionData } from '../types';

export const teacherService = {
  // Dashboard
  getDashboardStats: async () => {
    const res = await api.get('/teacher/dashboard');
    return res.data;
  },

  // Assignments
  getAssignments: async (params?: Record<string, string>) => {
    const res = await api.get('/teacher/assignments', { params });
    return res.data;
  },

  getAssignmentById: async (id: string) => {
    const res = await api.get(`/teacher/assignments/${id}`);
    return res.data;
  },

  createAssignment: async (data: CreateAssignmentData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    const res = await api.post('/teacher/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateAssignment: async (id: string, data: Partial<CreateAssignmentData>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    const res = await api.put(`/teacher/assignments/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteAssignment: async (id: string) => {
    const res = await api.delete(`/teacher/assignments/${id}`);
    return res.data;
  },

  // Submissions
  getSubmissions: async (assignmentId: string) => {
    const res = await api.get(`/teacher/submissions/${assignmentId}`);
    return res.data;
  },

  gradeSubmission: async (data: GradeSubmissionData) => {
    const res = await api.post('/teacher/grade', data);
    return res.data;
  },

  // Profile
  updateProfile: async (data: FormData) => {
    const res = await api.put('/teacher/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
