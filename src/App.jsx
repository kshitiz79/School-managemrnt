import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { USER_ROLES } from './constants/auth'
import Login from './pages/auth/Login'
import AppLayout from './components/layout/AppLayout'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import ParentDashboard from './pages/dashboard/ParentDashboard'
import AccountantDashboard from './pages/dashboard/AccountantDashboard'
import PrincipalDashboard from './pages/dashboard/PrincipalDashboard'

// Tool pages
import QrAttendance from './pages/QrAttendance'
import Certificates from './pages/Certificates'
import Downloads from './pages/Downloads'

// Settings pages
import ProfileSettings from './pages/settings/ProfileSettings'
import Preferences from './pages/settings/Preferences'

// Feature Module Routes
import FinanceRoutes from './pages/finance'
import CommunicationRoutes from './pages/communication'
import HomeworkRoutes from './pages/homework'
import LessonPlanRoutes from './pages/lessonplan'
import StudentsRoutes from './pages/students'
import AttendanceRoutes from './pages/attendance'
import MastersRoutes from './pages/masters'
import TermRoutes from './pages/term'
import TimetableRoutes from './pages/timetable'
import BehaviourRoutes from './pages/behaviour'
import ExamsRoutes from './pages/exams'
import FeesRoutes from './pages/fees'

// App Routes Component (needs to be inside AuthProvider)
const AppRoutes = () => {
  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />
  }

  // Dashboard Redirect Component
  const DashboardRedirect = () => {
    const { user, isAuthenticated } = useAuth()

    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />
    }

    // Redirect based on user role
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return <Navigate to="/dashboard/admin" replace />
      case USER_ROLES.PRINCIPAL:
        return <Navigate to="/dashboard/principal" replace />
      case USER_ROLES.TEACHER:
        return <Navigate to="/dashboard/teacher" replace />
      case USER_ROLES.STUDENT:
        return <Navigate to="/dashboard/student" replace />
      case USER_ROLES.PARENT:
        return <Navigate to="/dashboard/parent" replace />
      case USER_ROLES.ACCOUNTANT:
        return <Navigate to="/dashboard/accountant" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes with Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard redirect route */}
        <Route index element={<DashboardRedirect />} />

        {/* Role-specific dashboard routes */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="principal" element={<PrincipalDashboard />} />
        <Route path="teacher" element={<TeacherDashboard />} />
        <Route path="student" element={<StudentDashboard />} />
        <Route path="parent" element={<ParentDashboard />} />
        <Route path="accountant" element={<AccountantDashboard />} />

        {/* Feature Module Routes */}
        <Route path="finance/*" element={<FinanceRoutes />} />
        <Route path="communication/*" element={<CommunicationRoutes />} />
        <Route path="homework/*" element={<HomeworkRoutes />} />
        <Route path="lessonplan/*" element={<LessonPlanRoutes />} />
        <Route path="students/*" element={<StudentsRoutes />} />
        <Route path="attendance/*" element={<AttendanceRoutes />} />
        <Route path="masters/*" element={<MastersRoutes />} />
        <Route path="term/*" element={<TermRoutes />} />
        <Route path="timetable/*" element={<TimetableRoutes />} />
        <Route path="behaviour/*" element={<BehaviourRoutes />} />
        <Route path="exams/*" element={<ExamsRoutes />} />
        <Route path="fees/*" element={<FeesRoutes />} />

        {/* Tool Routes */}
        <Route path="qr-attendance" element={<QrAttendance />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="downloads" element={<Downloads />} />

        {/* Settings Routes */}
        <Route path="settings/profile" element={<ProfileSettings />} />
        <Route path="settings/preferences" element={<Preferences />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
