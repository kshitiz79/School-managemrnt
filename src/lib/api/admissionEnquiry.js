import { httpClient as api } from '../httpClient'

export const admissionEnquiryApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/admission-enquiries', { params })
    return response.data
  },

  getById: async id => {
    const response = await api.get(`/admission-enquiries/${id}`)
    return response.data
  },

  create: async data => {
    const response = await api.post('/admission-enquiries', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/admission-enquiries/${id}`, data)
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/admission-enquiries/${id}/status`, {
      status,
    })
    return response.data
  },

  delete: async id => {
    const response = await api.delete(`/admission-enquiries/${id}`)
    return response.data
  },

  // Analytics and Reports
  getStatistics: async () => {
    const response = await api.get('/admission-enquiries/statistics')
    return response.data
  },

  getConversionReport: async (params = {}) => {
    const response = await api.get('/admission-enquiries/conversion-report', {
      params,
    })
    return response.data
  },

  // Follow-up Management
  getFollowUps: async (params = {}) => {
    const response = await api.get('/admission-enquiries/follow-ups', {
      params,
    })
    return response.data
  },

  addFollowUp: async (enquiryId, followUpData) => {
    const response = await api.post(
      `/admission-enquiries/${enquiryId}/follow-ups`,
      followUpData
    )
    return response.data
  },

  // Reminders
  getReminders: async () => {
    const response = await api.get('/admission-enquiries/reminders')
    return response.data
  },

  // Export
  exportEnquiries: async (params = {}) => {
    const response = await api.get('/admission-enquiries/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}
