import React, { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react'
import { withRoleGuard } from '../../guards/withRoleGuard.jsx'
import { USER_ROLES } from '../../constants/auth'
import {
  useStudents,
  useStaff,
  useCreateStudent,
  useDeleteStudent,
} from '../../hooks/useApi'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  DataTable,
  QuickActions,
  ConfirmDialog,
  FormDialog,
  LoadingSkeleton,
  ErrorState,
} from '../../components/ui'

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Fetch data using React Query hooks
  const {
    data: students = [],
    isLoading: studentsLoading,
    error: studentsError,
  } = useStudents({
    name: searchTerm,
    status: roleFilter === 'student' ? 'active' : undefined,
  })

  const {
    data: staff = [],
    isLoading: staffLoading,
    error: staffError,
  } = useStaff({
    name: searchTerm,
    role: roleFilter && roleFilter !== 'student' ? roleFilter : undefined,
  })

  // Mutations
  const createStudentMutation = useCreateStudent()
  const deleteStudentMutation = useDeleteStudent()

  // Combine and format data
  const users = React.useMemo(() => {
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      role: 'student',
      status: student.status,
      lastLogin: student.lastLogin || 'Never',
      createdAt: student.admissionDate,
      type: 'student',
      originalData: student,
    }))

    const formattedStaff = staff.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      status: member.status,
      lastLogin: member.lastLogin || 'Never',
      createdAt: member.joiningDate,
      type: 'staff',
      originalData: member,
    }))

    return [...formattedStaff, ...formattedStudents]
  }, [students, staff])

  const isLoading = studentsLoading || staffLoading
  const error = studentsError || staffError

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortKey: 'name',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortKey: 'role',
      render: value => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      render: value => (
        <Badge variant={value === 'active' ? 'success' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      sortKey: 'lastLogin',
      render: value => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedUser(row)
              setDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const quickActions = [
    {
      id: 'add-user',
      label: 'Add User',
      icon: Plus,
      variant: 'default',
      onClick: () => setAddUserDialogOpen(true),
    },
    {
      id: 'import-users',
      label: 'Import Users',
      icon: Search,
      variant: 'outline',
    },
    {
      id: 'export-users',
      label: 'Export Users',
      icon: Filter,
      variant: 'outline',
    },
  ]

  const handleDeleteUser = async () => {
    if (selectedUser?.type === 'student') {
      try {
        await deleteStudentMutation.mutateAsync(selectedUser.id)
        setDeleteDialogOpen(false)
        setSelectedUser(null)
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  const handleAddUser = async event => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const userData = Object.fromEntries(formData)

    if (userData.role === 'student') {
      try {
        await createStudentMutation.mutateAsync({
          name: userData.name,
          email: userData.email,
          rollNumber: `STU${Date.now()}`,
          admissionNumber: `ADM${Date.now()}`,
          classId: 'class-1', // Default class
          section: 'A',
          status: 'active',
          parentName: 'Parent Name',
          parentPhone: '+1-555-0000',
          parentEmail: userData.email.replace('@', '.parent@'),
          admissionDate: new Date().toISOString().split('T')[0],
        })
        setAddUserDialogOpen(false)
      } catch (error) {
        console.error('Failed to create user:', error)
      }
    }
  }

  // Handle loading states
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage system users and their permissions
            </p>
          </div>
        </div>
        <LoadingSkeleton.Dashboard />
      </div>
    )
  }

  // Handle error states
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          error={error}
          onRetry={() => {
            // Retry logic would go here
            window.location.reload()
          }}
          showRetry={true}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage system users and their permissions
          </p>
        </div>
      </div>

      <QuickActions
        actions={quickActions}
        layout="horizontal"
        variant="compact"
      />

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                leftIcon={Search}
              />
            </div>
            <Select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              placeholder="Filter by role"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="principal">Principal</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="accountant">Accountant</option>
            </Select>
          </div>

          <DataTable
            data={users}
            columns={columns}
            sortable={true}
            paginated={true}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeleteUser}
      />

      <FormDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        title="Add New User"
        description="Create a new user account"
        onSubmit={handleAddUser}
        submitLabel="Create User"
      >
        <div className="space-y-4">
          <Input
            name="name"
            label="Full Name"
            placeholder="Enter full name"
            required
          />
          <Input
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter email address"
            required
          />
          <Select name="role" label="Role" required>
            <option value="">Select role</option>
            <option value="admin">Administrator</option>
            <option value="principal">Principal</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="accountant">Accountant</option>
          </Select>
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Enter password"
            required
            showPasswordToggle
          />
        </div>
      </FormDialog>
    </div>
  )
}

export default withRoleGuard([USER_ROLES.ADMIN])(Users)
