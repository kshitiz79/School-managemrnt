import { httpClient as api } from '../httpClient'

export const timetableApi = {
  // Class Timetable APIs
  getClassTimetable: async (classId, sectionId) => {
    const response = await api.get(`/timetable/class/${classId}/${sectionId}`)
    return response.data
  },

  saveClassTimetable: async data => {
    const response = await api.post('/timetable/class', data)
    return response.data
  },

  publishTimetable: async data => {
    const response = await api.post('/timetable/class/publish', data)
    return response.data
  },

  // Teacher Timetable APIs
  getTeacherTimetable: async teacherId => {
    const response = await api.get(`/timetable/teacher/${teacherId}`)
    return response.data
  },

  getAllTeacherTimetables: async () => {
    const response = await api.get('/timetable/teachers')
    return response.data
  },

  saveTeacherTimetable: async data => {
    const response = await api.post('/timetable/teacher', data)
    return response.data
  },

  // Conflict Detection
  checkConflicts: async data => {
    const response = await api.post('/timetable/check-conflicts', data)
    return response.data
  },

  checkTeacherConflicts: async data => {
    const response = await api.post('/timetable/teacher/check-conflicts', data)
    return response.data
  },

  // Import/Export
  importTimetable: async (file, type) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await api.post('/timetable/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  exportTimetable: async params => {
    const response = await api.get('/timetable/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  // Templates
  getTimetableTemplates: async () => {
    const response = await api.get('/timetable/templates')
    return response.data
  },

  saveTemplate: async data => {
    const response = await api.post('/timetable/templates', data)
    return response.data
  },

  applyTemplate: async (templateId, targetData) => {
    const response = await api.post(
      `/timetable/templates/${templateId}/apply`,
      targetData
    )
    return response.data
  },

  // Versioning
  getTimetableVersions: async (classId, sectionId) => {
    const response = await api.get(
      `/timetable/versions/${classId}/${sectionId}`
    )
    return response.data
  },

  revertToVersion: async versionId => {
    const response = await api.post(`/timetable/versions/${versionId}/revert`)
    return response.data
  },

  // Bulk Operations
  bulkUpdateTimetable: async data => {
    const response = await api.post('/timetable/bulk-update', data)
    return response.data
  },

  copyTimetable: async (sourceData, targetData) => {
    const response = await api.post('/timetable/copy', {
      source: sourceData,
      target: targetData,
    })
    return response.data
  },

  // Analytics
  getTimetableAnalytics: async params => {
    const response = await api.get('/timetable/analytics', { params })
    return response.data
  },

  getTeacherWorkload: async teacherId => {
    const response = await api.get(`/timetable/teacher/${teacherId}/workload`)
    return response.data
  },

  getRoomUtilization: async () => {
    const response = await api.get('/timetable/room-utilization')
    return response.data
  },
}
