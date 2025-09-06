import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Shield,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  User,
  Calendar,
  FileText,
  Clock,
  Users,
  Download,
  History,
  Lock,
} from 'lucide-react'
import { Table } from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { studentsApi } from '../../lib/api/students'
import { classesApi } from '../../lib/api/classes'
import { sectionsApi } from '../../lib/api/sections'
import { auditLogApi } from '../../lib/api/auditLog'
import { authApi } from '../../lib/api/auth'

// Validation Schema for Authorization
const authorizationSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  confirmText: z.string().refine(val => val === 'DELETE STUDENTS', {
    message: 'You must type "DELETE STUDENTS" to confirm',
  }),
  backupConfirmed: z.boolean().refine(val => val === true, {
    message: 'You must confirm that backup has been taken',
  }),
  consequencesUnderstood: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge the consequences',
  }),
})

const DeletionImpactAnalysis = ({ selectedStudents }) => {
  const { data: impactData, isLoading } = useQuery({
    queryKey: ['bulkDelete', 'impact', selectedStudents],
    queryFn: () => studentsApi.analyzeDeletionImpact(selectedStudents),
    enabled: selectedStudents.length > 0,
  })

  if (isLoading) return <LoadingSkeleton />

  if (!impactData?.data) return null

  const impact = impactData.data

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-red-800 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Deletion Impact Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Direct Impact</h4>
          <div className="space-y-2 text-sm text-red-700">
            <div className="flex justify-between">
              <span>Students to be deleted:</span>
              <span className="font-medium">{impact.studentsCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Academic records:</span>
              <span className="font-medium">{impact.academicRecords}</span>
            </div>
            <div className="flex justify-between">
              <span>Fee records:</span>
              <span className="font-medium">{impact.feeRecords}</span>
            </div>
            <div className="flex justify-between">
              <span>Attendance records:</span>
              <span className="font-medium">{impact.attendanceRecords}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Related Data</h4>
          <div className="space-y-2 text-sm text-yellow-700">
            <div className="flex justify-between">
              <span>Exam results:</span>
              <span className="font-medium">{impact.examResults}</span>
            </div>
            <div className="flex justify-between">
              <span>Library records:</span>
              <span className="font-medium">{impact.libraryRecords}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport records:</span>
              <span className="font-medium">{impact.transportRecords}</span>
            </div>
            <div className="flex justify-between">
              <span>Medical records:</span>
              <span className="font-medium">{impact.medicalRecords}</span>
            </div>
          </div>
        </div>
      </div>

      {impact.warnings && impact.warnings.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-800 mb-2">Warnings</h4>
          <ul className="space-y-1 text-sm text-orange-700">
            {Array.isArray(impact.warnings) &&
              impact.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {impact.blockers && impact.blockers.length > 0 && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Deletion Blockers</h4>
          <ul className="space-y-1 text-sm text-red-700">
            {Array.isArray(impact.blockers) &&
              impact.blockers.map((blocker, index) => (
                <li key={index} className="flex items-start gap-2">
                  <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{blocker}</span>
                </li>
              ))}
          </ul>
          <div className="mt-3 p-3 bg-red-200 rounded text-red-800 text-sm">
            <strong>Action Required:</strong> These issues must be resolved
            before deletion can proceed.
          </div>
        </div>
      )}
    </div>
  )
}

const AuthorizationStep = ({ onAuthorize, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(authorizationSchema),
    mode: 'onChange',
  })

  const onSubmit = data => {
    onAuthorize(data)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-red-800">
          Authorization Required
        </h2>
        <p className="text-gray-600 mt-2">
          This action requires administrative authorization due to its
          irreversible nature.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium mb-1">
                Administrator Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...field}
                  className={`w-full border rounded-lg px-3 py-2 pr-10 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium mb-1">
                Reason for Deletion *
              </label>
              <textarea
                {...field}
                rows={4}
                className={`w-full border rounded-lg px-3 py-2 resize-none ${
                  errors.reason ? 'border-red-500' : ''
                }`}
                placeholder="Provide a detailed reason for this bulk deletion operation..."
              />
              {errors.reason && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.reason.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="confirmText"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium mb-1">
                Type "DELETE STUDENTS" to confirm *
              </label>
              <input
                type="text"
                {...field}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.confirmText ? 'border-red-500' : ''
                }`}
                placeholder="DELETE STUDENTS"
              />
              {errors.confirmText && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmText.message}
                </p>
              )}
            </div>
          )}
        />

        <div className="space-y-3">
          <Controller
            name="backupConfirmed"
            control={control}
            render={({ field }) => (
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium">
                    I confirm that a complete database backup has been taken
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    This backup can be used to restore data if needed
                  </p>
                </div>
              </label>
            )}
          />
          {errors.backupConfirmed && (
            <p className="text-red-500 text-sm">
              {errors.backupConfirmed.message}
            </p>
          )}

          <Controller
            name="consequencesUnderstood"
            control={control}
            render={({ field }) => (
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium">
                    I understand that this action is irreversible
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    All student data and related records will be permanently
                    deleted
                  </p>
                </div>
              </label>
            )}
          />
          {errors.consequencesUnderstood && (
            <p className="text-red-500 text-sm">
              {errors.consequencesUnderstood.message}
            </p>
          )}
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">
                Warning: This action cannot be undone
              </p>
              <p>
                Once confirmed, all selected student records and their
                associated data will be permanently removed from the system.
                This includes academic records, attendance data, fee
                information, and all other related information.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            {isLoading ? 'Authorizing...' : 'Authorize Deletion'}
          </button>
        </div>
      </form>
    </div>
  )
}

