import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Users,
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  GraduationCap,
  ArrowRight,
  X,
  Save,
  History,
} from 'lucide-react'
import { Table } from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { Dropdown } from '../../components/ui/Dropdown'
import { multiClassStudentApi } from '../../lib/api/multiClassStudent'
import { studentsApi } from '../../lib/api/students'
import { classesApi } from '../../lib/api/classes'
import { sectionsApi } from '../../lib/api/sections'
import { subjectsApi } from '../../lib/api/subjects'
import { auditLogApi } from '../../lib/api/auditLog'

// Validation Schema
const multiClassEnrollmentSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  primaryClassId: z.string().min(1, 'Primary class is required'),
  primarySectionId: z.string().min(1, 'Primary section is required'),
  enrollments: z
    .array(
      z.object({
        classId: z.string().min(1, 'Class is required'),
        sectionId: z.string().min(1, 'Section is required'),
        subjectIds: z
          .array(z.string())
          .min(1, 'At least one subject is required'),
        enrollmentType: z.enum(
          ['elective', 'advanced', 'remedial', 'special'],
          {
            required_error: 'Enrollment type is required',
          },
        ),
        startDate: z.string().min(1, 'Start date is required'),
        endDate: z.string().optional(),
        isActive: z.boolean().default(true),
      }),
    )
    .min(1, 'At least one enrollment is required'),
  reason: z.string().min(1, 'Reason for multi-class enrollment is required'),
  approvedBy: z.string().min(1, 'Approval authority is required'),
  approvalDate: z.string().min(1, 'Approval date is required'),
  parentConsent: z.boolean().refine(val => val === true, {
    message: 'Parent consent is required',
  }),
  isActive: z.boolean().default(true),
})

