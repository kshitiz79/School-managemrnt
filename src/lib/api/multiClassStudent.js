import { httpClient as api } from '../httpClient'

export const multiClassStudentApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/multi-class-students', { params })
    return response.data
  },

  getById: async id => {
    const response = await api.get(`/multi-class-students/${id}`)
    return response.data
  },

  create: async data => {
    const response = await api.post('/multi-class-students', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/multi-class-students/${id}`, data)
    return response.data
  },

  delete: async id => {
    const response = await api.delete(`/multi-class-students/${id}`)
    return response.data
  },

  // Timetable Management
  getStudentSchedule: async studentId => {
    const response = await api.get(
      `/multi-class-students/${studentId}/schedule`
    )
    return response.data
  },

  checkTimetableConflicts: async (studentId, enrollments) => {
    const response = await api.post('/multi-class-students/check-conflicts', {
      studentId,
      enrollments,
    })
    return response.data
  },

  // Enrollment Management
  addEnrollment: async (studentId, enrollmentData) => {
    const response = await api.post(
      `/multi-class-students/${studentId}/enrollments`,
      enrollmentData
    )
    return response.data
  },

  updateEnrollment: async (studentId, enrollmentId, data) => {
    const response = await api.put(
      `/multi-class-students/${studentId}/enrollments/${enrollmentId}`,
      data
    )
    return response.data
  },

  removeEnrollment: async (studentId, enrollmentId) => {
    const response = await api.delete(
      `/multi-class-students/${studentId}/enrollments/${enrollmentId}`
    )
    return response.data
  },

  // Reports and Analytics
  getEnrollmentReport: async (params = {}) => {
    const response = await api.get('/multi-class-students/report', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  getStatistics: async () => {
    const response = await api.get('/multi-class-students/statistics')
    return response.data
  },

  // Validation
  validateEnrollment: async data => {
    const response = await api.post('/multi-class-students/validate', data)
    return response.data
  },
}
