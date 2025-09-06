import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Calendar,
  Clock,
  Users,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { examApi } from '../../lib/api/exams'

const ExamGroupCard = ({
  examGroup,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
}) => {
  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'scheduled':
        return 'text-blue-600 bg-blue-100'
      case 'completed':
        return 'text-gray-600 bg-gray-100'
      case 'draft':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = type => {
    switch (type) {
      case 'unit_test':
        return '📝'
      case 'mid_term':
        return '📊'
      case 'final_exam':
        return '🎓'
      case 'practical':
        return '🔬'
      default:
        return '📚'
    }
  }

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getTypeIcon(examGroup.type)}</div>
          <div>
            <h3 className="text-lg font-semibold">{examGroup.name}</h3>
            <p className="text-sm text-gray-600">{examGroup.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(examGroup.status)}`}
          >
            {examGroup.status.charAt(0).toUpperCase() +
              examGroup.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <div className="font-medium capitalize">
              {examGroup.type.replace('_', ' ')}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Term:</span>
            <div className="font-medium">{examGroup.termName}</div>
          </div>
          <div>
            <span className="text-gray-500">Classes:</span>
            <div className="font-medium">
              {examGroup.classes?.length || 0} classes
            </div>
          </div>
          <div>
            <span className="text-gray-500">Subjects:</span>
            <div className="font-medium">
              {examGroup.subjects?.length || 0} subjects
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="text-sm text-gray-600 mb-2">Exam Details:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Max Marks:</span>
              <span className="font-medium">{examGroup.maxMarks}</span>
            </div>
            <div className="flex justify-between">
              <span>Pass Marks:</span>
              <span className="font-medium">{examGroup.passMarks}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{examGroup.duration} min</span>
            </div>
            <div className="flex justify-between">
              <span>Weightage:</span>
              <span className="font-medium">{examGroup.weightage}%</span>
            </div>
          </div>
        </div>

        {examGroup.examDates && (
          <div className="border-t pt-3">
            <div className="text-sm text-gray-600 mb-2">Schedule:</div>
            <div className="text-xs">
              <span className="font-medium">
                {new Date(examGroup.examDates.startDate).toLocaleDateString()} -
                {new Date(examGroup.examDates.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Created: {new Date(examGroup.createdAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(examGroup)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(examGroup)}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(examGroup)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(examGroup)}
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

const ExamGroupDialog = ({ examGroup, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: examGroup?.name || '',
    description: examGroup?.description || '',
    type: examGroup?.type || 'unit_test',
    termId: examGroup?.termId || '',
    maxMarks: examGroup?.maxMarks || 100,
    passMarks: examGroup?.passMarks || 35,
    duration: examGroup?.duration || 180,
    weightage: examGroup?.weightage || 10,
    status: examGroup?.status || 'draft',
    classes: examGroup?.classes || [],
    subjects: examGroup?.subjects || [],
    gradingCriteria: examGroup?.gradingCriteria || {
      enableGrading: true,
      gradingType: 'percentage',
      customGrades: [],
    },
    examSettings: examGroup?.examSettings || {
      allowAbsent: true,
      allowPartialMarks: true,
      roundOffMarks: false,
      showRank: true,
      publishResults: false,
    },
  })

  const { data: termsData } = useQuery({
    queryKey: ['terms', 'active'],
    queryFn: () => examApi.getActiveTerms(),
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
    onSave(examGroup?.id, formData)
    onClose()
  }

  const toggleClass = classId => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(classId)
        ? prev.classes.filter(id => id !== classId)
        : [...prev.classes, classId],
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

  const updateExamSettings = (key, value) => {
    setFormData(prev => ({
      ...prev,
      examSettings: { ...prev.examSettings, [key]: value },
    }))
  }

  const updateGradingCriteria = (key, value) => {
    setFormData(prev => ({
      ...prev,
      gradingCriteria: { ...prev.gradingCriteria, [key]: value },
    }))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={examGroup ? 'Edit Exam Group' : 'Create Exam Group'}
      size="xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Exam Group Name *"
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Unit Test 1"
          />
          <div>
            <label className="block text-sm font-medium mb-1">
              Exam Type *
            </label>
            <select
              value={formData.type}
              onChange={e =>
                setFormData(prev => ({ ...prev, type: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="unit_test">Unit Test</option>
              <option value="mid_term">Mid Term</option>
              <option value="final_exam">Final Exam</option>
              <option value="practical">Practical</option>
              <option value="project">Project</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Term *</label>
            <select
              value={formData.termId}
              onChange={e =>
                setFormData(prev => ({ ...prev, termId: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Term</option>
              {termsData?.data?.map(term => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>
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
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
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
            placeholder="Exam group description..."
          />
        </div>

        {/* Exam Configuration */}
        <div>
          <h3 className="font-medium mb-3">Exam Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Max Marks *"
              type="number"
              value={formData.maxMarks}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  maxMarks: parseInt(e.target.value) || 0,
                }))
              }
              min="1"
            />
            <Input
              label="Pass Marks *"
              type="number"
              value={formData.passMarks}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  passMarks: parseInt(e.target.value) || 0,
                }))
              }
              min="1"
            />
            <Input
              label="Duration (minutes)"
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
              label="Weightage (%)"
              type="number"
              value={formData.weightage}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  weightage: parseInt(e.target.value) || 0,
                }))
              }
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Classes Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Applicable Classes *
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
            {Array.isArray(classesData?.data) &&
              classesData.data.map(cls => (
                <label key={cls.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.classes.includes(cls.id)}
                    onChange={() => toggleClass(cls.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{cls.name}</span>
                </label>
              ))}
          </div>
        </div>

        {/* Subjects Selection */}
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

        {/* Exam Settings */}
        <div>
          <h3 className="font-medium mb-3">Exam Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.examSettings.allowAbsent}
                  onChange={e =>
                    updateExamSettings('allowAbsent', e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-sm">Allow absent marking</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.examSettings.allowPartialMarks}
                  onChange={e =>
                    updateExamSettings('allowPartialMarks', e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-sm">Allow partial marks</span>
              </label>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.examSettings.roundOffMarks}
                  onChange={e =>
                    updateExamSettings('roundOffMarks', e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-sm">Round off marks</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.examSettings.showRank}
                  onChange={e =>
                    updateExamSettings('showRank', e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-sm">Show student rank</span>
              </label>
            </div>
          </div>
        </div>

        {/* Grading Criteria */}
        <div>
          <h3 className="font-medium mb-3">Grading Criteria</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.gradingCriteria.enableGrading}
                onChange={e =>
                  updateGradingCriteria('enableGrading', e.target.checked)
                }
                className="rounded"
              />
              <span className="text-sm font-medium">Enable grading system</span>
            </label>

            {formData.gradingCriteria.enableGrading && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Grading Type
                </label>
                <select
                  value={formData.gradingCriteria.gradingType}
                  onChange={e =>
                    updateGradingCriteria('gradingType', e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2 max-w-xs"
                >
                  <option value="percentage">Percentage Based</option>
                  <option value="points">Points Based</option>
                  <option value="custom">Custom Grades</option>
                </select>
              </div>
            )}
          </div>
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
              !formData.name.trim() ||
              formData.classes.length === 0 ||
              formData.subjects.length === 0
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {examGroup ? 'Update' : 'Create'} Exam Group
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const ExamGroupDetailsDialog = ({ examGroup, open, onClose }) => {
  if (!examGroup) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${examGroup.name} - Details`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Exam Type
            </label>
            <p className="text-sm capitalize">
              {examGroup.type.replace('_', ' ')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Term
            </label>
            <p className="text-sm">{examGroup.termName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <p className="text-sm capitalize">{examGroup.status}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Created
            </label>
            <p className="text-sm">
              {new Date(examGroup.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        {examGroup.description && (
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm bg-gray-50 p-3 rounded">
              {examGroup.description}
            </p>
          </div>
        )}

        {/* Exam Configuration */}
        <div>
          <h3 className="font-medium mb-3">Exam Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {examGroup.maxMarks}
              </div>
              <div className="text-sm text-gray-600">Max Marks</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {examGroup.passMarks}
              </div>
              <div className="text-sm text-gray-600">Pass Marks</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">
                {examGroup.duration}
              </div>
              <div className="text-sm text-gray-600">Duration (min)</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {examGroup.weightage}%
              </div>
              <div className="text-sm text-gray-600">Weightage</div>
            </div>
          </div>
        </div>

        {/* Classes and Subjects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Applicable Classes</h3>
            <div className="flex flex-wrap gap-2">
              {examGroup.classNames?.map((className, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                >
                  {className}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {examGroup.subjectNames?.map((subjectName, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                >
                  {subjectName}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Exam Settings */}
        <div>
          <h3 className="font-medium mb-3">Exam Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {examGroup.examSettings?.allowAbsent ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">Allow absent marking</span>
              </div>
              <div className="flex items-center gap-2">
                {examGroup.examSettings?.allowPartialMarks ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">Allow partial marks</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {examGroup.examSettings?.roundOffMarks ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">Round off marks</span>
              </div>
              <div className="flex items-center gap-2">
                {examGroup.examSettings?.showRank ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">Show student rank</span>
              </div>
            </div>
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

const ExamGroup = () => {
  const [selectedExamGroup, setSelectedExamGroup] = useState(null)
  const [showExamGroupDialog, setShowExamGroupDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  const queryClient = useQueryClient()

  const { data: examGroupsData, isLoading } = useQuery({
    queryKey: ['exam-groups', 'all'],
    queryFn: () => examApi.getExamGroups(),
  })

  const saveExamGroupMutation = useMutation({
    mutationFn: ({ id, data }) =>
      id ? examApi.updateExamGroup(id, data) : examApi.createExamGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['exam-groups'])
      setShowExamGroupDialog(false)
      setSelectedExamGroup(null)
    },
  })

  const deleteExamGroupMutation = useMutation({
    mutationFn: examApi.deleteExamGroup,
    onSuccess: () => {
      queryClient.invalidateQueries(['exam-groups'])
    },
  })

  const duplicateExamGroupMutation = useMutation({
    mutationFn: examApi.duplicateExamGroup,
    onSuccess: () => {
      queryClient.invalidateQueries(['exam-groups'])
    },
  })

  const handleEditExamGroup = examGroup => {
    setSelectedExamGroup(examGroup)
    setShowExamGroupDialog(true)
  }

  const handleDeleteExamGroup = examGroup => {
    if (confirm(`Are you sure you want to delete "${examGroup.name}"?`)) {
      deleteExamGroupMutation.mutate(examGroup.id)
    }
  }

  const handleDuplicateExamGroup = examGroup => {
    duplicateExamGroupMutation.mutate(examGroup.id)
  }

  const handleViewDetails = examGroup => {
    setSelectedExamGroup(examGroup)
    setShowDetailsDialog(true)
  }

  const handleSaveExamGroup = (id, data) => {
    saveExamGroupMutation.mutate({ id, data })
  }

  const handleAddExamGroup = () => {
    setSelectedExamGroup(null)
    setShowExamGroupDialog(true)
  }

  const filteredExamGroups =
    examGroupsData?.data?.filter(examGroup => {
      const matchesStatus =
        filterStatus === 'all' || examGroup.status === filterStatus
      const matchesType = filterType === 'all' || examGroup.type === filterType
      return matchesStatus && matchesType
    }) || []

  const getStatistics = () => {
    const examGroups = examGroupsData?.data || []
    return {
      total: examGroups.length,
      active: examGroups.filter(eg => eg.status === 'active').length,
      scheduled: examGroups.filter(eg => eg.status === 'scheduled').length,
      completed: examGroups.filter(eg => eg.status === 'completed').length,
    }
  }

  const stats = getStatistics()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exam Groups</h1>
        <button
          onClick={handleAddExamGroup}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Exam Group
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Groups</p>
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
              <p className="text-2xl font-bold">{stats.scheduled}</p>
              <p className="text-sm text-gray-600">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-gray-600" />
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
              <option value="scheduled">Scheduled</option>
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
              <option value="unit_test">Unit Test</option>
              <option value="mid_term">Mid Term</option>
              <option value="final_exam">Final Exam</option>
              <option value="practical">Practical</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-500">
              Showing {filteredExamGroups.length} of{' '}
              {examGroupsData?.data?.length || 0} exam groups
            </div>
          </div>
        </div>
      </div>

      {/* Exam Groups List */}
      <div className="space-y-4">
        {filteredExamGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Exam Groups Found
            </h3>
            <p className="text-gray-500 mb-4">
              {examGroupsData?.data?.length === 0
                ? 'Create your first exam group to get started.'
                : 'No exam groups match your current filters.'}
            </p>
            {examGroupsData?.data?.length === 0 && (
              <button
                onClick={handleAddExamGroup}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Exam Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.isArray(filteredExamGroups) &&
              filteredExamGroups.map(examGroup => (
                <ExamGroupCard
                  key={examGroup.id}
                  examGroup={examGroup}
                  onEdit={handleEditExamGroup}
                  onDelete={handleDeleteExamGroup}
                  onDuplicate={handleDuplicateExamGroup}
                  onViewDetails={handleViewDetails}
                />
              ))}
          </div>
        )}
      </div>

      {/* Exam Group Dialog */}
      <ExamGroupDialog
        examGroup={selectedExamGroup}
        open={showExamGroupDialog}
        onClose={() => {
          setShowExamGroupDialog(false)
          setSelectedExamGroup(null)
        }}
        onSave={handleSaveExamGroup}
      />

      {/* Details Dialog */}
      <ExamGroupDetailsDialog
        examGroup={selectedExamGroup}
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
      />
    </div>
  )
}

export default ExamGroup