const EnrollmentCard = ({ enrollment, onEdit, onRemove }) => {
  const getTypeColor = type => {
    switch (type) {
      case 'elective':
        return 'bg-blue-100 text-blue-800'
      case 'advanced':
        return 'bg-green-100 text-green-800'
      case 'remedial':
        return 'bg-yellow-100 text-yellow-800'
      case 'special':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">
            {enrollment.class?.name} - {enrollment.section?.name}
          </h4>
          <span
            className={`px-2 py-1 rounded-full text-xs ${getTypeColor(enrollment.enrollmentType)}`}
          >
            {enrollment.enrollmentType?.charAt(0).toUpperCase() +
              enrollment.enrollmentType?.slice(1)}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(enrollment)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(enrollment)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm">
          <span className="text-gray-600">Subjects:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {enrollment.subjects?.map(subject => (
              <span
                key={subject.id}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {subject.name}
              </span>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <span>Period: </span>
          {new Date(enrollment.startDate).toLocaleDateString()} -
          {enrollment.endDate
            ? new Date(enrollment.endDate).toLocaleDateString()
            : 'Ongoing'}
        </div>
      </div>
    </div>
  )
}

const TimetableConflictChecker = ({ studentId, enrollments }) => {
  const { data: conflicts, isLoading } = useQuery({
    queryKey: ['multiClass', 'conflicts', studentId, enrollments],
    queryFn: () =>
      multiClassStudentApi.checkTimetableConflicts(studentId, enrollments),
    enabled: !!studentId && enrollments.length > 0,
  })

  if (isLoading)
    return <div className="text-sm text-gray-500">Checking conflicts...</div>

  if (!conflicts?.data || conflicts.data.length === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <CheckCircle className="w-4 h-4" />
        No timetable conflicts detected
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
        <AlertTriangle className="w-4 h-4" />
        Timetable Conflicts Detected
      </div>
      <div className="space-y-1">
        {Array.isArray(conflicts.data) &&
          conflicts.data.map((conflict, index) => (
            <div
              key={index}
              className="text-sm text-red-600 bg-red-50 p-2 rounded"
            >
              {conflict.message}
            </div>
          ))}
      </div>
    </div>
  )
}

const StudentScheduleView = ({ student, isOpen, onClose }) => {
  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['multiClass', 'schedule', student?.id],
    queryFn: () => multiClassStudentApi.getStudentSchedule(student.id),
    enabled: !!student?.id && isOpen,
  })

  if (!student) return null

  const DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  const PERIODS = [
    { id: 1, name: 'Period 1', time: '08:00-08:45' },
    { id: 2, name: 'Period 2', time: '08:45-09:30' },
    { id: 3, name: 'Period 3', time: '09:30-10:15' },
    { id: 4, name: 'Break', time: '10:15-10:30', isBreak: true },
    { id: 5, name: 'Period 4', time: '10:30-11:15' },
    { id: 6, name: 'Period 5', time: '11:15-12:00' },
    { id: 7, name: 'Period 6', time: '12:00-12:45' },
    { id: 8, name: 'Lunch', time: '12:45-13:30', isBreak: true },
    { id: 9, name: 'Period 7', time: '13:30-14:15' },
    { id: 10, name: 'Period 8', time: '14:15-15:00' },
  ]

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={`${student.name} - Multi-Class Schedule`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Student Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              {student.photo ? (
                <img
                  src={student.photo}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-400 m-3" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{student.name}</h3>
              <p className="text-sm text-gray-600">
                Primary: {student.primaryClass?.name} -{' '}
                {student.primarySection?.name}
              </p>
              <p className="text-sm text-gray-600">
                {student.enrollments?.length || 0} additional enrollments
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-50 p-2 text-left font-medium">
                    Day / Period
                  </th>
                  {Array.isArray(PERIODS) &&
                    PERIODS.map(period => (
                      <th
                        key={period.id}
                        className={`border border-gray-300 p-2 text-center text-sm font-medium ${
                          period.isBreak ? 'bg-gray-100' : 'bg-gray-50'
                        }`}
                      >
                        <div>{period.name}</div>
                        <div className="text-xs text-gray-500">
                          {period.time}
                        </div>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(DAYS) &&
                  DAYS.map(day => (
                    <tr key={day}>
                      <td className="border border-gray-300 bg-gray-50 p-2 font-medium">
                        {day}
                      </td>
                      {Array.isArray(PERIODS) &&
                        PERIODS.map(period => {
                          if (period.isBreak) {
                            return (
                              <td
                                key={period.id}
                                className="border border-gray-300 bg-gray-100 text-center text-gray-500 text-sm p-2"
                              >
                                {period.name}
                              </td>
                            )
                          }

                          const scheduleEntry = scheduleData?.data?.find(
                            entry =>
                              entry.day === day && entry.periodId === period.id
                          )

                          return (
                            <td
                              key={period.id}
                              className="border border-gray-300 p-1 h-16"
                            >
                              {scheduleEntry ? (
                                <div
                                  className={`p-2 rounded text-xs ${
                                    scheduleEntry.isPrimary
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  <div className="font-medium">
                                    {scheduleEntry.subject}
                                  </div>
                                  <div>
                                    {scheduleEntry.class} -{' '}
                                    {scheduleEntry.section}
                                  </div>
                                  {scheduleEntry.room && (
                                    <div className="text-gray-600">
                                      {scheduleEntry.room}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                                  Free
                                </div>
                              )}
                            </td>
                          )
                        })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Primary Class</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Additional Enrollment</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const MultiClassStudent = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [currentEnrollments, setCurrentEnrollments] = useState([])

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(multiClassEnrollmentSchema),
    mode: 'onChange',
    defaultValues: {
      enrollments: [],
      parentConsent: false,
      isActive: true,
    },
  })

  const selectedStudent = watch('studentId')
  const selectedPrimaryClass = watch('primaryClassId')

  const {
    data: multiClassData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'multiClassStudents',
      {
        page: currentPage,
        pageSize,
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
      },
    ],
    queryFn: () =>
      multiClassStudentApi.getAll({
        page: currentPage,
        pageSize,
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
      }),
  })

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'available'],
    queryFn: () => studentsApi.getAll({ all: true }),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.getAll({ all: true }),
  })

  const { data: primarySectionsData } = useQuery({
    queryKey: ['sections', 'by-class', selectedPrimaryClass],
    queryFn: () => sectionsApi.getByClass(selectedPrimaryClass),
    enabled: !!selectedPrimaryClass,
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: () => subjectsApi.getAll({ all: true }),
  })

  const createMutation = useMutation({
    mutationFn: multiClassStudentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['multiClassStudents'])
      setShowCreateDialog(false)
      reset()
      setCurrentEnrollments([])
      // Log audit entry
      auditLogApi.log({
        action: 'CREATE_MULTI_CLASS_ENROLLMENT',
        entityType: 'multi_class_student',
        severity: 'medium',
        details: 'New multi-class enrollment created',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => multiClassStudentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['multiClassStudents'])
      setShowEditDialog(false)
      reset()
      setCurrentEnrollments([])
      // Log audit entry
      auditLogApi.log({
        action: 'UPDATE_MULTI_CLASS_ENROLLMENT',
        entityType: 'multi_class_student',
        entityId: selectedRecord?.id,
        severity: 'medium',
        details: 'Multi-class enrollment updated',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: multiClassStudentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['multiClassStudents'])
      // Log audit entry
      auditLogApi.log({
        action: 'DELETE_MULTI_CLASS_ENROLLMENT',
        entityType: 'multi_class_student',
        severity: 'high',
        details: 'Multi-class enrollment deleted',
      })
    },
  })

  const handleAddEnrollment = () => {
    const newEnrollment = {
      id: Date.now(), // Temporary ID
      classId: '',
      sectionId: '',
      subjectIds: [],
      enrollmentType: 'elective',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true,
    }
    setCurrentEnrollments([...currentEnrollments, newEnrollment])
  }

  const handleUpdateEnrollment = (index, updatedEnrollment) => {
    const updated = [...currentEnrollments]
    updated[index] = updatedEnrollment
    setCurrentEnrollments(updated)
    setValue('enrollments', updated)
  }

  const handleRemoveEnrollment = index => {
    const updated = currentEnrollments.filter((_, i) => i !== index)
    setCurrentEnrollments(updated)
    setValue('enrollments', updated)
  }

  const handleEdit = record => {
    setSelectedRecord(record)
    setCurrentEnrollments(record.enrollments || [])
    reset({
      studentId: record.studentId,
      primaryClassId: record.primaryClassId,
      primarySectionId: record.primarySectionId,
      enrollments: record.enrollments || [],
      reason: record.reason,
      approvedBy: record.approvedBy,
      approvalDate: record.approvalDate?.split('T')[0],
      parentConsent: record.parentConsent,
      isActive: record.isActive,
    })
    setShowEditDialog(true)
  }

  const handleDelete = id => {
    if (
      window.confirm(
        'Are you sure you want to delete this multi-class enrollment?',
      )
    ) {
      deleteMutation.mutate(id)
    }
  }

  const handleViewSchedule = record => {
    setSelectedRecord(record)
    setShowScheduleDialog(true)
  }

  const onSubmit = data => {
    const submitData = {
      ...data,
      enrollments: currentEnrollments,
    }

    if (selectedRecord) {
      updateMutation.mutate({ id: selectedRecord.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: item => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {item.student?.photo ? (
              <img
                src={item.student.photo}
                alt={item.student.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{item.student?.name}</p>
            <p className="text-sm text-gray-500">{item.student?.rollNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'primaryClass',
      header: 'Primary Class',
      render: item => (
        <div>
          <p className="font-medium">{item.primaryClass?.name}</p>
          <p className="text-sm text-gray-500">{item.primarySection?.name}</p>
        </div>
      ),
    },
    {
      key: 'enrollments',
      header: 'Additional Enrollments',
      render: item => (
        <div className="space-y-1">
          {item.enrollments?.slice(0, 2).map((enrollment, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium">
                {enrollment.class?.name}-{enrollment.section?.name}
              </span>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  enrollment.enrollmentType === 'elective'
                    ? 'bg-blue-100 text-blue-800'
                    : enrollment.enrollmentType === 'advanced'
                      ? 'bg-green-100 text-green-800'
                      : enrollment.enrollmentType === 'remedial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-purple-100 text-purple-800'
                }`}
              >
                {enrollment.enrollmentType}
              </span>
            </div>
          ))}
          {item.enrollments?.length > 2 && (
            <div className="text-xs text-gray-500">
              +{item.enrollments.length - 2} more
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'subjects',
      header: 'Total Subjects',
      render: item => {
        const totalSubjects =
          item.enrollments?.reduce(
            (total, enrollment) => total + (enrollment.subjects?.length || 0),
            0
          ) || 0
        return (
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span>{totalSubjects}</span>
          </div>
        )
      },
    },
    {
      key: 'approvalStatus',
      header: 'Status',
      render: item => (
        <div className="space-y-1">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              item.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {item.isActive ? 'Active' : 'Inactive'}
          </span>
          <div className="text-xs text-gray-500">
            Approved by {item.approvedBy}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: item => (
        <Dropdown
          trigger={<MoreHorizontal className="w-4 h-4" />}
          items={[
            {
              label: 'View Schedule',
              icon: Calendar,
              onClick: () => handleViewSchedule(item),
            },
            {
              label: 'Edit Enrollment',
              icon: Edit,
              onClick: () => handleEdit(item),
            },
            {
              label: 'Check Conflicts',
              icon: AlertTriangle,
              onClick: () => console.log('Check conflicts for', item.id),
            },
            {
              label: 'Delete',
              icon: Trash2,
              onClick: () => handleDelete(item.id),
              className: 'text-red-600',
            },
          ]}
        />
      ),
    },
  ]

  if (isLoading) return <LoadingSkeleton />
  if (error)
    return <ErrorState message="Failed to load multi-class student data" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Multi-Class Students</h1>
        <button
          onClick={() => {
            reset()
            setSelectedRecord(null)
            setCurrentEnrollments([])
            setShowCreateDialog(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Enrollment
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{multiClassData?.total || 0}</p>
              <p className="text-sm text-gray-600">Multi-Class Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {multiClassData?.data?.filter(s =>
                  s.enrollments?.some(e => e.enrollmentType === 'elective')
                ).length || 0}
              </p>
              <p className="text-sm text-gray-600">Elective Enrollments</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">
                {multiClassData?.data?.filter(s =>
                  s.enrollments?.some(e => e.enrollmentType === 'advanced')
                ).length || 0}
              </p>
              <p className="text-sm text-gray-600">Advanced Placements</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-gray-600">Schedule Conflicts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="elective">Elective</option>
              <option value="advanced">Advanced</option>
              <option value="remedial">Remedial</option>
              <option value="special">Special</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow">
        {multiClassData?.data?.length === 0 ? (
          <EmptyState
            title="No multi-class enrollments found"
            description="No students are currently enrolled in multiple classes"
            action={{
              label: 'Add Enrollment',
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <>
            <Table data={multiClassData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((multiClassData?.total || 0) / pageSize)}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || showEditDialog}
        onClose={() => {
          setShowCreateDialog(false)
          setShowEditDialog(false)
          reset()
          setSelectedRecord(null)
          setCurrentEnrollments([])
        }}
        title={
          selectedRecord
            ? 'Edit Multi-Class Enrollment'
            : 'Add Multi-Class Enrollment'
        }
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Student and Primary Class */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Student Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="studentId"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Student *
                    </label>
                    <select
                      {...field}
                      disabled={!!selectedRecord}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        errors.studentId ? 'border-red-500' : ''
                      } ${selectedRecord ? 'bg-gray-100' : ''}`}
                    >
                      <option value="">Select Student</option>
                      {Array.isArray(studentsData?.data) &&
                        studentsData.data.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name} - {student.rollNumber}
                          </option>
                        ))}
                    </select>
                    {errors.studentId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.studentId.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="primaryClassId"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Primary Class *
                    </label>
                    <select
                      {...field}
                      onChange={e => {
                        field.onChange(e)
                        setValue('primarySectionId', '')
                      }}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        errors.primaryClassId ? 'border-red-500' : ''
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
                    {errors.primaryClassId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.primaryClassId.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="primarySectionId"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Primary Section *
                    </label>
                    <select
                      {...field}
                      disabled={!selectedPrimaryClass}
                      className={`w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 ${
                        errors.primarySectionId ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Section</option>
                      {primarySectionsData?.data?.map(section => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                    {errors.primarySectionId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.primarySectionId.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Additional Enrollments */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Additional Enrollments</h3>
              <button
                type="button"
                onClick={handleAddEnrollment}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Enrollment
              </button>
            </div>

            {currentEnrollments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No additional enrollments added</p>
                <button
                  type="button"
                  onClick={handleAddEnrollment}
                  className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                >
                  Add your first enrollment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(currentEnrollments) &&
                  currentEnrollments.map((enrollment, index) => (
                    <div
                      key={enrollment.id || index}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Enrollment {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveEnrollment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Class *
                          </label>
                          <select
                            value={enrollment.classId}
                            onChange={e =>
                              handleUpdateEnrollment(index, {
                                ...enrollment,
                                classId: e.target.value,
                                sectionId: '',
                              })
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
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Section *
                          </label>
                          <select
                            value={enrollment.sectionId}
                            onChange={e =>
                              handleUpdateEnrollment(index, {
                                ...enrollment,
                                sectionId: e.target.value,
                              })
                            }
                            disabled={!enrollment.classId}
                            className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
                          >
                            <option value="">Select Section</option>
                            {/* You would need to fetch sections for the selected class */}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Type *
                          </label>
                          <select
                            value={enrollment.enrollmentType}
                            onChange={e =>
                              handleUpdateEnrollment(index, {
                                ...enrollment,
                                enrollmentType: e.target.value,
                              })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                          >
                            <option value="elective">Elective</option>
                            <option value="advanced">Advanced</option>
                            <option value="remedial">Remedial</option>
                            <option value="special">Special</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Start Date *
                          </label>
                          <input
                            type="date"
                            value={enrollment.startDate}
                            onChange={e =>
                              handleUpdateEnrollment(index, {
                                ...enrollment,
                                startDate: e.target.value,
                              })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Subjects *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                          {Array.isArray(subjectsData?.data) &&
                            subjectsData.data.map(subject => (
                              <label
                                key={subject.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    enrollment.subjectIds?.includes(
                                      subject.id,
                                    ) || false
                                  }
                                  onChange={e => {
                                    const subjectIds =
                                      enrollment.subjectIds || []
                                    const updated = e.target.checked
                                      ? [...subjectIds, subject.id]
                                      : subjectIds.filter(
                                          id => id !== subject.id,
                                        )
                                    handleUpdateEnrollment(index, {
                                      ...enrollment,
                                      subjectIds: updated,
                                    })
                                  }}
                                />
                                <span>{subject.name}</span>
                              </label>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Conflict Check */}
          {selectedStudent && currentEnrollments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Timetable Conflict Check</h4>
              <TimetableConflictChecker
                studentId={selectedStudent}
                enrollments={currentEnrollments}
              />
            </div>
          )}

          {/* Approval Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Approval Information
            </h3>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <Input
                  label="Reason for Multi-Class Enrollment *"
                  multiline
                  rows={3}
                  {...field}
                  error={errors.reason?.message}
                  placeholder="Explain why this student needs multi-class enrollment"
                />
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="approvedBy"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Approved By *"
                    {...field}
                    error={errors.approvedBy?.message}
                    placeholder="Name of approving authority"
                  />
                )}
              />
              <Controller
                name="approvalDate"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Approval Date *"
                    type="date"
                    {...field}
                    error={errors.approvalDate?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-3">
            <Controller
              name="parentConsent"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span>
                    Parent/Guardian consent obtained for multi-class enrollment
                    *
                  </span>
                </label>
              )}
            />
            {errors.parentConsent && (
              <p className="text-red-500 text-sm">
                {errors.parentConsent.message}
              </p>
            )}

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span>Enrollment is active</span>
                </label>
              )}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : selectedRecord
                  ? 'Update Enrollment'
                  : 'Create Enrollment'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateDialog(false)
                setShowEditDialog(false)
                reset()
                setSelectedRecord(null)
                setCurrentEnrollments([])
              }}
              className="border px-6 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Dialog>

      {/* Schedule View Dialog */}
      <StudentScheduleView
        student={selectedRecord}
        isOpen={showScheduleDialog}
        onClose={() => {
          setShowScheduleDialog(false)
          setSelectedRecord(null)
        }}
      />
    </div>
  )
}

export default MultiClassStudent