const AuditLogViewer = ({ operation }) => {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['auditLog', 'bulk-delete', operation?.id],
    queryFn: () => auditLogApi.getOperationLogs('bulk_delete', operation?.id),
    enabled: !!operation?.id,
  })

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <History className="w-5 h-5" />
        Operation Audit Log
      </h3>

      {auditLogs?.data?.length > 0 ? (
        <div className="space-y-3">
          {Array.isArray(auditLogs.data) &&
            auditLogs.data.map((log, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-gray-600">
                      By {log.performedBy} on{' '}
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      log.severity === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : log.severity === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : log.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {log.severity}
                  </span>
                </div>
                {log.details && (
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {log.details}
                  </div>
                )}
                {log.metadata && (
                  <div className="text-xs text-gray-500 mt-2">
                    IP: {log.metadata.ipAddress} | Session:{' '}
                    {log.metadata.sessionId}
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No audit logs available</p>
        </div>
      )}
    </div>
  )
}

const BulkDelete = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [currentStep, setCurrentStep] = useState(1) // 1: Selection, 2: Analysis, 3: Authorization, 4: Execution, 5: Complete
  const [showAuditLog, setShowAuditLog] = useState(false)
  const [deletionResult, setDeletionResult] = useState(null)

  const queryClient = useQueryClient()

  const {
    data: studentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'students',
      {
        page: currentPage,
        pageSize,
        search: searchTerm,
        classId: selectedClass,
        sectionId: selectedSection,
      },
    ],
    queryFn: () =>
      studentsApi.getAll({
        page: currentPage,
        pageSize,
        search: searchTerm,
        classId: selectedClass,
        sectionId: selectedSection,
      }),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.getAll({ all: true }),
  })

  const { data: sectionsData } = useQuery({
    queryKey: ['sections', 'by-class', selectedClass],
    queryFn: () => sectionsApi.getByClass(selectedClass),
    enabled: !!selectedClass,
  })

  const authorizeMutation = useMutation({
    mutationFn: authApi.verifyAdminPassword,
    onSuccess: data => {
      if (data.authorized) {
        setCurrentStep(4)
        executeDeletion()
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: studentsApi.bulkDelete,
    onSuccess: data => {
      setDeletionResult(data)
      setCurrentStep(5)
      queryClient.invalidateQueries(['students'])

      // Log critical audit entry
      auditLogApi.log({
        action: 'BULK_DELETE_STUDENTS',
        entityType: 'student',
        severity: 'critical',
        details: `Bulk deleted ${selectedStudents.length} students`,
        metadata: {
          studentIds: selectedStudents,
          deletedCount: data.deletedCount,
          operationId: data.operationId,
        },
      })
    },
  })

  const handleAuthorize = authData => {
    authorizeMutation.mutate({
      password: authData.password,
      operation: 'bulk_delete_students',
      reason: authData.reason,
      metadata: {
        studentCount: selectedStudents.length,
        confirmText: authData.confirmText,
        backupConfirmed: authData.backupConfirmed,
        consequencesUnderstood: authData.consequencesUnderstood,
      },
    })
  }

  const executeDeletion = () => {
    deleteMutation.mutate({
      studentIds: selectedStudents,
      reason: 'Bulk deletion operation',
      performedBy: 'current_user', // This would come from auth context
    })
  }

  const handleSelectAll = checked => {
    if (checked) {
      setSelectedStudents(studentsData.data.map(student => student.id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudent = (studentId, checked) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId])
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId))
    }
  }

  const resetOperation = () => {
    setCurrentStep(1)
    setSelectedStudents([])
    setDeletionResult(null)
  }

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={
            selectedStudents.length === studentsData?.data?.length &&
            studentsData?.data?.length > 0
          }
          onChange={e => handleSelectAll(e.target.checked)}
        />
      ),
      render: student => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(student.id)}
          onChange={e => handleSelectStudent(student.id, e.target.checked)}
        />
      ),
    },
    {
      key: 'student',
      header: 'Student',
      render: student => (
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
            <p className="font-medium">{student.name}</p>
            <p className="text-sm text-gray-500">{student.rollNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      render: student => `${student.class?.name} - ${student.section?.name}`,
    },
    { key: 'fatherName', header: 'Father Name' },
    { key: 'mobile', header: 'Mobile' },
    {
      key: 'admissionDate',
      header: 'Admission Date',
      render: student => new Date(student.admissionDate).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      render: student => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            student.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {student.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[
        { number: 1, title: 'Select Students', icon: Users },
        { number: 2, title: 'Impact Analysis', icon: AlertTriangle },
        { number: 3, title: 'Authorization', icon: Shield },
        { number: 4, title: 'Execution', icon: Trash2 },
        { number: 5, title: 'Complete', icon: CheckCircle },
      ].map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number
                ? 'bg-red-600 border-red-600 text-white'
                : 'border-gray-300 text-gray-400'
            }`}
          >
            {currentStep > step.number ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          <div className="ml-2 text-sm font-medium">{step.title}</div>
          {index < 4 && (
            <div
              className={`w-8 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-red-600' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState message="Failed to load students data" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-red-800">
            Bulk Delete Students
          </h1>
          <p className="text-gray-600 mt-1">
            Permanently remove multiple student records from the system
          </p>
        </div>
        <div className="flex gap-2">
          {currentStep > 1 && (
            <button
              onClick={resetOperation}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel Operation
            </button>
          )}
          {deletionResult && (
            <button
              onClick={() => setShowAuditLog(true)}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              View Audit Log
            </button>
          )}
        </div>
      </div>

      {/* Security Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">
              High-Security Operation
            </h3>
            <p className="text-red-700 text-sm mt-1">
              This operation requires multi-step authorization and will
              permanently delete student data. All actions are logged and
              monitored for security compliance.
            </p>
          </div>
        </div>
      </div>

      {renderStepIndicator()}

      {/* Step 1: Student Selection */}
      {currentStep === 1 && (
        <div className="space-y-6">
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
                  value={selectedClass}
                  onChange={e => {
                    setSelectedClass(e.target.value)
                    setSelectedSection('')
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">All Classes</option>
                  {Array.isArray(classesData?.data) &&
                    classesData.data.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <select
                  value={selectedSection}
                  onChange={e => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="">All Sections</option>
                  {Array.isArray(sectionsData?.data) &&
                    sectionsData.data.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedStudents.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">
                    {selectedStudents.length} students selected for deletion
                  </span>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  Proceed to Analysis
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Students Table */}
          <div className="bg-white rounded-lg shadow">
            {studentsData?.data?.length === 0 ? (
              <EmptyState
                title="No students found"
                description="No students match your current filters"
              />
            ) : (
              <>
                <Table data={studentsData?.data || []} columns={columns} />
                <div className="p-6 border-t">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(
                      (studentsData?.total || 0) / pageSize,
                    )}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Impact Analysis */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <DeletionImpactAnalysis selectedStudents={selectedStudents} />

            <div className="flex justify-between mt-6 pt-6 border-t">
              <button
                onClick={() => setCurrentStep(1)}
                className="border px-6 py-2 rounded-lg hover:bg-gray-50"
              >
                Back to Selection
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                Proceed to Authorization
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Authorization */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow p-6">
          <AuthorizationStep
            onAuthorize={handleAuthorize}
            isLoading={authorizeMutation.isPending}
          />
        </div>
      )}

      {/* Step 4: Execution */}
      {currentStep === 4 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {deleteMutation.isPending ? (
                <Clock className="w-8 h-8 text-red-600 animate-spin" />
              ) : (
                <Trash2 className="w-8 h-8 text-red-600" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-red-800">
              {deleteMutation.isPending
                ? 'Deleting Students...'
                : 'Executing Deletion'}
            </h2>
            <p className="text-gray-600 mt-2">
              {deleteMutation.isPending
                ? 'Please wait while we process the deletion. This may take a few minutes.'
                : 'The deletion process is about to begin.'}
            </p>
            {deleteMutation.isPending && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full animate-pulse"
                    style={{ width: '60%' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Processing student records...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 5: Complete */}
      {currentStep === 5 && deletionResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-800">
              Deletion Completed
            </h2>
            <p className="text-gray-600 mt-2">
              The bulk deletion operation has been completed successfully.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">
                {deletionResult.deletedCount}
              </p>
              <p className="text-sm text-green-800">Students Deleted</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">
                {deletionResult.recordsRemoved}
              </p>
              <p className="text-sm text-blue-800">Records Removed</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">
                {deletionResult.backupSize}
              </p>
              <p className="text-sm text-purple-800">Backup Size (MB)</p>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Operation Details</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Operation ID:</strong> {deletionResult.operationId}
              </p>
              <p>
                <strong>Completed At:</strong>{' '}
                {new Date(deletionResult.completedAt).toLocaleString()}
              </p>
              <p>
                <strong>Backup Location:</strong> {deletionResult.backupPath}
              </p>
              <p>
                <strong>Recovery Window:</strong> 30 days (contact system
                administrator)
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setShowAuditLog(true)}
              className="border px-6 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              View Audit Log
            </button>
            <button
              onClick={resetOperation}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Start New Operation
            </button>
          </div>
        </div>
      )}

      {/* Audit Log Dialog */}
      <Dialog
        open={showAuditLog}
        onClose={() => setShowAuditLog(false)}
        title="Bulk Delete Audit Log"
        size="lg"
      >
        <AuditLogViewer operation={deletionResult} />
      </Dialog>
    </div>
  )
}

export default BulkDelete
