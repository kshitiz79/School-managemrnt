import { httpClient as api } from '../httpClient'

export const classTeacherApi = {
  getAssignments: async classId => {
    const response = await api.get(`/class-teacher/assignments/${classId}`)
    return response.data
  },

  getAllAssignments: async () => {
    const response = await api.get('/class-teacher/assignments')
    return response.data
  },

  saveAssignments: async data => {
    const response = await api.post('/class-teacher/assignments', data)
    return response.data
  },

  checkConflicts: async data => {
    const response = await api.post('/class-teacher/check-conflicts', data)
    return response.data
  },

  removeAssignment: async sectionId => {
    const response = await api.delete(`/class-teacher/assignments/${sectionId}`)
    return response.data
  },
}
