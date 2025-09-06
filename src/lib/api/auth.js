import { httpClient as api } from '../httpClient'

export const authApi = {
  // Login
  login: async credentials => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Verify admin password for sensitive operations
  verifyAdminPassword: async data => {
    const response = await api.post('/auth/verify-admin', data)
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    return response.data
  },

  // Change password
  changePassword: async data => {
    const response = await api.post('/auth/change-password', data)
    return response.data
  },

  // Reset password
  resetPassword: async email => {
    const response = await api.post('/auth/reset-password', { email })
    return response.data
  },

  // Verify reset token
  verifyResetToken: async token => {
    const response = await api.post('/auth/verify-reset-token', { token })
    return response.data
  },

  // Set new password
  setNewPassword: async (token, password) => {
    const response = await api.post('/auth/set-new-password', {
      token,
      password,
    })
    return response.data
  },

  // Two-factor authentication
  enableTwoFactor: async () => {
    const response = await api.post('/auth/2fa/enable')
    return response.data
  },

  disableTwoFactor: async password => {
    const response = await api.post('/auth/2fa/disable', { password })
    return response.data
  },

  verifyTwoFactor: async code => {
    const response = await api.post('/auth/2fa/verify', { code })
    return response.data
  },

  // Session management
  getSessions: async () => {
    const response = await api.get('/auth/sessions')
    return response.data
  },

  revokeSession: async sessionId => {
    const response = await api.delete(`/auth/sessions/${sessionId}`)
    return response.data
  },

  revokeAllSessions: async () => {
    const response = await api.delete('/auth/sessions')
    return response.data
  },
}
