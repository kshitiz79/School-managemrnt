import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Download,
  Save,
  TrendingUp,
  BarChart3,
  User,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { studentAttendanceApi } from '../../lib/api/studentAttendance'
import { classesApi } from '../../lib/api/classes'
import { sectionsApi } from '../../lib/api/sections'
import { studentsApi } from '../../lib/api/students'

// Validation Schema
const attendanceSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  date: z.string().min(1, 'Date is required'),
  period: z.string().optional(),
  attendanceType: z.enum(['daily', 'period'], {
    required_error: 'Attendance type is required',
  }),
  notes: z.string().optional(),
})

const AttendanceChart = ({ data, type = 'daily' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No attendance data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Attendance Trends</h3>
      <div className="grid grid-cols-7 gap-2">
        {Array.isArray(data) &&
          data.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(day.date).toLocaleDateString('en', {
                  weekday: 'short',
                })}
              </div>
              <div className="relative h-20 bg-gray-100 rounded">
                <div
                  className="absolute bottom-0 w-full bg-green-500 rounded"
                  style={{ height: `${(day.present / day.total) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {Math.round((day.present / day.total) * 100)}%
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {day.present}/{day.total}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

const AttendanceGrid = ({
  students,
  attendance,
  onAttendanceChange,
  isEditable = true,
}) => {
  const getAttendanceStatus = studentId => {
    const record = attendance.find(a => a.studentId === studentId)
    return record?.status || 'present'
  }

  const getAttendanceReason = studentId => {
    const record = attendance.find(a => a.studentId === studentId)
    return record?.reason || ''
  }

  const handleStatusChange = (studentId, status) => {
    if (!isEditable) return
    onAttendanceChange(studentId, { status, reason: '' })
  }

  const handleReasonChange = (studentId, reason) => {
    if (!isEditable) return
    const currentStatus = getAttendanceStatus(studentId)
    onAttendanceChange(studentId, { status: currentStatus, reason })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        {Array.isArray(students) &&
          students.map(student => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-gray-500">
                    Roll: {student.rollNumber}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'present')}
                    disabled={!isEditable}
                    className={`p-2 rounded-lg ${
                      getAttendanceStatus(student.id) === 'present'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                    } ${!isEditable ? 'cursor-not-allowed opacity-50' : 'border'}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    disabled={!isEditable}
                    className={`p-2 rounded-lg ${
                      getAttendanceStatus(student.id) === 'absent'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                    } ${!isEditable ? 'cursor-not-allowed opacity-50' : 'border'}`}
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'late')}
                    disabled={!isEditable}
                    className={`p-2 rounded-lg ${
                      getAttendanceStatus(student.id) === 'late'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                    } ${!isEditable ? 'cursor-not-allowed opacity-50' : 'border'}`}
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                </div>

                {getAttendanceStatus(student.id) === 'absent' && (
                  <input
                    type="text"
                    placeholder="Reason for absence"
                    value={getAttendanceReason(student.id)}
                    onChange={e =>
                      handleReasonChange(student.id, e.target.value)
                    }
                    disabled={!isEditable}
                    className="text-sm border rounded px-2 py-1 w-40 disabled:bg-gray-100"
                  />
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

const StudentAttendance = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [attendance, setAttendance] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showTrends, setShowTrends] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const queryClient = useQueryClient()

  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attendanceSchema),
    mode: 'onChange',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      attendanceType: 'daily',
    },
  })

  const watchedClass = watch('classId')
  const watchedSection = watch('sectionId')
  const watchedDate = watch('date')
  const watchedType = watch('attendanceType')

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.getAll({ all: true }),
  })

  const { data: sectionsData } = useQuery({
    queryKey: ['sections', 'by-class', watchedClass],
    queryFn: () => sectionsApi.getByClass(watchedClass),
    enabled: !!watchedClass,
  })

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'by-section', watchedSection],
    queryFn: () => studentsApi.getBySection(watchedSection),
    enabled: !!watchedSection,
  })

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: [
      'attendance',
      'student',
      watchedClass,
      watchedSection,
      watchedDate,
      watchedType,
      selectedPeriod,
    ],
    queryFn: () =>
      studentAttendanceApi.getAttendance({
        classId: watchedClass,
        sectionId: watchedSection,
        date: watchedDate,
        type: watchedType,
        period: selectedPeriod,
      }),
    enabled: !!watchedClass && !!watchedSection && !!watchedDate,
  })

  const { data: trendsData } = useQuery({
    queryKey: ['attendance', 'trends', watchedClass, watchedSection],
    queryFn: () =>
      studentAttendanceApi.getTrends({
        classId: watchedClass,
        sectionId: watchedSection,
        days: 7,
      }),
    enabled: !!watchedClass && !!watchedSection && showTrends,
  })

  const saveAttendanceMutation = useMutation({
    mutationFn: studentAttendanceApi.saveAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance'])
      setHasChanges(false)
    },
  })

  const bulkMarkMutation = useMutation({
    mutationFn: studentAttendanceApi.bulkMark,
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance'])
      setHasChanges(false)
    },
  })

  // Initialize attendance when data loads
  React.useEffect(() => {
    if (attendanceData?.data) {
      setAttendance(attendanceData.data)
    } else if (studentsData?.data) {
      // Initialize with all present
      const initialAttendance = studentsData.data.map(student => ({
        studentId: student.id,
        status: 'present',
        reason: '',
      }))
      setAttendance(initialAttendance)
    }
  }, [attendanceData, studentsData])

  const handleAttendanceChange = (studentId, { status, reason }) => {
    setAttendance(prev => {
      const updated = prev.map(record =>
        record.studentId === studentId ? { ...record, status, reason } : record
      )

      // If student not found, add new record
      if (!prev.find(record => record.studentId === studentId)) {
        updated.push({ studentId, status, reason })
      }

      return updated
    })
    setHasChanges(true)
  }

  const handleBulkMark = status => {
    const bulkData = {
      classId: watchedClass,
      sectionId: watchedSection,
      date: watchedDate,
      type: watchedType,
      period: selectedPeriod,
      status,
      studentIds: studentsData?.data?.map(s => s.id) || [],
    }

    bulkMarkMutation.mutate(bulkData)
    setShowBulkActions(false)
  }

  const handleSaveAttendance = () => {
    const data = {
      classId: watchedClass,
      sectionId: watchedSection,
      date: watchedDate,
      type: watchedType,
      period: selectedPeriod,
      attendance,
    }

    saveAttendanceMutation.mutate(data)
  }

  const getAttendanceStats = () => {
    const total = attendance.length
    const present = attendance.filter(a => a.status === 'present').length
    const absent = attendance.filter(a => a.status === 'absent').length
    const late = attendance.filter(a => a.status === 'late').length

    return { total, present, absent, late }
  }

  const stats = getAttendanceStats()
  const periods = ['1', '2', '3', '4', '5', '6', '7', '8']

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Attendance</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTrends(true)}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            View Trends
          </button>
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          {hasChanges && (
            <button
              onClick={handleSaveAttendance}
              disabled={saveAttendanceMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saveAttendanceMutation.isPending
                ? 'Saving...'
                : 'Save Attendance'}
            </button>
          )}
        </div>
      </div>

      {/* Attendance Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Input
                label="Date"
                type="date"
                {...field}
                error={errors.date?.message}
              />
            )}
          />
          <Controller
            name="classId"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select
                  {...field}
                  onChange={e => {
                    field.onChange(e)
                    setValue('sectionId', '')
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    errors.classId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select Class</option>
                  {Array.isArray(classesData?.data) &&
                    classesData.data.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                </select>
                {errors.classId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.classId.message}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            name="sectionId"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Section
                </label>
                <select
                  {...field}
                  disabled={!watchedClass}
                  className={`w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 ${
                    errors.sectionId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select Section</option>
                  {Array.isArray(sectionsData?.data) &&
                    sectionsData.data.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                </select>
                {errors.sectionId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.sectionId.message}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            name="attendanceType"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  {...field}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="daily">Daily</option>
                  <option value="period">Period Wise</option>
                </select>
              </div>
            )}
          />
          {watchedType === 'period' && (
            <div>
              <label className="block text-sm font-medium mb-1">Period</label>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Period</option>
                {Array.isArray(periods) &&
                  periods.map(period => (
                    <option key={period} value={period}>
                      Period {period}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <div className="flex items-end">
            <button
              onClick={() => setShowBulkActions(true)}
              disabled={!watchedClass || !watchedSection}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Bulk Actions
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {studentsData?.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.present}</p>
                <p className="text-sm text-gray-600">Present</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.absent}</p>
                <p className="text-sm text-gray-600">Absent</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.late}</p>
                <p className="text-sm text-gray-600">Late</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Grid */}
      {studentsData?.data && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">
              Mark Attendance -{' '}
              {classesData?.data?.find(c => c.id === watchedClass)?.name}
              {sectionsData?.data?.find(s => s.id === watchedSection)?.name &&
                ` - ${sectionsData.data.find(s => s.id === watchedSection).name}`}
            </h2>
            <div className="text-sm text-gray-500">
              {new Date(watchedDate).toLocaleDateString()}
              {watchedType === 'period' &&
                selectedPeriod &&
                ` - Period ${selectedPeriod}`}
            </div>
          </div>

          <AttendanceGrid
            students={studentsData.data}
            attendance={attendance}
            onAttendanceChange={handleAttendanceChange}
          />
        </div>
      )}

      {/* Bulk Actions Dialog */}
      <Dialog
        open={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        title="Bulk Attendance Actions"
      >
        <div className="space-y-4">
          <p>
            Apply attendance status to all students in the selected
            class/section:
          </p>
          <div className="flex gap-4">
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

      {/* Trends Dialog */}
      <Dialog
        open={showTrends}
        onClose={() => setShowTrends(false)}
        title="Attendance Trends"
        size="lg"
      >
        <div className="space-y-6">
          {trendsData?.data ? (
            <AttendanceChart data={trendsData.data} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Loading trends data...</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setShowTrends(false)}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default StudentAttendance
