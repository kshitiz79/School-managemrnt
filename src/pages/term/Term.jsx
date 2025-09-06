import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  BookOpen,
  Settings,
  Users,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Target,
  BarChart3,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { termApi } from '../../lib/api/term'

const TermCard = ({ term, onEdit, onDelete, onActivate, onViewDetails }) => {
  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'upcoming':
        return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'completed':
        return 'text-gray-600 bg-gray-100 border-gray-200'
      case 'draft':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getTermTypeIcon = type => {
    switch (type) {
      case 'term1':
        return '1️⃣'
      case 'term2':
        return '2️⃣'
      case 'annual':
        return '📅'
      case 'half_yearly':
        return '📊'
      default:
        return '📚'
    }
  }

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getTermTypeIcon(term.type)}</div>
          <div>
            <h3 className="text-lg font-semibold">{term.name}</h3>
            <p className="text-sm text-gray-600">{term.academicYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(term.status)}`}
          >
            {term.status.charAt(0).toUpperCase() + term.status.slice(1)}
          </span>
          {term.isDefault && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              Default
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Start Date:</span>
            <div className="font-medium">
              {new Date(term.startDate).toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-gray-500">End Date:</span>
            <div className="font-medium">
              {new Date(term.endDate).toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Classes:</span>
            <div className="font-medium">
              {term.applicableClasses?.length || 0} classes
            </div>
          </div>
          <div>
            <span className="text-gray-500">Subjects:</span>
            <div className="font-medium">
              {term.subjects?.length || 0} subjects
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="text-sm text-gray-600 mb-2">Exam Schedule:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Unit Tests:</span>
              <span className="font-medium">
                {term.examSchedule?.unitTests || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Term Exams:</span>
              <span className="font-medium">
                {term.examSchedule?.termExams || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Practicals:</span>
              <span className="font-medium">
                {term.examSchedule?.practicals || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Projects:</span>
              <span className="font-medium">
                {term.examSchedule?.projects || 0}
              </span>
            </div>
          </div>
        </div>

        {term.gradingPattern && (
          <div className="border-t pt-3">
            <div className="text-sm text-gray-600 mb-2">Grading Pattern:</div>
            <div className="text-xs">
              <span className="font-medium">{term.gradingPattern.name}</span>
              <span className="text-gray-500 ml-2">
                ({term.gradingPattern.scale})
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Created: {new Date(term.createdAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(term)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(term)}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {term.status !== 'active' && (
            <button
              onClick={() => onActivate(term)}
              className="p-1 text-gray-400 hover:text-blue-600"
              title="Activate"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(term)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const TermDialog = ({ term, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: term?.name || '',
    type: term?.type || 'term1',
    academicYear: term?.academicYear || '2024-25',
    startDate: term?.startDate || '',
    endDate: term?.endDate || '',
    description: term?.description || '',
    status: term?.status || 'draft',
    isDefault: term?.isDefault || false,
    applicableClasses: term?.applicableClasses || [],
    subjects: term?.subjects || [],
    examSchedule: term?.examSchedule || {
      unitTests: 2,
      termExams: 1,
      practicals: 1,
      projects: 1,
    },
    gradingPatternId: term?.gradingPatternId || '',
    weightages: term?.weightages || {
      unitTest: 10,
      termExam: 80,
      practical: 5,
      project: 5,
    },
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => termApi.getClasses(),
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: () => termApi.getSubjects(),
  })

  const { data: gradingPatternsData } = useQuery({
    queryKey: ['grading-patterns', 'all'],
    queryFn: () => termApi.getGradingPatterns(),
  })

  const handleSave = () => {
    onSave(term?.id, formData)
    onClose()
  }

  const toggleClass = classId => {
    setFormData(prev => ({
      ...prev,
      applicableClasses: prev.applicableClasses.includes(classId)
        ? prev.applicableClasses.filter(id => id !== classId)
        : [...prev.applicableClasses, classId],
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

  const updateWeightage = (key, value) => {
    setFormData(prev => ({
      ...prev,
      weightages: {
        ...prev.weightages,
        [key]: parseInt(value) || 0,
      },
    }))
  }

  const updateExamSchedule = (key, value) => {
    setFormData(prev => ({
      ...prev,
      examSchedule: {
        ...prev.examSchedule,
        [key]: parseInt(value) || 0,
      },
    }))
  }

  const totalWeightage = Object.values(formData.weightages).reduce(
    (sum, val) => sum + val,
    0,
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={term ? 'Edit Term' : 'Create New Term'}
      size="xl"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Term Name *"
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Term 1 Examination"
          />
          <div>
            <label className="block text-sm font-medium mb-1">
              Term Type *
            </label>
            <select
              value={formData.type}
              onChange={e =>
                setFormData(prev => ({ ...prev, type: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="term1">Term 1</option>
              <option value="term2">Term 2</option>
              <option value="half_yearly">Half Yearly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <Input
            label="Academic Year *"
            value={formData.academicYear}
            onChange={e =>
              setFormData(prev => ({ ...prev, academicYear: e.target.value }))
            }
            placeholder="2024-25"
          />
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={e =>
                setFormData(prev => ({ ...prev, status: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
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

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={e =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Term description and objectives..."
          />
        </div>

        {/* Applicable Classes */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Applicable Classes
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
            {Array.isArray(classesData?.data) &&
              classesData.data.map(cls => (
                <label key={cls.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.applicableClasses.includes(cls.id)}
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
          <label className="block text-sm font-medium mb-2">Subjects</label>
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

        {/* Exam Schedule */}
        <div>
          <h3 className="font-medium mb-3">Exam Schedule</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Unit Tests"
              type="number"
              value={formData.examSchedule.unitTests}
              onChange={e => updateExamSchedule('unitTests', e.target.value)}
              min="0"
              size="sm"
            />
            <Input
              label="Term Exams"
              type="number"
              value={formData.examSchedule.termExams}
              onChange={e => updateExamSchedule('termExams', e.target.value)}
              min="0"
              size="sm"
            />
            <Input
              label="Practicals"
              type="number"
              value={formData.examSchedule.practicals}
              onChange={e => updateExamSchedule('practicals', e.target.value)}
              min="0"
              size="sm"
            />
            <Input
              label="Projects"
              type="number"
              value={formData.examSchedule.projects}
              onChange={e => updateExamSchedule('projects', e.target.value)}
              min="0"
              size="sm"
            />
          </div>
        </div>

        {/* Grading Pattern */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Grading Pattern
          </label>
          <select
            value={formData.gradingPatternId}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                gradingPatternId: e.target.value,
              }))
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Grading Pattern</option>
            {gradingPatternsData?.data?.map(pattern => (
              <option key={pattern.id} value={pattern.id}>
                {pattern.name} ({pattern.scale})
              </option>
            ))}
          </select>
        </div>

        {/* Weightages */}
        <div>
          <h3 className="font-medium mb-3">Assessment Weightages</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Unit Test (%)"
              type="number"
              value={formData.weightages.unitTest}
              onChange={e => updateWeightage('unitTest', e.target.value)}
              min="0"
              max="100"
              size="sm"
            />
            <Input
              label="Term Exam (%)"
              type="number"
              value={formData.weightages.termExam}
              onChange={e => updateWeightage('termExam', e.target.value)}
              min="0"
              max="100"
              size="sm"
            />
            <Input
              label="Practical (%)"
              type="number"
              value={formData.weightages.practical}
              onChange={e => updateWeightage('practical', e.target.value)}
              min="0"
              max="100"
              size="sm"
            />
            <Input
              label="Project (%)"
              type="number"
              value={formData.weightages.project}
              onChange={e => updateWeightage('project', e.target.value)}
              min="0"
              max="100"
              size="sm"
            />
          </div>
          <div className="mt-2 text-sm">
            <span
              className={`font-medium ${totalWeightage === 100 ? 'text-green-600' : 'text-red-600'}`}
            >
              Total: {totalWeightage}%
            </span>
            {totalWeightage !== 100 && (
              <span className="text-red-600 ml-2">(Must equal 100%)</span>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={e =>
                setFormData(prev => ({ ...prev, isDefault: e.target.checked }))
              }
              className="rounded"
            />
            <span className="text-sm font-medium">Set as default term</span>
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
            disabled={!formData.name.trim() || totalWeightage !== 100}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {term ? 'Update Term' : 'Create Term'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const TermDetailsDialog = ({ term, open, onClose }) => {
  if (!term) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${term.name} - Details`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Term Type
            </label>
            <p className="text-sm capitalize">{term.type.replace('_', ' ')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Academic Year
            </label>
            <p className="text-sm">{term.academicYear}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration
            </label>
            <p className="text-sm">
              {new Date(term.startDate).toLocaleDateString()} -{' '}
              {new Date(term.endDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <p className="text-sm capitalize">{term.status}</p>
          </div>
        </div>

        {/* Description */}
        {term.description && (
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm bg-gray-50 p-3 rounded">{term.description}</p>
          </div>
        )}

        {/* Classes and Subjects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Applicable Classes</h3>
            <div className="flex flex-wrap gap-2">
              {term.applicableClasses?.map(classId => (
                <span
                  key={classId}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                >
                  Class {classId}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {term.subjects?.map(subjectId => (
                <span
                  key={subjectId}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                >
                  {subjectId}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Exam Schedule */}
        <div>
          <h3 className="font-medium mb-3">Exam Schedule</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {term.examSchedule?.unitTests || 0}
              </div>
              <div className="text-sm text-gray-600">Unit Tests</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {term.examSchedule?.termExams || 0}
              </div>
              <div className="text-sm text-gray-600">Term Exams</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">
                {term.examSchedule?.practicals || 0}
              </div>
              <div className="text-sm text-gray-600">Practicals</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {term.examSchedule?.projects || 0}
              </div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
          </div>
        </div>

        {/* Weightages */}
        <div>
          <h3 className="font-medium mb-3">Assessment Weightages</h3>
          <div className="space-y-2">
            {Array.isArray(Object.entries(term.weightages || {})) &&
              Object.entries(term.weightages || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{value}%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const Term = () => {
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [showTermDialog, setShowTermDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  const queryClient = useQueryClient()

  const { data: termsData, isLoading } = useQuery({
    queryKey: ['terms', 'all'],
    queryFn: () => termApi.getTerms(),
  })

  const saveTermMutation = useMutation({
    mutationFn: ({ id, data }) =>
      id ? termApi.updateTerm(id, data) : termApi.createTerm(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['terms'])
      setShowTermDialog(false)
      setSelectedTerm(null)
    },
  })

  const deleteTermMutation = useMutation({
    mutationFn: termApi.deleteTerm,
    onSuccess: () => {
      queryClient.invalidateQueries(['terms'])
    },
  })

  const activateTermMutation = useMutation({
    mutationFn: termApi.activateTerm,
    onSuccess: () => {
      queryClient.invalidateQueries(['terms'])
    },
  })

  const handleEditTerm = term => {
    setSelectedTerm(term)
    setShowTermDialog(true)
  }

  const handleDeleteTerm = term => {
    if (confirm(`Are you sure you want to delete "${term.name}"?`)) {
      deleteTermMutation.mutate(term.id)
    }
  }

  const handleActivateTerm = term => {
    if (
      confirm(
        `Are you sure you want to activate "${term.name}"? This will deactivate other active terms.`,
      )
    ) {
      activateTermMutation.mutate(term.id)
    }
  }

  const handleSaveTerm = (id, data) => {
    saveTermMutation.mutate({ id, data })
  }

  const handleAddTerm = () => {
    setSelectedTerm(null)
    setShowTermDialog(true)
  }

  const handleViewDetails = term => {
    setSelectedTerm(term)
    setShowDetailsDialog(true)
  }

  const filteredTerms =
    termsData?.data?.filter(term => {
      const matchesStatus =
        filterStatus === 'all' || term.status === filterStatus
      const matchesType = filterType === 'all' || term.type === filterType
      return matchesStatus && matchesType
    }) || []

  const getStatistics = () => {
    const terms = termsData?.data || []
    return {
      total: terms.length,
      active: terms.filter(t => t.status === 'active').length,
      upcoming: terms.filter(t => t.status === 'upcoming').length,
      completed: terms.filter(t => t.status === 'completed').length,
    }
  }

  const stats = getStatistics()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Academic Terms</h1>
        <button
          onClick={handleAddTerm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Term
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Terms</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.upcoming}</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="term1">Term 1</option>
              <option value="term2">Term 2</option>
              <option value="half_yearly">Half Yearly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-500">
              Showing {filteredTerms.length} of {termsData?.data?.length || 0}{' '}
              terms
            </div>
          </div>
        </div>
      </div>

      {/* Terms List */}
      <div className="space-y-4">
        {filteredTerms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Terms Found
            </h3>
            <p className="text-gray-500 mb-4">
              {termsData?.data?.length === 0
                ? 'Create your first academic term to get started.'
                : 'No terms match your current filters.'}
            </p>
            {termsData?.data?.length === 0 && (
              <button
                onClick={handleAddTerm}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Term
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.isArray(filteredTerms) &&
              filteredTerms.map(term => (
                <TermCard
                  key={term.id}
                  term={term}
                  onEdit={handleEditTerm}
                  onDelete={handleDeleteTerm}
                  onActivate={handleActivateTerm}
                  onViewDetails={handleViewDetails}
                />
              ))}
          </div>
        )}
      </div>

      {/* Term Dialog */}
      <TermDialog
        term={selectedTerm}
        open={showTermDialog}
        onClose={() => {
          setShowTermDialog(false)
          setSelectedTerm(null)
        }}
        onSave={handleSaveTerm}
      />

      {/* Details Dialog */}
      <TermDetailsDialog
        term={selectedTerm}
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
      />
    </div>
  )
}

export default Term
