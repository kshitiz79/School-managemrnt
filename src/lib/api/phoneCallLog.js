import { httpClient as api } from '../httpClient'

export const phoneCallLogApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/phone-calls', { params })
    return response.data
  },

  getById: async id => {
    const response = await api.get(`/phone-calls/${id}`)
    return response.data
  },

  create: async data => {
    const response = await api.post('/phone-calls', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/phone-calls/${id}`, data)
    return response.data
  },

  delete: async id => {
    const response = await api.delete(`/phone-calls/${id}`)
    return response.data
  },

  // Follow-ups
  getFollowUps: async () => {
    const response = await api.get('/phone-calls/follow-ups')
    return response.data
  },

  markFollowUpComplete: async id => {
    const response = await api.patch(`/phone-calls/${id}/follow-up-complete`)
    return response.data
  },

  // Statistics
  getStatistics: async () => {
    const response = await api.get('/phone-calls/statistics')
    return response.data
  },

  // Reports
  getCallReport: async (params = {}) => {
    const response = await api.get('/phone-calls/report', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}
