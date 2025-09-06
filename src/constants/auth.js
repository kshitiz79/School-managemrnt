// User roles in the school management system
export const USER_ROLES = {
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  ACCOUNTANT: 'accountant',
}

// Role hierarchy for permissions
export const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: 6,
  [USER_ROLES.PRINCIPAL]: 5,
  [USER_ROLES.TEACHER]: 4,
  [USER_ROLES.ACCOUNTANT]: 3,
  [USER_ROLES.PARENT]: 2,
  [USER_ROLES.STUDENT]: 1,
}

// Role display names
export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.PRINCIPAL]: 'Principal',
  [USER_ROLES.TEACHER]: 'Teacher',
  [USER_ROLES.STUDENT]: 'Student',
  [USER_ROLES.PARENT]: 'Parent',
  [USER_ROLES.ACCOUNTANT]: 'Accountant',
}

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
}

// Mock users for demonstration
export const MOCK_USERS = [
  {
    id: 1,
    name: 'John Admin',
    email: 'admin@school.edu',
    role: USER_ROLES.ADMIN,
    password: 'admin123',
  },
  {
    id: 2,
    name: 'Sarah Principal',
    email: 'principal@school.edu',
    role: USER_ROLES.PRINCIPAL,
    password: 'principal123',
  },
  {
    id: 3,
    name: 'Mike Teacher',
    email: 'teacher@school.edu',
    role: USER_ROLES.TEACHER,
    password: 'teacher123',
  },
  {
    id: 4,
    name: 'Emma Student',
    email: 'student@school.edu',
    role: USER_ROLES.STUDENT,
    password: 'student123',
  },
  {
    id: 5,
    name: 'David Parent',
    email: 'parent@school.edu',
    role: USER_ROLES.PARENT,
    password: 'parent123',
  },
  {
    id: 6,
    name: 'Lisa Accountant',
    email: 'accountant@school.edu',
    role: USER_ROLES.ACCOUNTANT,
    password: 'accountant123',
  },
]
