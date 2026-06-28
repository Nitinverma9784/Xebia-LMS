import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('xebia-lms-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('xebia-lms-refresh-token');
      
      if (refreshToken) {
        try {
          // Attempt to refresh token using axios directly to avoid interceptor loop
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
          const { accessToken } = res.data.data;
          
          localStorage.setItem('xebia-lms-token', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed: clear storage and redirect
          localStorage.removeItem('xebia-lms-token');
          localStorage.removeItem('xebia-lms-refresh-token');
          localStorage.removeItem('xebia-lms-user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token: clear storage and redirect
        localStorage.removeItem('xebia-lms-token');
        localStorage.removeItem('xebia-lms-refresh-token');
        localStorage.removeItem('xebia-lms-user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
