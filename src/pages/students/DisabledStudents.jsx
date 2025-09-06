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
  FileText,
  Heart,
  Brain,

  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Download,
  Upload,
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
import { disabledStudentsApi } from '../../lib/api/disabledStudents'
import { studentsApi } from '../../lib/api/students'
import { auditLogApi } from '../../lib/api/auditLog'

// Validation Schema
const disabilityRecordSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  disabilityType: z.enum(
    ['physical', 'intellectual', 'sensory', 'multiple', 'other'],
    {
      required_error: 'Disability type is required',
    },
  ),
  disabilityCategory: z.string().min(1, 'Category is required'),
  severityLevel: z.enum(['mild', 'moderate', 'severe', 'profound'], {
    required_error: 'Severity level is required',
  }),
  diagnosisDate: z.string().min(1, 'Diagnosis date is required'),
  diagnostician: z.string().min(1, 'Diagnostician is required'),
  medicalNotes: z.string().optional(),

  // IEP Information
  hasIEP: z.boolean().default(false),
  iepStartDate: z.string().optional(),
  iepEndDate: z.string().optional(),
  iepGoals: z.string().optional(),
  accommodations: z.string().optional(),
  modifications: z.string().optional(),

  // Support Services
  speechTherapy: z.boolean().default(false),
  occupationalTherapy: z.boolean().default(false),
  physicalTherapy: z.boolean().default(false),
  counseling: z.boolean().default(false),
  assistiveTechnology: z.boolean().default(false),

  // Additional Information
  emergencyProcedures: z.string().optional(),
  medicationRequired: z.boolean().default(false),
  medicationDetails: z.string().optional(),
  parentConsent: z.boolean().default(false),
  confidentialityLevel: z.enum(['public', 'restricted', 'confidential'], {
    required_error: 'Confidentiality level is required',
  }),

  isActive: z.boolean().default(true),
})

