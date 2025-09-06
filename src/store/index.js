import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Example store using Zustand
export const useAppStore = create(
  devtools(
    set => ({
      // State
      theme: 'light',
      isLoading: false,
      notifications: [],
      sidebarCollapsed: false,

      // Actions
      setTheme: theme => set({ theme }, false, 'setTheme'),
      setLoading: isLoading => set({ isLoading }, false, 'setLoading'),
      setSidebarCollapsed: collapsed =>
        set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),

      // Notifications
      addNotification: notification =>
        set(
          state => ({
            notifications: [
              ...state.notifications,
              { ...notification, id: Date.now() },
            ],
          }),
          false,
          'addNotification'
        ),

      removeNotification: id =>
        set(
          state => ({
            notifications: state.notifications.filter(n => n.id !== id),
          }),
          false,
          'removeNotification'
        ),

      // Reset store
      reset: () =>
        set(
          {
            theme: 'light',
            isLoading: false,
            notifications: [],
            sidebarCollapsed: false,
          },
          false,
          'reset'
        ),
    }),
    {
      name: 'app-store',
    }
  )
)
