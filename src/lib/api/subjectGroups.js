import { httpClient as api } from '../httpClient'

export const subjectGroupsApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/subject-groups', { params })
    return response.data
  },

  getById: async id => {
    const response = await api.get(`/subject-groups/${id}`)
    return response.data
  },

  getByClass: async classId => {
    const response = await api.get(`/subject-groups/by-class/${classId}`)
    return response.data
  },

  create: async data => {
    const response = await api.post('/subject-groups', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/subject-groups/${id}`, data)
    return response.data
  },

  delete: async id => {
    const response = await api.delete(`/subject-groups/${id}`)
    return response.data
  },

  bulkDelete: async ids => {
    const response = await api.post('/subject-groups/bulk-delete', { ids })
    return response.data
  },
}
