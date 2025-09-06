import { httpClient as api } from '../httpClient'

export const visitorBookApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/visitors', { params })
    return response.data
  },

  getById: async id => {
    const response = await api.get(`/visitors/${id}`)
    return response.data
  },

  create: async data => {
    const response = await api.post('/visitors', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/visitors/${id}`, data)
    return response.data
  },

  checkOut: async id => {
    const response = await api.patch(`/visitors/${id}/checkout`)
    return response.data
  },

  delete: async id => {
    const response = await api.delete(`/visitors/${id}`)
    return response.data
  },

  // Visitor Pass
  generatePass: async id => {
    const response = await api.get(`/visitors/${id}/pass`, {
      responseType: 'blob',
    })
    return response.data
  },

  // Statistics
  getStatistics: async () => {
    const response = await api.get('/visitors/statistics')
    return response.data
  },

  // Reports
  getDailyReport: async date => {
    const response = await api.get('/visitors/daily-report', {
      params: { date },
      responseType: 'blob',
    })
    return response.data
  },

  getVisitorReport: async (params = {}) => {
    const response = await api.get('/visitors/report', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}
