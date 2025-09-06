import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { examApi } from '../../lib/api/exams'

const ScheduleCalendarView = ({ schedules, onEditSchedule, onViewDetails }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = date => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getSchedulesForDate = date => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return schedules?.filter(schedule => schedule.examDate === dateStr) || []
  }

  const navigateMonth = direction => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 border rounded-lg hover:bg-gray-50"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 border rounded-lg hover:bg-gray-50"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-500 border-b"
          >
            {day}
          </div>
        ))}

        {Array.isArray(days) &&
          days.map((day, index) => {
            const daySchedules = day ? getSchedulesForDate(day) : []
            const isToday =
              day && day.toDateString() === new Date().toDateString()

            return (
              <div
                key={index}
                className={`min-h-[100px] p-1 border border-gray-100 ${
                  !day
                    ? 'bg-gray-50'
                    : isToday
                      ? 'bg-blue-50'
                      : 'bg-white hover:bg-gray-50'
                }`}
              >
                {day && (
                  <>
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {daySchedules.slice(0, 2).map(schedule => (
                        <div
                          key={schedule.id}
                          onClick={() => onViewDetails(schedule)}
                          className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 truncate"
                          title={`${schedule.subjectName} - ${schedule.examGroupName}`}
                        >
                          {schedule.subjectName}
                        </div>
                      ))}
                      {daySchedules.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{daySchedules.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

const ScheduleListView = ({
  schedules,
  onEditSchedule,
  onDeleteSchedule,
  onViewDetails,
}) => {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Schedules Found
        </h3>
        <p className="text-gray-500">
          No exam schedules match your current filters.
        </p>
      </div>
    )
  }

  const getStatusColor = status => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-100'
      case 'ongoing':
        return 'text-green-600 bg-green-100'
      case 'completed':
        return 'text-gray-600 bg-gray-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">Date & Time</th>
              <th className="text-left py-3 px-4">Exam Group</th>
              <th className="text-left py-3 px-4">Subject</th>
              <th className="text-left py-3 px-4">Class</th>
              <th className="text-left py-3 px-4">Room</th>
              <th className="text-left py-3 px-4">Duration</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-center py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(schedules) &&
              schedules.map(schedule => (
                <tr key={schedule.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {new Date(schedule.examDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{schedule.examGroupName}</div>
                    <div className="text-sm text-gray-500">
                      {schedule.examType}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      {schedule.subjectName}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {schedule.className} - {schedule.section}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {schedule.examRoom || 'Not assigned'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {schedule.duration} min
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}
                    >
                      {schedule.status.charAt(0).toUpperCase() +
                        schedule.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onViewDetails(schedule)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditSchedule(schedule)}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSchedule(schedule)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ScheduleDialog = ({ schedule, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    examGroupId: schedule?.examGroupId || '',
    subjectId: schedule?.subjectId || '',
    classId: schedule?.classId || '',
    section: schedule?.section || '',
    examDate: schedule?.examDate || '',
    startTime: schedule?.startTime || '',
    endTime: schedule?.endTime || '',
    duration: schedule?.duration || 180,
    examRoom: schedule?.examRoom || '',
    maxStudents: schedule?.maxStudents || 30,
    instructions: schedule?.instructions || '',
    status: schedule?.status || 'scheduled',
    invigilators: schedule?.invigilators || [],
  })

  const { data: examGroupsData } = useQuery({
    queryKey: ['exam-groups', 'active'],
    queryFn: () => examApi.getActiveExamGroups(),
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: () => examApi.getSubjects(),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => examApi.getClasses(),
  })

  const { data: staffData } = useQuery({
    queryKey: ['staff', 'teachers'],
    queryFn: () => examApi.getTeachers(),
  })

  const handleSave = () => {
    onSave(schedule?.id, formData)
    onClose()
  }

  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return ''

    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + parseInt(duration)

    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60

    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  }

  const handleStartTimeChange = startTime => {
    setFormData(prev => ({
      ...prev,
      startTime,
      endTime: calculateEndTime(startTime, prev.duration),
    }))
  }

  const handleDurationChange = duration => {
    setFormData(prev => ({
      ...prev,
      duration: parseInt(duration) || 0,
      endTime: calculateEndTime(prev.startTime, duration),
    }))
  }

  const toggleInvigilator = staffId => {
    setFormData(prev => ({
      ...prev,
      invigilators: prev.invigilators.includes(staffId)
        ? prev.invigilators.filter(id => id !== staffId)
        : [...prev.invigilators, staffId],
    }))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={schedule ? 'Edit Exam Schedule' : 'Create Exam Schedule'}
      size="xl"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Exam Group *
            </label>
            <select
              value={formData.examGroupId}
              onChange={e =>
                setFormData(prev => ({ ...prev, examGroupId: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Exam Group</option>
              {examGroupsData?.data?.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <select
              value={formData.subjectId}
              onChange={e =>
                setFormData(prev => ({ ...prev, subjectId: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Subject</option>
              {Array.isArray(subjectsData?.data) &&
                subjectsData.data.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Class *</label>
            <select
              value={formData.classId}
              onChange={e =>
                setFormData(prev => ({ ...prev, classId: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Class</option>
              {Array.isArray(classesData?.data) &&
                classesData.data.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
            </select>
          </div>
          <Input
            label="Section *"
            value={formData.section}
            onChange={e =>
              setFormData(prev => ({ ...prev, section: e.target.value }))
            }
            placeholder="A, B, C..."
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Exam Date *"
            type="date"
            value={formData.examDate}
            onChange={e =>
              setFormData(prev => ({ ...prev, examDate: e.target.value }))
            }
          />
          <Input
            label="Start Time *"
            type="time"
            value={formData.startTime}
            onChange={e => handleStartTimeChange(e.target.value)}
          />
          <Input
            label="Duration (minutes) *"
            type="number"
            value={formData.duration}
            onChange={e => handleDurationChange(e.target.value)}
            min="1"
          />
          <Input
            label="End Time"
            type="time"
            value={formData.endTime}
            readOnly
            className="bg-gray-50"
          />
        </div>

        {/* Venue and Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Exam Room"
            value={formData.examRoom}
            onChange={e =>
              setFormData(prev => ({ ...prev, examRoom: e.target.value }))
            }
            placeholder="Room number or name"
          />
          <Input
            label="Max Students"
            type="number"
            value={formData.maxStudents}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                maxStudents: parseInt(e.target.value) || 0,
              }))
            }
            min="1"
          />
        </div>

        {/* Invigilators */}
        <div>
          <label className="block text-sm font-medium mb-2">Invigilators</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {staffData?.data?.map(staff => (
              <label key={staff.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.invigilators.includes(staff.id)}
                  onChange={() => toggleInvigilator(staff.id)}
                  className="rounded"
                />
                <span className="text-sm">{staff.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Special Instructions
          </label>
          <textarea
            value={formData.instructions}
            onChange={e =>
              setFormData(prev => ({ ...prev, instructions: e.target.value }))
            }
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Any special instructions for the exam..."
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={e =>
              setFormData(prev => ({ ...prev, status: e.target.value }))
            }
            className="w-full border rounded-lg px-3 py-2 max-w-xs"
          >
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={
              !formData.examGroupId ||
              !formData.subjectId ||
              !formData.classId ||
              !formData.examDate
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {schedule ? 'Update' : 'Create'} Schedule
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const BulkScheduleDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    examGroupId: '',
    classIds: [],
    subjects: [],
    startDate: '',
    endDate: '',
    startTime: '09:00',
    duration: 180,
    examRoom: '',
    maxStudents: 30,
    skipWeekends: true,
    skipHolidays: true,
  })

  const { data: examGroupsData } = useQuery({
    queryKey: ['exam-groups', 'active'],
    queryFn: () => examApi.getActiveExamGroups(),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => examApi.getClasses(),
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: () => examApi.getSubjects(),
  })

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const toggleClass = classId => {
    setFormData(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId],
    }))
  }

  const toggleSubject = subjectId => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId],
    }))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Bulk Create Exam Schedules"
      size="xl"
    >
      <div className="space-y-6">
        {/* Exam Group */}
        <div>
          <label className="block text-sm font-medium mb-1">Exam Group *</label>
          <select
            value={formData.examGroupId}
            onChange={e =>
              setFormData(prev => ({ ...prev, examGroupId: e.target.value }))
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Exam Group</option>
            {examGroupsData?.data?.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Classes */}
        <div>
          <label className="block text-sm font-medium mb-2">Classes *</label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
            {Array.isArray(classesData?.data) &&
              classesData.data.map(cls => (
                <label key={cls.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.classIds.includes(cls.id)}
                    onChange={() => toggleClass(cls.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{cls.name}</span>
                </label>
              ))}
          </div>
        </div>

        {/* Subjects */}
        <div>
          <label className="block text-sm font-medium mb-2">Subjects *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {Array.isArray(subjectsData?.data) &&
              subjectsData.data.map(subject => (
                <label key={subject.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject.id)}
                    onChange={() => toggleSubject(subject.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{subject.name}</span>
                </label>
              ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            type="date"
            value={formData.startDate}
            onChange={e =>
              setFormData(prev => ({ ...prev, startDate: e.target.value }))
            }
          />
          <Input
            label="End Date *"
            type="date"
            value={formData.endDate}
            onChange={e =>
              setFormData(prev => ({ ...prev, endDate: e.target.value }))
            }
          />
        </div>

        {/* Time and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Start Time *"
            type="time"
            value={formData.startTime}
            onChange={e =>
              setFormData(prev => ({ ...prev, startTime: e.target.value }))
            }
          />
          <Input
            label="Duration (minutes) *"
            type="number"
            value={formData.duration}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                duration: parseInt(e.target.value) || 0,
              }))
            }
            min="1"
          />
          <Input
            label="Max Students"
            type="number"
            value={formData.maxStudents}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                maxStudents: parseInt(e.target.value) || 0,
              }))
            }
            min="1"
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.skipWeekends}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  skipWeekends: e.target.checked,
                }))
              }
              className="rounded"
            />
            <span className="text-sm">Skip weekends</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.skipHolidays}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  skipHolidays: e.target.checked,
                }))
              }
              className="rounded"
            />
            <span className="text-sm">Skip holidays</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={
              !formData.examGroupId ||
              formData.classIds.length === 0 ||
              formData.subjects.length === 0
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Create Schedules
          </button>
        </div>
      </div>
    </Dialog>
  )
}
const ExamSchedule = () => {
  const [viewMode, setViewMode] = useState('calendar') // calendar, list
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterExamGroup, setFilterExamGroup] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const queryClient = useQueryClient()

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ['exam-schedules', 'all'],
    queryFn: () => examApi.getExamSchedules(),
  })

  const { data: examGroupsData } = useQuery({
    queryKey: ['exam-groups', 'active'],
    queryFn: () => examApi.getActiveExamGroups(),
  })

  const saveScheduleMutation = useMutation({
    mutationFn: ({ id, data }) =>
      id
        ? examApi.updateExamSchedule(id, data)
        : examApi.createExamSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['exam-schedules'])
      setShowScheduleDialog(false)
      setSelectedSchedule(null)
    },
  })

  const bulkCreateSchedulesMutation = useMutation({
    mutationFn: examApi.bulkCreateSchedules,
    onSuccess: () => {
      queryClient.invalidateQueries(['exam-schedules'])
      setShowBulkDialog(false)
    },
  })

  const deleteScheduleMutation = useMutation({
    mutationFn: examApi.deleteExamSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries(['exam-schedules'])
    },
  })

  const handleEditSchedule = schedule => {
    setSelectedSchedule(schedule)
    setShowScheduleDialog(true)
  }

  const handleDeleteSchedule = schedule => {
    if (
      confirm(
        `Are you sure you want to delete the exam schedule for ${schedule.subjectName}?`,
      )
    ) {
      deleteScheduleMutation.mutate(schedule.id)
    }
  }

  const handleViewDetails = schedule => {
    setSelectedSchedule(schedule)
    setShowDetailsDialog(true)
  }

  const handleSaveSchedule = (id, data) => {
    saveScheduleMutation.mutate({ id, data })
  }

  const handleBulkCreate = data => {
    bulkCreateSchedulesMutation.mutate(data)
  }

  const handleAddSchedule = () => {
    setSelectedSchedule(null)
    setShowScheduleDialog(true)
  }

  const handleExportSchedule = () => {
    // Export functionality
    console.log('Exporting schedule...')
  }

  const filteredSchedules =
    schedulesData?.data?.filter(schedule => {
      const matchesSearch =
        schedule.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.examGroupName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        schedule.className.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesExamGroup =
        filterExamGroup === 'all' || schedule.examGroupId === filterExamGroup
      const matchesStatus =
        filterStatus === 'all' || schedule.status === filterStatus

      return matchesSearch && matchesExamGroup && matchesStatus
    }) || []

  const getStatistics = () => {
    const schedules = schedulesData?.data || []
    const today = new Date().toISOString().split('T')[0]

    return {
      total: schedules.length,
      today: schedules.filter(s => s.examDate === today).length,
      upcoming: schedules.filter(
        s => s.examDate > today && s.status === 'scheduled',
      ).length,
      completed: schedules.filter(s => s.status === 'completed').length,
    }
  }

  const stats = getStatistics()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exam Schedule</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkDialog(true)}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Bulk Create
          </button>
          <button
            onClick={handleExportSchedule}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleAddSchedule}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Schedules</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.today}</p>
              <p className="text-sm text-gray-600">Today's Exams</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.upcoming}</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
            </div>
            <select
              value={filterExamGroup}
              onChange={e => setFilterExamGroup(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Exam Groups</option>
              {examGroupsData?.data?.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                viewMode === 'calendar'
                  ? 'bg-blue-100 text-blue-700'
                  : 'border hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-700'
                  : 'border hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Schedule View */}
      {viewMode === 'calendar' ? (
        <ScheduleCalendarView
          schedules={filteredSchedules}
          onEditSchedule={handleEditSchedule}
          onViewDetails={handleViewDetails}
        />
      ) : (
        <ScheduleListView
          schedules={filteredSchedules}
          onEditSchedule={handleEditSchedule}
          onDeleteSchedule={handleDeleteSchedule}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Schedule Dialog */}
      <ScheduleDialog
        schedule={selectedSchedule}
        open={showScheduleDialog}
        onClose={() => {
          setShowScheduleDialog(false)
          setSelectedSchedule(null)
        }}
        onSave={handleSaveSchedule}
      />

      {/* Bulk Create Dialog */}
      <BulkScheduleDialog
        open={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        onSave={handleBulkCreate}
      />

      {/* Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        title="Exam Schedule Details"
        size="lg"
      >
        {selectedSchedule && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exam Group
                </label>
                <p className="text-sm">{selectedSchedule.examGroupName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <p className="text-sm">{selectedSchedule.subjectName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <p className="text-sm">
                  {selectedSchedule.className} - {selectedSchedule.section}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date & Time
                </label>
                <p className="text-sm">
                  {new Date(selectedSchedule.examDate).toLocaleDateString()} |
                  {selectedSchedule.startTime} - {selectedSchedule.endTime}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Room
                </label>
                <p className="text-sm">
                  {selectedSchedule.examRoom || 'Not assigned'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <p className="text-sm">{selectedSchedule.duration} minutes</p>
              </div>
            </div>

            {selectedSchedule.instructions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <p className="text-sm bg-gray-50 p-3 rounded">
                  {selectedSchedule.instructions}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

export default ExamSchedule
