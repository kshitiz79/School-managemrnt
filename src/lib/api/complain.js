import { httpClient as api } from '../httpClient'

export const complainApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/complains', { params })
    return response.data
  },

  getById: async id => {
    const response = await api.get(`/complains/${id}`)
    return response.data
  },

  create: async data => {
    const response = await api.post('/complains', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/complains/${id}`, data)
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/complains/${id}/status`, { status })
    return response.data
  },

  assignTo: async (id, assignedTo) => {
    const response = await api.patch(`/complains/${id}/assign`, { assignedTo })
    return response.data
  },

  addResponse: async (id, response) => {
    const responseData = await api.post(`/complains/${id}/responses`, response)
    return responseData.data
  },

  delete: async id => {
    const response = await api.delete(`/complains/${id}`)
    return response.data
  },

  // Reports
  getComplainReport: async (params = {}) => {
    const response = await api.get('/complains/report', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  // Statistics
  getStatistics: async () => {
    const response = await api.get('/complains/statistics')
    return response.data
  },
}
