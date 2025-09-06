import { httpClient as api } from '../httpClient'

export const lessonPlanApi = {
  // Topics
  getTopics: filters => api.get('/lesson-plans/topics', { params: filters }),
  addTopic: data => api.post('/lesson-plans/topics', data),
  updateTopic: (id, data) => api.put(`/lesson-plans/topics/${id}`, data),
  deleteTopic: id => api.delete(`/lesson-plans/topics/${id}`),

  // Lessons
  getLessons: filters => api.get('/lesson-plans/lessons', { params: filters }),
  addLesson: data => api.post('/lesson-plans/lessons', data),
  updateLesson: (id, data) => api.put(`/lesson-plans/lessons/${id}`, data),
  deleteLesson: id => api.delete(`/lesson-plans/lessons/${id}`),
  duplicateLesson: id => api.post(`/lesson-plans/lessons/${id}/duplicate`),

  // Lesson Plans Management
  getLessonPlans: filters => api.get('/lesson-plans', { params: filters }),
  getLessonPlanDetails: id => api.get(`/lesson-plans/${id}`),
  approveLessonPlan: (id, status, comments) =>
    api.post(`/lesson-plans/${id}/approve`, {
      status,
      comments,
    }),
  bulkApproveLessonPlans: approvals =>
    api.post('/lesson-plans/bulk-approve', {
      approvals,
    }),

  // Syllabus Status
  getSyllabusStatus: filters =>
    api.get('/lesson-plans/syllabus-status', { params: filters }),
  updateSyllabusStatus: (id, status, completionDate, notes) =>
    api.put(`/lesson-plans/syllabus-status/${id}`, {
      status,
      completionDate,
      notes,
    }),

  // Copy Old Lessons
  getOldLessons: filters =>
    api.get('/lesson-plans/old-lessons', { params: filters }),
  previewCopy: (lessons, target, options) =>
    api.post('/lesson-plans/preview-copy', {
      lessons,
      target,
      options,
    }),
  copyLessons: (lessons, target, options) =>
    api.post('/lesson-plans/copy-lessons', {
      lessons,
      target,
      options,
    }),

  // Master Data
  getSubjects: () => api.get('/subjects'),
  getClasses: () => api.get('/classes'),
  getTeachers: () => api.get('/teachers'),

  // Reports
  getLessonPlanReport: filters =>
    api.get('/lesson-plans/reports', { params: filters }),
  getSyllabusProgressReport: filters =>
    api.get('/lesson-plans/syllabus-progress', { params: filters }),
}
