import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Edit,
  Save,
  Users,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { staffAttendanceApi } from '../../lib/api/staffAttendance'

const StaffAttendanceCard = ({
  staff,
  attendance,
  onTimeUpdate,
  isEditable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [timeIn, setTimeIn] = useState(attendance?.timeIn || '')
  const [timeOut, setTimeOut] = useState(attendance?.timeOut || '')
  const [status, setStatus] = useState(attendance?.status || 'present')
  const [remarks, setRemarks] = useState(attendance?.remarks || '')

  const handleSave = () => {
    onTimeUpdate(staff.id, {
      status,
      timeIn,
      timeOut,
      remarks,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTimeIn(attendance?.timeIn || '')
    setTimeOut(attendance?.timeOut || '')
    setStatus(attendance?.status || 'present')
    setRemarks(attendance?.remarks || '')
    setIsEditing(false)
  }

  const getStatusColor = status => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-100'
      case 'absent':
        return 'text-red-600 bg-red-100'
      case 'late':
        return 'text-yellow-600 bg-yellow-100'
      case 'half-day':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const calculateWorkingHours = () => {
    if (!timeIn || !timeOut) return '0:00'

    const inTime = new Date(`2000-01-01 ${timeIn}`)
    const outTime = new Date(`2000-01-01 ${timeOut}`)

    if (outTime < inTime) return '0:00'

    const diff = outTime - inTime
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
            {staff.avatar ? (
              <img
                src={staff.avatar}
                alt={staff.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium">{staff.name}</h3>
            <p className="text-sm text-gray-500">
              {staff.employeeId} • {staff.department}
            </p>
            <p className="text-xs text-gray-400">{staff.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {isEditable && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Working Hours
              </label>
              <div className="text-sm text-gray-600 py-2">
                {calculateWorkingHours()}
              </div>
            </div>
          </div>

          {status !== 'absent' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Time In"
                type="time"
                value={timeIn}
                onChange={e => setTimeIn(e.target.value)}
                size="sm"
              />
              <Input
                label="Time Out"
                type="time"
                value={timeOut}
                onChange={e => setTimeOut(e.target.value)}
                size="sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Add any remarks..."
              className="w-full border rounded px-3 py-2 text-sm h-16 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Time In:</span>
              <div className="font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeIn || '--:--'}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Time Out:</span>
              <div className="font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeOut || '--:--'}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Working Hours:</span>
              <div className="font-medium">{calculateWorkingHours()}</div>
            </div>
          </div>

          {remarks && (
            <div className="text-sm">
              <span className="text-gray-500">Remarks:</span>
              <p className="text-gray-700 mt-1">{remarks}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const AttendanceStats = ({ data }) => {
  const stats = Array.isArray(data)
    ? data.reduce((acc, staff) => {
        const attendance = staff.attendance
        if (attendance) {
          acc[attendance.status] = (acc[attendance.status] || 0) + 1
        } else {
          acc.notMarked = (acc.notMarked || 0) + 1
        }
        return acc
      }, {})
    : {}

  const total = data.length
  const present = stats.present || 0
  const absent = stats.absent || 0
  const late = stats.late || 0
  const halfDay = stats['half-day'] || 0
  const notMarked = stats.notMarked || 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-lg font-bold">{total}</p>
            <p className="text-sm text-gray-600">Total Staff</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-lg font-bold">{present}</p>
            <p className="text-sm text-gray-600">Present</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="text-lg font-bold">{absent}</p>
            <p className="text-sm text-gray-600">Absent</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-yellow-600" />
          <div>
            <p className="text-lg font-bold">{late}</p>
            <p className="text-sm text-gray-600">Late</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-lg font-bold">{halfDay}</p>
            <p className="text-sm text-gray-600">Half Day</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-gray-600" />
          <div>
            <p className="text-lg font-bold">{notMarked}</p>
            <p className="text-sm text-gray-600">Not Marked</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const StaffAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const queryClient = useQueryClient()

  const { data: staffData, isLoading } = useQuery({
    queryKey: ['staff-attendance', selectedDate],
    queryFn: () => staffAttendanceApi.getAttendance(selectedDate),
  })

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => staffAttendanceApi.getDepartments(),
  })

  const saveAttendanceMutation = useMutation({
    mutationFn: staffAttendanceApi.saveAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-attendance'])
      setHasChanges(false)
    },
  })

  const bulkMarkMutation = useMutation({
    mutationFn: staffAttendanceApi.bulkMark,
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-attendance'])
      setHasChanges(false)
    },
  })

  const handleTimeUpdate = (staffId, attendanceData) => {
    // Update local state and mark as changed
    setHasChanges(true)

    // Save immediately or batch updates
    const data = {
      staffId,
      date: selectedDate,
      ...attendanceData,
    }

    saveAttendanceMutation.mutate(data)
  }

  const handleBulkMark = status => {
    const filteredStaff = getFilteredStaff()
    const staffIds = filteredStaff.map(staff => staff.id)

    bulkMarkMutation.mutate({
      date: selectedDate,
      staffIds,
      status,
      timeIn: status === 'present' ? '09:00' : '',
      timeOut: status === 'present' ? '17:00' : '',
    })

    setShowBulkActions(false)
  }

  const getFilteredStaff = () => {
    if (!staffData?.data) return []

    return staffData.data.filter(staff => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDepartment =
        departmentFilter === 'all' || staff.department === departmentFilter
      const matchesStatus =
        statusFilter === 'all' ||
        (staff.attendance?.status || 'not-marked') === statusFilter

      return matchesSearch && matchesDepartment && matchesStatus
    })
  }

  const filteredStaff = getFilteredStaff()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Staff Attendance</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkActions(true)}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Bulk Actions
          </button>
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            View Reports
          </button>
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Date Selection and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            label="Date"
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 mt-6" />
            <Input
              label="Search Staff"
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">All Departments</option>
              {departmentsData?.data?.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
              <option value="not-marked">Not Marked</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <AttendanceStats data={staffData?.data || []} />

      {/* Staff Attendance Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">
            Staff Attendance - {new Date(selectedDate).toLocaleDateString()}
          </h2>
          <div className="text-sm text-gray-500">
            Showing {filteredStaff.length} of {staffData?.data?.length || 0}{' '}
            staff members
          </div>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Staff Found
            </h3>
            <p className="text-gray-500">
              No staff members match your current filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.isArray(filteredStaff) &&
              filteredStaff.map(staff => (
                <StaffAttendanceCard
                  key={staff.id}
                  staff={staff}
                  attendance={staff.attendance}
                  onTimeUpdate={handleTimeUpdate}
                />
              ))}
          </div>
        )}
      </div>

      {/* Bulk Actions Dialog */}
      <Dialog
        open={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        title="Bulk Attendance Actions"
      >
        <div className="space-y-4">
          <p>
            Apply attendance status to all filtered staff members (
            {filteredStaff.length} staff):
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleBulkMark('present')}
              disabled={bulkMarkMutation.isPending}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Mark All Present
            </button>
            <button
              onClick={() => handleBulkMark('absent')}
              disabled={bulkMarkMutation.isPending}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Mark All Absent
            </button>
          </div>
          <button
            onClick={() => setShowBulkActions(false)}
            className="w-full border py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </Dialog>
    </div>
  )
}

export default StaffAttendance
