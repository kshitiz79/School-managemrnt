import { httpClient as api } from '../httpClient'

export const postalReceiveApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/postal-receive', { params })
    return response.data
  },

  getById: async id => {
    const response = await api.get(`/postal-receive/${id}`)
    return response.data
  },

  create: async data => {
    const response = await api.post('/postal-receive', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/postal-receive/${id}`, data)
    return response.data
  },

  markAsDelivered: async (id, deliveredTo) => {
    const response = await api.patch(`/postal-receive/${id}/deliver`, {
      deliveredTo,
    })
    return response.data
  },

  delete: async id => {
    const response = await api.delete(`/postal-receive/${id}`)
    return response.data
  },

  // Reports
  getReceiveReport: async (params = {}) => {
    const response = await api.get('/postal-receive/report', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  // Statistics
  getStatistics: async () => {
    const response = await api.get('/postal-receive/statistics')
    return response.data
  },
}
