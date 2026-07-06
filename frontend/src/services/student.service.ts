import api from './api';

export const studentService = {
  // Dashboard & Progress
  getDashboardStats: async () => {
    const res = await api.get('/student/dashboard');
    return res.data;
  },

  getLearningProgress: async () => {
    const res = await api.get('/student/progress');
    return res.data;
  },

  // Assignments
  getAssignments: async (params?: Record<string, string>) => {
    const res = await api.get('/student/assignments', { params });
    return res.data;
  },

  getAssignmentDetail: async (id: string) => {
    const res = await api.get(`/student/assignments/${id}`);
    return res.data;
  },

  // Submissions
  submitAssignment: async (assignmentId: string, file: File, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('file', file);
    const res = await api.post('/student/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return res.data;
  },

  getMySubmissions: async () => {
    const res = await api.get('/student/submissions');
    return res.data;
  },

  // Profile
  updateProfile: async (data: FormData) => {
    const res = await api.put('/student/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
