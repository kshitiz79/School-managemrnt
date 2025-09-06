import { httpClient as api } from '../httpClient'

export const auditLogApi = {
  // Log new audit entry
  log: async data => {
    const response = await api.post('/audit-log', {
      ...data,
      timestamp: new Date().toISOString(),
      ipAddress: window.location.hostname,
      userAgent: navigator.userAgent,
    })
    return response.data
  },

  // Get audit logs
  getAll: async (params = {}) => {
    const response = await api.get('/audit-log', { params })
    return response.data
  },

  // Get logs for specific entity
  getEntityLogs: async (entityType, entityId) => {
    const response = await api.get(
      `/audit-log/entity/${entityType}/${entityId}`
    )
    return response.data
  },

  // Get logs for specific operation
  getOperationLogs: async (operationType, operationId) => {
    const response = await api.get(
      `/audit-log/operation/${operationType}/${operationId}`
    )
    return response.data
  },

  // Get logs by user
  getUserLogs: async (userId, params = {}) => {
    const response = await api.get(`/audit-log/user/${userId}`, { params })
    return response.data
  },

  // Get security events
  getSecurityEvents: async (params = {}) => {
    const response = await api.get('/audit-log/security', { params })
    return response.data
  },

  // Get critical events
  getCriticalEvents: async (params = {}) => {
    const response = await api.get('/audit-log/critical', { params })
    return response.data
  },

  // Export audit logs
  exportLogs: async (params = {}) => {
    const response = await api.get('/audit-log/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  // Search logs
  searchLogs: async (query, params = {}) => {
    const response = await api.get('/audit-log/search', {
      params: { query, ...params },
    })
    return response.data
  },
}
