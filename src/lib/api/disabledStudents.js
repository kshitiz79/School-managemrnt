import { httpClient as api } from '../httpClient'

export const disabledStudentsApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/disabled-students', { params })
    return response.data
  },

  getById: async id => {
    const response = await api.get(`/disabled-students/${id}`)
    return response.data
  },

  create: async data => {
    const response = await api.post('/disabled-students', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/disabled-students/${id}`, data)
    return response.data
  },

  delete: async id => {
    const response = await api.delete(`/disabled-students/${id}`)
    return response.data
  },

  // IEP Management
  updateIEP: async (id, iepData) => {
    const response = await api.put(`/disabled-students/${id}/iep`, iepData)
    return response.data
  },

  getIEPDocument: async id => {
    const response = await api.get(`/disabled-students/${id}/iep-document`, {
      responseType: 'blob',
    })
    return response.data
  },

  // Medical Notes
  updateMedicalNotes: async (id, notes) => {
    const response = await api.put(`/disabled-students/${id}/medical-notes`, {
      notes,
    })
    return response.data
  },

  // Support Services
  updateSupportServices: async (id, services) => {
    const response = await api.put(
      `/disabled-students/${id}/support-services`,
      services
    )
    return response.data
  },

  // Reports
  generateReport: async (params = {}) => {
    const response = await api.get('/disabled-students/report', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  getStatistics: async () => {
    const response = await api.get('/disabled-students/statistics')
    return response.data
  },
}
