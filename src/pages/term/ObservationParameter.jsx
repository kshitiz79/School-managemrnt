import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  BookOpen,
  Users,
  Star,
  Award,
  CheckCircle,
  Settings,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { observationApi } from '../../lib/api/observation'

const ParameterCard = ({ parameter, onEdit, onDelete }) => {
  const getCategoryColor = category => {
    switch (category) {
      case 'academic':
        return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'social':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'emotional':
        return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'physical':
        return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'creative':
        return 'text-pink-600 bg-pink-100 border-pink-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getSubjectIcon = subject => {
    switch (subject) {
      case 'mathematics':
        return '🔢'
      case 'english':
        return '📚'
      case 'science':
        return '🔬'
      case 'social':
        return '🌍'
      case 'hindi':
        return '🇮🇳'
      case 'art':
        return '🎨'
      case 'pe':
        return '⚽'
      default:
        return '📖'
    }
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getSubjectIcon(parameter.subjectId)}</div>
          <div>
            <h3 className="font-medium">{parameter.name}</h3>
            <p className="text-sm text-gray-600">{parameter.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(parameter.category)}`}
          >
            {parameter.category.toUpperCase()}
          </span>
          <button
            onClick={() => onEdit(parameter)}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(parameter)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subject:</span>
          <span className="font-medium">{parameter.subjectName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Classes:</span>
          <span className="text-xs text-gray-600">
            {parameter.applicableClasses?.join(', ') || 'All'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Weight:</span>
          <span className="font-medium">{parameter.weight}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status:</span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              parameter.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {parameter.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {parameter.rubric && parameter.rubric.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs text-gray-500 mb-1">Grading Rubric:</div>
          <div className="flex gap-1">
            {parameter.rubric.slice(0, 4).map((grade, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded text-xs flex items-center justify-center font-medium bg-gray-100 text-gray-700"
                title={`${grade.grade}: ${grade.description}`}
              >
                {grade.grade}
              </div>
            ))}
            {parameter.rubric.length > 4 && (
              <div className="w-6 h-6 rounded text-xs flex items-center justify-center bg-gray-100 text-gray-600">
                +{parameter.rubric.length - 4}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const ParameterDialog = ({ parameter, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: parameter?.name || '',
    description: parameter?.description || '',
    category: parameter?.category || 'academic',
    subjectId: parameter?.subjectId || '',
    weight: parameter?.weight || 10,
    isActive: parameter?.isActive ?? true,
    applicableClasses: parameter?.applicableClasses || [],
    rubric: parameter?.rubric || [
      { grade: 'A+', description: 'Outstanding', minScore: 90 },
      { grade: 'A', description: 'Excellent', minScore: 80 },
      { grade: 'B+', description: 'Very Good', minScore: 70 },
      { grade: 'B', description: 'Good', minScore: 60 },
      { grade: 'C+', description: 'Satisfactory', minScore: 50 },
      { grade: 'C', description: 'Acceptable', minScore: 40 },
      { grade: 'D', description: 'Needs Improvement', minScore: 30 },
      { grade: 'E', description: 'Unsatisfactory', minScore: 0 },
    ],
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: () => observationApi.getSubjects(),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => observationApi.getClasses(),
  })

  const handleSave = () => {
    onSave(parameter?.id, formData)
    onClose()
  }

  const updateRubric = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      rubric: prev.rubric.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const toggleClass = classId => {
    setFormData(prev => ({
      ...prev,
      applicableClasses: prev.applicableClasses.includes(classId)
        ? prev.applicableClasses.filter(id => id !== classId)
        : [...prev.applicableClasses, classId],
    }))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={parameter ? 'Edit Parameter' : 'Add Parameter'}
      size="xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Parameter Name *"
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Reading Comprehension"
          />
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={e =>
                setFormData(prev => ({ ...prev, category: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="academic">Academic</option>
              <option value="social">Social & Emotional</option>
              <option value="emotional">Emotional Development</option>
              <option value="physical">Physical Development</option>
              <option value="creative">Creative Expression</option>
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
            placeholder="Describe what this parameter measures..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Input
            label="Weight (%)"
            type="number"
            value={formData.weight}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                weight: parseInt(e.target.value) || 0,
              }))
            }
            placeholder="10"
            min="1"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Applicable Classes
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
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
          {formData.applicableClasses.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No classes selected (applies to all)
            </p>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-4">Grading Rubric</h3>
          <div className="space-y-3">
            {Array.isArray(formData.rubric) &&
              formData.rubric.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-3 items-center p-3 border rounded-lg"
                >
                  <Input
                    label="Grade"
                    value={item.grade}
                    onChange={e => updateRubric(index, 'grade', e.target.value)}
                    size="sm"
                  />
                  <Input
                    label="Description"
                    value={item.description}
                    onChange={e =>
                      updateRubric(index, 'description', e.target.value)
                    }
                    size="sm"
                  />
                  <Input
                    label="Min Score"
                    type="number"
                    value={item.minScore}
                    onChange={e =>
                      updateRubric(
                        index,
                        'minScore',
                        parseInt(e.target.value) || 0,
                      )
                    }
                    size="sm"
                    min="0"
                    max="100"
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <span className="text-sm">Active</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim() || !formData.subjectId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Parameter
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const ObservationParameter = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedParameter, setSelectedParameter] = useState(null)
  const [showParameterDialog, setShowParameterDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const queryClient = useQueryClient()

  const { data: parametersData, isLoading } = useQuery({
    queryKey: ['observation', 'parameters'],
    queryFn: () => observationApi.getParameters(),
  })

  const saveParameterMutation = useMutation({
    mutationFn: ({ id, data }) =>
      id
        ? observationApi.updateParameter(id, data)
        : observationApi.createParameter(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['observation', 'parameters'])
      setShowParameterDialog(false)
      setSelectedParameter(null)
    },
  })

  const deleteParameterMutation = useMutation({
    mutationFn: observationApi.deleteParameter,
    onSuccess: () => {
      queryClient.invalidateQueries(['observation', 'parameters'])
    },
  })

  const handleEditParameter = parameter => {
    setSelectedParameter(parameter)
    setShowParameterDialog(true)
  }

  const handleDeleteParameter = parameter => {
    if (confirm(`Are you sure you want to delete "${parameter.name}"?`)) {
      deleteParameterMutation.mutate(parameter.id)
    }
  }

  const handleSaveParameter = (id, data) => {
    saveParameterMutation.mutate({ id, data })
  }

  const handleAddParameter = () => {
    setSelectedParameter(null)
    setShowParameterDialog(true)
  }

  const filteredParameters =
    parametersData?.data?.filter(param => {
      const matchesSearch =
        param.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        param.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTab = activeTab === 'all' || param.category === activeTab

      return matchesSearch && matchesTab
    }) || []

  const getTabCounts = () => {
    const parameters = parametersData?.data || []
    return {
      all: parameters.length,
      academic: parameters.filter(p => p.category === 'academic').length,
      social: parameters.filter(p => p.category === 'social').length,
      emotional: parameters.filter(p => p.category === 'emotional').length,
      physical: parameters.filter(p => p.category === 'physical').length,
      creative: parameters.filter(p => p.category === 'creative').length,
    }
  }

  const tabCounts = getTabCounts()

  const tabs = [
    { id: 'all', label: 'All Parameters', icon: Target, count: tabCounts.all },
    {
      id: 'academic',
      label: 'Academic',
      icon: BookOpen,
      count: tabCounts.academic,
    },
    { id: 'social', label: 'Social', icon: Users, count: tabCounts.social },
    {
      id: 'emotional',
      label: 'Emotional',
      icon: Star,
      count: tabCounts.emotional,
    },
    {
      id: 'physical',
      label: 'Physical',
      icon: Award,
      count: tabCounts.physical,
    },
    {
      id: 'creative',
      label: 'Creative',
      icon: CheckCircle,
      count: tabCounts.creative,
    },
  ]

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Observation Parameters</h1>
        <button
          onClick={handleAddParameter}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Parameter
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search parameters..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            {Array.isArray(tabs) &&
              tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                )
              })}
          </nav>
        </div>

        <div className="p-6">
          {filteredParameters.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No Parameters Found' : 'No Parameters'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? 'No parameters match your search criteria.'
                  : 'Create your first observation parameter to get started.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddParameter}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Parameter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(filteredParameters) &&
                filteredParameters.map(parameter => (
                  <ParameterCard
                    key={parameter.id}
                    parameter={parameter}
                    onEdit={handleEditParameter}
                    onDelete={handleDeleteParameter}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Parameter Dialog */}
      <ParameterDialog
        parameter={selectedParameter}
        open={showParameterDialog}
        onClose={() => {
          setShowParameterDialog(false)
          setSelectedParameter(null)
        }}
        onSave={handleSaveParameter}
      />
    </div>
  )
}

export default ObservationParameter