const DisabilityStatusBadge = ({ type, severity }) => {
  const getTypeColor = type => {
    switch (type) {
      case 'physical':
        return 'bg-blue-100 text-blue-800'
      case 'intellectual':
        return 'bg-purple-100 text-purple-800'
      case 'sensory':
        return 'bg-green-100 text-green-800'
      case 'multiple':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = severity => {
    switch (severity) {
      case 'mild':
        return 'bg-yellow-100 text-yellow-800'
      case 'moderate':
        return 'bg-orange-100 text-orange-800'
      case 'severe':
        return 'bg-red-100 text-red-800'
      case 'profound':
        return 'bg-red-200 text-red-900'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(type)}`}>
        {type?.charAt(0).toUpperCase() + type?.slice(1)}
      </span>
      <span
        className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(severity)}`}
      >
        {severity?.charAt(0).toUpperCase() + severity?.slice(1)}
      </span>
    </div>
  )
}

const IEPStatusIndicator = ({ hasIEP, startDate, endDate }) => {
  if (!hasIEP) {
    return <span className="text-gray-500 text-sm">No IEP</span>
  }

  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  const isActive = now >= start && now <= end
  const isExpired = now > end

  return (
    <div className="flex items-center gap-2">
      {isActive ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : isExpired ? (
        <AlertTriangle className="w-4 h-4 text-red-600" />
      ) : (
        <Clock className="w-4 h-4 text-yellow-600" />
      )}
      <span
        className={`text-sm ${
          isActive
            ? 'text-green-600'
            : isExpired
              ? 'text-red-600'
              : 'text-yellow-600'
        }`}
      >
        {isActive ? 'Active' : isExpired ? 'Expired' : 'Pending'}
      </span>
    </div>
  )
}

const StudentDetailsDrawer = ({ student, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!student) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'medical', label: 'Medical', icon: Heart },
    { id: 'iep', label: 'IEP', icon: Brain },
    { id: 'services', label: 'Services', icon: WheelEvent },
    { id: 'history', label: 'History', icon: History },
  ]

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={`${student.name} - Disability Profile`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Student Header */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            {student.photo ? (
              <img
                src={student.photo}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{student.name}</h3>
            <p className="text-gray-600">
              Roll No: {student.rollNumber} | Class: {student.class?.name} -{' '}
              {student.section?.name}
            </p>
            <div className="flex gap-2 mt-2">
              <DisabilityStatusBadge
                type={student.disabilityType}
                severity={student.severityLevel}
              />
              {student.hasIEP && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  IEP Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8">
            {Array.isArray(tabs) &&
              tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Disability Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">
                        {student.disabilityType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span>{student.disabilityCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Severity:</span>
                      <span className="capitalize">
                        {student.severityLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diagnosis Date:</span>
                      <span>
                        {new Date(student.diagnosisDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diagnostician:</span>
                      <span>{student.diagnostician}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Support Services</h4>
                  <div className="space-y-2 text-sm">
                    {[
                      { key: 'speechTherapy', label: 'Speech Therapy' },
                      {
                        key: 'occupationalTherapy',
                        label: 'Occupational Therapy',
                      },
                      { key: 'physicalTherapy', label: 'Physical Therapy' },
                      { key: 'counseling', label: 'Counseling' },
                      {
                        key: 'assistiveTechnology',
                        label: 'Assistive Technology',
                      },
                    ].map(service => (
                      <div key={service.key} className="flex justify-between">
                        <span className="text-gray-600">{service.label}:</span>
                        <span
                          className={
                            student[service.key]
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }
                        >
                          {student[service.key] ? 'Yes' : 'No'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Medical Notes</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {student.medicalNotes || 'No medical notes available'}
                  </p>
                </div>
              </div>

              {student.medicationRequired && (
                <div>
                  <h4 className="font-medium mb-2">Medication Details</h4>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      {student.medicationDetails ||
                        'Medication required - details not specified'}
                    </p>
                  </div>
                </div>
              )}

              {student.emergencyProcedures && (
                <div>
                  <h4 className="font-medium mb-2">Emergency Procedures</h4>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                      {student.emergencyProcedures}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'iep' && (
            <div className="space-y-4">
              {student.hasIEP ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">IEP Period</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="text-gray-600">Start Date:</span>{' '}
                          {new Date(student.iepStartDate).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="text-gray-600">End Date:</span>{' '}
                          {new Date(student.iepEndDate).toLocaleDateString()}
                        </p>
                        <IEPStatusIndicator
                          hasIEP={student.hasIEP}
                          startDate={student.iepStartDate}
                          endDate={student.iepEndDate}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">IEP Goals</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {student.iepGoals || 'No IEP goals specified'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Accommodations</h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-800">
                          {student.accommodations ||
                            'No accommodations specified'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Modifications</h4>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-800">
                          {student.modifications ||
                            'No modifications specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">
                    No IEP on file for this student
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'speechTherapy', label: 'Speech Therapy', icon: '🗣️' },
                  {
                    key: 'occupationalTherapy',
                    label: 'Occupational Therapy',
                    icon: '🖐️',
                  },
                  {
                    key: 'physicalTherapy',
                    label: 'Physical Therapy',
                    icon: '🏃',
                  },
                  { key: 'counseling', label: 'Counseling', icon: '💭' },
                  {
                    key: 'assistiveTechnology',
                    label: 'Assistive Technology',
                    icon: '💻',
                  },
                ].map(service => (
                  <div
                    key={service.key}
                    className={`p-4 rounded-lg border-2 ${
                      student[service.key]
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <h5 className="font-medium">{service.label}</h5>
                        <p
                          className={`text-sm ${
                            student[service.key]
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {student[service.key] ? 'Active' : 'Not Required'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <AuditLogViewer
              entityType="disabled_student"
              entityId={student.id}
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const AuditLogViewer = ({ entityType, entityId }) => {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['auditLog', entityType, entityId],
    queryFn: () => auditLogApi.getEntityLogs(entityType, entityId),
  })

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-4">
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
                      log.severity === 'high'
                        ? 'bg-red-100 text-red-800'
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

const DisabledStudents = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [disabilityTypeFilter, setDisabilityTypeFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [iepFilter, setIepFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false)

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(disabilityRecordSchema),
    mode: 'onChange',
    defaultValues: {
      hasIEP: false,
      medicationRequired: false,
      parentConsent: false,
      confidentialityLevel: 'restricted',
      isActive: true,
    },
  })

  const hasIEP = watch('hasIEP')
  const medicationRequired = watch('medicationRequired')

  const {
    data: disabledStudentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'disabledStudents',
      {
        page: currentPage,
        pageSize,
        search: searchTerm,
        disabilityType: disabilityTypeFilter,
        severity: severityFilter,
        hasIEP: iepFilter,
      },
    ],
    queryFn: () =>
      disabledStudentsApi.getAll({
        page: currentPage,
        pageSize,
        search: searchTerm,
        disabilityType: disabilityTypeFilter,
        severity: severityFilter,
        hasIEP: iepFilter,
      }),
  })

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'available'],
    queryFn: () => studentsApi.getAvailableForDisability(),
  })

  const createMutation = useMutation({
    mutationFn: disabledStudentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['disabledStudents'])
      setShowCreateDialog(false)
      reset()
      // Log audit entry
      auditLogApi.log({
        action: 'CREATE_DISABILITY_RECORD',
        entityType: 'disabled_student',
        severity: 'medium',
        details: 'New disability record created',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => disabledStudentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['disabledStudents'])
      setShowEditDialog(false)
      reset()
      // Log audit entry
      auditLogApi.log({
        action: 'UPDATE_DISABILITY_RECORD',
        entityType: 'disabled_student',
        entityId: selectedStudent?.id,
        severity: 'medium',
        details: 'Disability record updated',
      })
    },
  })

  const handleEdit = student => {
    setSelectedStudent(student)
    reset({
      studentId: student.studentId,
      disabilityType: student.disabilityType,
      disabilityCategory: student.disabilityCategory,
      severityLevel: student.severityLevel,
      diagnosisDate: student.diagnosisDate?.split('T')[0],
      diagnostician: student.diagnostician,
      medicalNotes: student.medicalNotes || '',
      hasIEP: student.hasIEP,
      iepStartDate: student.iepStartDate?.split('T')[0] || '',
      iepEndDate: student.iepEndDate?.split('T')[0] || '',
      iepGoals: student.iepGoals || '',
      accommodations: student.accommodations || '',
      modifications: student.modifications || '',
      speechTherapy: student.speechTherapy,
      occupationalTherapy: student.occupationalTherapy,
      physicalTherapy: student.physicalTherapy,
      counseling: student.counseling,
      assistiveTechnology: student.assistiveTechnology,
      emergencyProcedures: student.emergencyProcedures || '',
      medicationRequired: student.medicationRequired,
      medicationDetails: student.medicationDetails || '',
      parentConsent: student.parentConsent,
      confidentialityLevel: student.confidentialityLevel,
      isActive: student.isActive,
    })
    setShowEditDialog(true)
  }

  const handleViewDetails = student => {
    setSelectedStudent(student)
    setShowDetailsDrawer(true)
  }

  const onSubmit = data => {
    if (selectedStudent) {
      updateMutation.mutate({ id: selectedStudent.id, data })
    } else {
      createMutation.mutate(data)
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
            <p className="text-sm text-gray-500">
              {item.student?.rollNumber} | {item.student?.class?.name}-
              {item.student?.section?.name}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'disability',
      header: 'Disability',
      render: item => (
        <DisabilityStatusBadge
          type={item.disabilityType}
          severity={item.severityLevel}
        />
      ),
    },
    { key: 'disabilityCategory', header: 'Category' },
    {
      key: 'iep',
      header: 'IEP Status',
      render: item => (
        <IEPStatusIndicator
          hasIEP={item.hasIEP}
          startDate={item.iepStartDate}
          endDate={item.iepEndDate}
        />
      ),
    },
    {
      key: 'services',
      header: 'Services',
      render: item => {
        const services = [
          item.speechTherapy && 'Speech',
          item.occupationalTherapy && 'OT',
          item.physicalTherapy && 'PT',
          item.counseling && 'Counseling',
          item.assistiveTechnology && 'AT',
        ].filter(Boolean)

        return (
          <div className="text-sm">
            {services.length > 0 ? services.join(', ') : 'None'}
          </div>
        )
      },
    },
    {
      key: 'confidentiality',
      header: 'Access Level',
      render: item => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            item.confidentialityLevel === 'public'
              ? 'bg-green-100 text-green-800'
              : item.confidentialityLevel === 'restricted'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {item.confidentialityLevel?.charAt(0).toUpperCase() +
            item.confidentialityLevel?.slice(1)}
        </span>
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
              label: 'View Details',
              icon: Eye,
              onClick: () => handleViewDetails(item),
            },
            {
              label: 'Edit Record',
              icon: Edit,
              onClick: () => handleEdit(item),
            },
            {
              label: 'Medical Notes',
              icon: Heart,
              onClick: () => console.log('View medical notes for', item.id),
            },
            {
              label: 'IEP Document',
              icon: FileText,
              onClick: () => console.log('View IEP for', item.id),
              disabled: !item.hasIEP,
            },
          ]}
        />
      ),
    },
  ]

  if (isLoading) return <LoadingSkeleton />
  if (error)
    return <ErrorState message="Failed to load disabled students data" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Students with Disabilities</h1>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button
            onClick={() => {
              reset()
              setSelectedStudent(null)
              setShowCreateDialog(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <WheelEvent className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">
                {disabledStudentsData?.total || 0}
              </p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">
                {disabledStudentsData?.data?.filter(s => s.hasIEP).length || 0}
              </p>
              <p className="text-sm text-gray-600">Active IEPs</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">
                {disabledStudentsData?.data?.filter(s => s.medicationRequired)
                  .length || 0}
              </p>
              <p className="text-sm text-gray-600">Require Medication</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">
                {disabledStudentsData?.data?.filter(s => s.emergencyProcedures)
                  .length || 0}
              </p>
              <p className="text-sm text-gray-600">Emergency Protocols</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              value={disabilityTypeFilter}
              onChange={e => setDisabilityTypeFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="physical">Physical</option>
              <option value="intellectual">Intellectual</option>
              <option value="sensory">Sensory</option>
              <option value="multiple">Multiple</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Severities</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
              <option value="profound">Profound</option>
            </select>
          </div>
          <div>
            <select
              value={iepFilter}
              onChange={e => setIepFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All IEP Status</option>
              <option value="true">Has IEP</option>
              <option value="false">No IEP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow">
        {disabledStudentsData?.data?.length === 0 ? (
          <EmptyState
            title="No disability records found"
            description="No students match your current filters"
            action={{
              label: 'Add Record',
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <>
            <Table data={disabledStudentsData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(
                  (disabledStudentsData?.total || 0) / pageSize,
                )}
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
          setSelectedStudent(null)
        }}
        title={
          selectedStudent ? 'Edit Disability Record' : 'Add Disability Record'
        }
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Student Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    disabled={!!selectedStudent}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      errors.studentId ? 'border-red-500' : ''
                    } ${selectedStudent ? 'bg-gray-100' : ''}`}
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
              name="confidentialityLevel"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confidentiality Level *
                  </label>
                  <select
                    {...field}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      errors.confidentialityLevel ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="public">Public</option>
                    <option value="restricted">Restricted</option>
                    <option value="confidential">Confidential</option>
                  </select>
                  {errors.confidentialityLevel && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confidentialityLevel.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Disability Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Disability Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="disabilityType"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Disability Type *
                    </label>
                    <select
                      {...field}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        errors.disabilityType ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Type</option>
                      <option value="physical">Physical</option>
                      <option value="intellectual">Intellectual</option>
                      <option value="sensory">Sensory</option>
                      <option value="multiple">Multiple</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.disabilityType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.disabilityType.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="severityLevel"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Severity Level *
                    </label>
                    <select
                      {...field}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        errors.severityLevel ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Severity</option>
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                      <option value="profound">Profound</option>
                    </select>
                    {errors.severityLevel && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.severityLevel.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <Controller
              name="disabilityCategory"
              control={control}
              render={({ field }) => (
                <Input
                  label="Disability Category *"
                  {...field}
                  error={errors.disabilityCategory?.message}
                  placeholder="e.g., Autism Spectrum Disorder, Cerebral Palsy, etc."
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="diagnosisDate"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Diagnosis Date *"
                    type="date"
                    {...field}
                    error={errors.diagnosisDate?.message}
                  />
                )}
              />
              <Controller
                name="diagnostician"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Diagnostician *"
                    {...field}
                    error={errors.diagnostician?.message}
                    placeholder="Doctor/Professional who made the diagnosis"
                  />
                )}
              />
            </div>

            <Controller
              name="medicalNotes"
              control={control}
              render={({ field }) => (
                <Input
                  label="Medical Notes"
                  multiline
                  rows={3}
                  {...field}
                  error={errors.medicalNotes?.message}
                  placeholder="Additional medical information, conditions, etc."
                />
              )}
            />
          </div>

          {/* IEP Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              IEP Information
            </h3>
            <Controller
              name="hasIEP"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span>Student has an Individual Education Plan (IEP)</span>
                </label>
              )}
            />

            {hasIEP && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="iepStartDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="IEP Start Date"
                        type="date"
                        {...field}
                        error={errors.iepStartDate?.message}
                      />
                    )}
                  />
                  <Controller
                    name="iepEndDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="IEP End Date"
                        type="date"
                        {...field}
                        error={errors.iepEndDate?.message}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="iepGoals"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="IEP Goals"
                      multiline
                      rows={3}
                      {...field}
                      error={errors.iepGoals?.message}
                      placeholder="List the main goals of the IEP"
                    />
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="accommodations"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Accommodations"
                        multiline
                        rows={3}
                        {...field}
                        error={errors.accommodations?.message}
                        placeholder="List accommodations (e.g., extra time, quiet room)"
                      />
                    )}
                  />
                  <Controller
                    name="modifications"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Modifications"
                        multiline
                        rows={3}
                        {...field}
                        error={errors.modifications?.message}
                        placeholder="List curriculum modifications"
                      />
                    )}
                  />
                </div>
              </>
            )}
          </div>

          {/* Support Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Support Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'speechTherapy', label: 'Speech Therapy' },
                { key: 'occupationalTherapy', label: 'Occupational Therapy' },
                { key: 'physicalTherapy', label: 'Physical Therapy' },
                { key: 'counseling', label: 'Counseling Services' },
                { key: 'assistiveTechnology', label: 'Assistive Technology' },
              ].map(service => (
                <Controller
                  key={service.key}
                  name={service.key}
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      <span>{service.label}</span>
                    </label>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Emergency and Medication */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Emergency & Medication
            </h3>

            <Controller
              name="emergencyProcedures"
              control={control}
              render={({ field }) => (
                <Input
                  label="Emergency Procedures"
                  multiline
                  rows={3}
                  {...field}
                  error={errors.emergencyProcedures?.message}
                  placeholder="Special procedures in case of emergency"
                />
              )}
            />

            <Controller
              name="medicationRequired"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span>Student requires medication during school hours</span>
                </label>
              )}
            />

            {medicationRequired && (
              <Controller
                name="medicationDetails"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Medication Details"
                    multiline
                    rows={3}
                    {...field}
                    error={errors.medicationDetails?.message}
                    placeholder="Medication name, dosage, timing, administration instructions"
                  />
                )}
              />
            )}
          </div>

          {/* Consent */}
          <div className="space-y-4">
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
                    Parent/Guardian consent obtained for sharing disability
                    information
                  </span>
                </label>
              )}
            />

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
                  <span>Record is active</span>
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
                : selectedStudent
                  ? 'Update Record'
                  : 'Create Record'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateDialog(false)
                setShowEditDialog(false)
                reset()
                setSelectedStudent(null)
              }}
              className="border px-6 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Dialog>

      {/* Student Details Drawer */}
      <StudentDetailsDrawer
        student={selectedStudent}
        isOpen={showDetailsDrawer}
        onClose={() => {
          setShowDetailsDrawer(false)
          setSelectedStudent(null)
        }}
      />
    </div>
  )
}

export default DisabledStudents
