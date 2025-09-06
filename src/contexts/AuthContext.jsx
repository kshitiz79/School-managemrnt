import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react'
import {
  validateCredentials,
  storeAuthData,
  getStoredAuthData,
  clearAuthData,
  isTokenExpired,
} from '../utils/auth'

// Auth action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  RESTORE_SESSION: 'RESTORE_SESSION',
  CLEAR_ERROR: 'CLEAR_ERROR',
}

// Initial auth state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
      }

    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

// Create Auth Context
const AuthContext = createContext(null)

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Restore session on app load
  useEffect(() => {
    const storedAuth = getStoredAuthData()
    if (storedAuth && !isTokenExpired(storedAuth.token)) {
      dispatch({
        type: AUTH_ACTIONS.RESTORE_SESSION,
        payload: storedAuth,
      })
    } else if (storedAuth) {
      // Token expired, clear storage
      clearAuthData()
    }
  }, [])

  // Login function
  const login = useCallback(
    async (email, password, role, rememberMe = false) => {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })

      try {
        const authData = await validateCredentials(email, password, role)

        // Store auth data
        storeAuthData(authData.user, authData.token, rememberMe)

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: authData,
        })

        return authData
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: error.message },
        })
        throw error
      }
    },
    [],
  )

  // Logout function
  const logout = useCallback(() => {
    clearAuthData()
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }, [])

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }, [dispatch])

  // Update user data (for role switching in demo)
  const updateUser = useCallback(
    userData => {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: userData,
          token: state.token,
        },
      })

      // Update stored data
      const rememberMe = localStorage.getItem('remember_me') === 'true'
      storeAuthData(userData, state.token, rememberMe)
    },
    [state.token],
  )

  // Check if user has permission
  const hasPermission = useCallback(
    permission => {
      if (!state.user || !state.user.permissions) return false

      // Admin has all permissions
      if (state.user.permissions.includes('*')) return true

      return state.user.permissions.includes(permission)
    },
    [state.user],
  )

  // Check if user has any of the given roles
  const hasRole = useCallback(
    roles => {
      if (!state.user) return false

      const roleArray = Array.isArray(roles) ? roles : [roles]
      return roleArray.includes(state.user.role)
    },
    [state.user],
  )

  const value = {
    ...state,
    loading: state.isLoading, // Add loading alias for compatibility
    login,
    logout,
    clearError,
    updateUser,
    hasPermission,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
