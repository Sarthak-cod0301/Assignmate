import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://assignmate-backend-76bd.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

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
