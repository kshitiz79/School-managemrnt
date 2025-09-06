import { STORAGE_KEYS, MOCK_USERS } from '../constants/auth'

/**
 * Generate a mock JWT token
 */
export const generateMockToken = (userId, role) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    })
  )
  const signature = btoa(`mock-signature-${userId}-${role}`)
  return `${header}.${payload}.${signature}`
}

/**
 * Validate mock credentials
 */
export const validateCredentials = async (email, password, selectedRole) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // For demo purposes, allow any email/password combination
  // In production, this would validate against a real API
  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  // Find mock user or create one
  let user = MOCK_USERS.find(u => u.email === email && u.role === selectedRole)

  if (!user) {
    // Create a mock user for demo purposes
    user = {
      id: Math.floor(Math.random() * 10000),
      name: `Demo ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`,
      email,
      role: selectedRole,
    }
  }

  const token = generateMockToken(user.id, user.role)

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  }
}

/**
 * Store authentication data in localStorage
 */
export const storeAuthData = (userData, token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true')
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  } else {
    sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
    sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  }
}

/**
 * Retrieve authentication data from storage
 */
export const getStoredAuthData = () => {
  const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true'
  const storage = rememberMe ? localStorage : sessionStorage

  const userData = storage.getItem(STORAGE_KEYS.USER_DATA)
  const token = storage.getItem(STORAGE_KEYS.AUTH_TOKEN)

  if (userData && token) {
    try {
      return {
        user: JSON.parse(userData),
        token,
      }
    } catch (error) {
      console.error('Error parsing stored auth data:', error)
      clearAuthData()
      return null
    }
  }

  return null
}

/**
 * Clear authentication data from storage
 */
export const clearAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.USER_DATA)
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME)
  sessionStorage.removeItem(STORAGE_KEYS.USER_DATA)
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
}

/**
 * Check if user has required role
 */
export const hasRole = (userRole, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles]
  }
  return requiredRoles.includes(userRole)
}

/**
 * Check if token is expired (mock implementation)
 */
export const isTokenExpired = token => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp < Math.floor(Date.now() / 1000)
  } catch {
    return true
  }
}

/**
 * Get user role from token
 */
export const getRoleFromToken = token => {
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role
  } catch {
    return null
  }
}
