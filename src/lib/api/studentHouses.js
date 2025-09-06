import { httpClient as api } from '../httpClient'

export const studentHousesApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/student-houses', { params })
    return response.data
  },

  getById: async id => {
    const response = await api.get(`/student-houses/${id}`)
    return response.data
  },

  create: async data => {
    const response = await api.post('/student-houses', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/student-houses/${id}`, data)
    return response.data
  },

  delete: async id => {
    const response = await api.delete(`/student-houses/${id}`)
    return response.data
  },

  bulkDelete: async ids => {
    const response = await api.post('/student-houses/bulk-delete', { ids })
    return response.data
  },

  getStudentsByHouse: async houseId => {
    const response = await api.get(`/student-houses/${houseId}/students`)
    return response.data
  },

  getHouseActivities: async houseId => {
    const response = await api.get(`/student-houses/${houseId}/activities`)
    return response.data
  },

  updateHousePoints: async (houseId, points) => {
    const response = await api.post(`/student-houses/${houseId}/points`, {
      points,
    })
    return response.data
  },
}
