import { httpClient as api } from '../httpClient'

export const postalDispatchApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/postal-dispatch', { params })
    return response.data
  },

  getById: async id => {
    const response = await api.get(`/postal-dispatch/${id}`)
    return response.data
  },

  create: async data => {
    const response = await api.post('/postal-dispatch', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/postal-dispatch/${id}`, data)
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/postal-dispatch/${id}/status`, {
      status,
    })
    return response.data
  },

  delete: async id => {
    const response = await api.delete(`/postal-dispatch/${id}`)
    return response.data
  },

  // Tracking
  trackDispatch: async trackingNumber => {
    const response = await api.get(`/postal-dispatch/track/${trackingNumber}`)
    return response.data
  },

  // Labels and Documents
  generateLabel: async id => {
    const response = await api.get(`/postal-dispatch/${id}/label`, {
      responseType: 'blob',
    })
    return response.data
  },

  generateReceipt: async id => {
    const response = await api.get(`/postal-dispatch/${id}/receipt`, {
      responseType: 'blob',
    })
    return response.data
  },

  // Reports
  getDispatchReport: async (params = {}) => {
    const response = await api.get('/postal-dispatch/report', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  // Statistics
  getStatistics: async () => {
    const response = await api.get('/postal-dispatch/statistics')
    return response.data
  },
}
