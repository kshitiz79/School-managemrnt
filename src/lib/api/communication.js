import { httpClient as api } from '../httpClient'

export const communicationApi = {
  // Notice Board
  getNotices: filters => api.get('/communication/notices', { params: filters }),
  addNotice: data =>
    api.post('/communication/notices', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateNotice: (id, data) =>
    api.put(`/communication/notices/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteNotice: id => api.delete(`/communication/notices/${id}`),
  togglePin: (id, isPinned) =>
    api.patch(`/communication/notices/${id}/pin`, { isPinned }),

  // Message Sending
  sendMessage: data =>
    api.post('/communication/send', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  previewRecipients: data =>
    api.post('/communication/preview-recipients', data),
  getClasses: () => api.get('/classes'),

  // Templates
  getTemplates: type => api.get(`/communication/templates/${type}`),
  addTemplate: (type, data) =>
    api.post(`/communication/templates/${type}`, data),
  updateTemplate: (type, id, data) =>
    api.put(`/communication/templates/${type}/${id}`, data),
  deleteTemplate: (type, id) =>
    api.delete(`/communication/templates/${type}/${id}`),

  // Communication Logs
  getCommunicationLogs: filters =>
    api.get('/communication/logs', { params: filters }),
  getLogDetails: id => api.get(`/communication/logs/${id}`),

  // Scheduled Messages
  getScheduledMessages: filters =>
    api.get('/communication/scheduled', { params: filters }),
  cancelScheduledMessage: id => api.delete(`/communication/scheduled/${id}`),
  rescheduleMessage: (id, newDateTime) =>
    api.patch(`/communication/scheduled/${id}/reschedule`, {
      scheduledAt: newDateTime,
    }),

  // Login Credentials
  sendLoginCredentials: data =>
    api.post('/communication/send-credentials', data),
  getUsers: (userType, filters) =>
    api.get(`/users/${userType}`, { params: filters }),
  previewCredentialRecipients: data =>
    api.post('/communication/preview-credential-recipients', data),

  // Gateway Status (Mock)
  getGatewayStatus: () => api.get('/communication/gateway-status'),
  testGateway: type => api.post(`/communication/test-gateway/${type}`),
}
