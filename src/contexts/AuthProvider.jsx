import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  RESTORE_SESSION: 'RESTORE_SESSION',
}

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      }
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        user: null,
        token: null,
        isAuthenticated: false,
      }
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        loading: false,
        error: null,
        user: null,
        token: null,
        isAuthenticated: false,
      }
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }
    default:
      return state
  }
}

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
}

// Mock users for demo
const mockUsers = {
  'admin@school.edu': {
    id: 'user-admin',
    name: 'System Administrator',
    email: 'admin@school.edu',
    role: 'admin',
    avatar: null,
    permissions: ['*'], // All permissions
  },
  'principal@school.edu': {
    id: 'user-principal',
    name: 'Dr. Sarah Johnson',
    email: 'principal@school.edu',
    role: 'principal',
    avatar: null,
    permissions: ['school:manage', 'staff:manage', 'student:manage'],
  },
  'teacher@school.edu': {
    id: 'user-teacher',
    name: 'Mr. John Smith',
    email: 'teacher@school.edu',
    role: 'teacher',
    avatar: null,
    permissions: ['class:manage', 'student:view', 'grade:manage'],
  },
  'student@school.edu': {
    id: 'user-student',
    name: 'Alex Johnson',
    email: 'student@school.edu',
    role: 'student',
    avatar: null,
    permissions: ['profile:view', 'grade:view', 'assignment:view'],
  },
  'parent@school.edu': {
    id: 'user-parent',
    name: 'Robert Johnson',
    email: 'parent@school.edu',
    role: 'parent',
    avatar: null,
    permissions: ['child:view', 'grade:view', 'fee:pay'],
  },
  'accountant@school.edu': {
    id: 'user-accountant',
    name: 'Mrs. Lisa Wilson',
    email: 'accountant@school.edu',
    role: 'accountant',
    avatar: null,
    permissions: ['fee:manage', 'payment:manage', 'report:financial'],
  },
}

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const navigate = useNavigate()

  // Restore session on app load
  useEffect(() => {
    const restoreSession = () => {
      try {
        const token = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('auth_user')

        if (token && userData) {
          const user = JSON.parse(userData)
          dispatch({
            type: AUTH_ACTIONS.RESTORE_SESSION,
            payload: { user, token },
          })
        } else {
          dispatch({ type: AUTH_ACTIONS.LOGOUT })
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
      }
    }

    restoreSession()
  }, [])

  // Login function
  const login = async (email, password, rememberMe = false) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock authentication - in real app, this would be an API call
      const user = mockUsers[email.toLowerCase()]

      if (!user) {
        throw new Error('Invalid email or password')
      }

      // For demo purposes, any password works
      // In real app, you'd verify the password hash

      const token = `mock_token_${Date.now()}_${user.id}`

      // Store session
      if (rememberMe) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      } else {
        sessionStorage.setItem('auth_token', token)
        sessionStorage.setItem('auth_user', JSON.stringify(user))
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      })

      // Redirect to role-specific dashboard
      navigate(`/dashboard/${user.role}`)

      return { success: true, user }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message },
      })
      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')

    dispatch({ type: AUTH_ACTIONS.LOGOUT })
    navigate('/login')
  }

  // Update user function
  const updateUser = userData => {
    const updatedUser = { ...state.user, ...userData }

    // Update stored user data
    const token =
      localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    if (token) {
      if (localStorage.getItem('auth_token')) {
        localStorage.setItem('auth_user', JSON.stringify(updatedUser))
      } else {
        sessionStorage.setItem('auth_user', JSON.stringify(updatedUser))
      }
    }

    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    })
  }

  // Check if user has permission
  const hasPermission = permission => {
    if (!state.user || !state.user.permissions) return false

    // Admin has all permissions
    if (state.user.permissions.includes('*')) return true

    return state.user.permissions.includes(permission)
  }

  // Check if user has any of the given roles
  const hasRole = roles => {
    if (!state.user) return false

    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(state.user.role)
  }

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    hasPermission,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
export default AuthProvider
