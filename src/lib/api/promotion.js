import { httpClient as api } from '../httpClient'

export const promotionApi = {
  preview: async data => {
    const response = await api.post('/promotion/preview', data)
    return response.data
  },

  execute: async data => {
    const response = await api.post('/promotion/execute', data)
    return response.data
  },

  rollback: async promotionId => {
    const response = await api.post(`/promotion/rollback/${promotionId}`)
    return response.data
  },

  getHistory: async (params = {}) => {
    const response = await api.get('/promotion/history', { params })
    return response.data
  },

  getPromotionDetails: async promotionId => {
    const response = await api.get(`/promotion/${promotionId}`)
    return response.data
  },
}
