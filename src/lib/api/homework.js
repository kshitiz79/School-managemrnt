import { httpClient as api } from '../httpClient'

export const homeworkApi = {
  // Homework Management
  addHomework: data =>
    api.post('/homework', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getHomework: filters => api.get('/homework', { params: filters }),
  updateHomework: (id, data) =>
    api.put(`/homework/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteHomework: id => api.delete(`/homework/${id}`),

  // Daily Assignments
  getDailyAssignments: (date, filters) =>
    api.get('/homework/daily', {
      params: { date, ...filters },
    }),
  getAssignmentDetails: id => api.get(`/homework/${id}`),

  // Submissions
  getSubmissions: assignmentId =>
    api.get(`/homework/${assignmentId}/submissions`),
  submitHomework: (assignmentId, data) =>
    api.post(`/homework/${assignmentId}/submit`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateSubmission: (submissionId, data) =>
    api.put(`/homework/submissions/${submissionId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Grading
  gradeSubmission: (submissionId, grade, feedback) =>
    api.post(`/homework/submissions/${submissionId}/grade`, {
      grade,
      feedback,
    }),
  bulkGradeSubmissions: grades => api.post('/homework/bulk-grade', { grades }),

  // Master Data
  getSubjects: () => api.get('/subjects'),
  getClasses: () => api.get('/classes'),
  getStudents: classId => api.get('/students', { params: { class: classId } }),

  // Reports
  getHomeworkReport: filters =>
    api.get('/homework/reports', { params: filters }),
  getSubmissionStats: assignmentId =>
    api.get(`/homework/${assignmentId}/stats`),
}
