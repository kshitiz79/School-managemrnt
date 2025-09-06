import { httpClient as api } from '../httpClient'

export const onlineAdmissionApi = {
  // Public API for form submission
  submitApplication: async data => {
    const response = await api.post('/online-admission/submit', data)
    return response.data
  },

  // Admin APIs
  getApplications: async (params = {}) => {
    const response = await api.get('/online-admission/applications', { params })
    return response.data
  },

  getApplicationById: async id => {
    const response = await api.get(`/online-admission/applications/${id}`)
    return response.data
  },

  approveApplication: async id => {
    const response = await api.post(
      `/online-admission/applications/${id}/approve`
    )
    return response.data
  },

  rejectApplication: async (id, reason) => {
    const response = await api.post(
      `/online-admission/applications/${id}/reject`,
      { reason }
    )
    return response.data
  },

  updateApplicationStatus: async (id, status) => {
    const response = await api.put(
      `/online-admission/applications/${id}/status`,
      { status }
    )
    return response.data
  },

  getApplicationStats: async () => {
    const response = await api.get('/online-admission/stats')
    return response.data
  },

  exportApplications: async (params = {}) => {
    const response = await api.get('/online-admission/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  bulkApprove: async ids => {
    const response = await api.post('/online-admission/bulk-approve', { ids })
    return response.data
  },

  bulkReject: async (ids, reason) => {
    const response = await api.post('/online-admission/bulk-reject', {
      ids,
      reason,
    })
    return response.data
  },
}
