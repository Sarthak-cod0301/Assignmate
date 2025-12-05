import axios from 'axios';

// Detect environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Set API URL based on environment
const API_URL = isDevelopment 
  ? 'https://assignamate-backend.onrender.com/api'  // Local development
  : '/api';                       // Production (same origin)

console.log(`🌍 API URL: ${API_URL}`);
console.log(`🏭 Environment: ${process.env.NODE_ENV}`);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const assignmentAPI = {
  getAssignments: () => api.get('/assignments'),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  createAssignment: (formData) => api.post('/assignments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
};

export const submissionAPI = {
  getSubmissions: () => api.get('/submissions'),
  getMySubmissions: (studentId) => api.get(`/submissions/my-submissions/${studentId}`),
  submitAssignment: (assignmentId, formData) => api.post(`/submissions/${assignmentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  gradeSubmission: (id, data) => api.put(`/submissions/${id}/grade`, data),
};

export default api;
