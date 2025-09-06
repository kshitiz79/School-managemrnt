import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Eye,
  User,
  Calendar,
  BookOpen,
  Save,
  Search,
  X,
  Star,
  Target,
  Plus,
  CheckCircle,
  Award,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { observationApi } from '../../lib/api/observation'

// Validation Schema
const observationSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  term: z.enum(['term1', 'term2', 'annual'], {
    required_error: 'Term is required',
  }),
  observationDate: z.string().min(1, 'Observation date is required'),
  overallComments: z.string().optional(),
  recommendations: z.array(z.string()).optional(),
})

const StudentSelector = ({ onSelect, selectedStudent }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'search', searchTerm],
    queryFn: () => observationApi.searchStudents(searchTerm),
    enabled: searchTerm.length > 2,
  })

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Student *
      </label>
      {selectedStudent ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="font-medium">{selectedStudent.name}</div>
              <div className="text-sm text-gray-500">
                {selectedStudent.className} - {selectedStudent.section} | Roll:{' '}
                {selectedStudent.rollNumber}
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelect(null)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search student by name, roll number..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {showSearch && searchTerm.length > 2 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {studentsData?.data?.length > 0 ? (
                studentsData.data.map(student => (
                  <button
                    key={student.id}
                    onClick={() => {
                      onSelect(student)
                      setShowSearch(false)
                      setSearchTerm('')
                    }}
                    className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">
                        {student.className} - {student.section} | Roll:{' '}
                        {student.rollNumber}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-center">
                  No students found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const ParameterAssessment = ({
  parameters,
  assessments,
  onAssessmentChange,
}) => {
  const getGradeColor = grade => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100 border-green-300'
      case 'B+':
      case 'B':
        return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'C+':
      case 'C':
        return 'text-yellow-600 bg-yellow-100 border-yellow-300'
      case 'D':
      case 'E':
        return 'text-red-600 bg-red-100 border-red-300'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const getCategoryIcon = category => {
    switch (category) {
      case 'academic':
        return BookOpen
      case 'social':
        return User
      case 'emotional':
        return Star
      case 'physical':
        return Award
      case 'creative':
        return Target
      default:
        return CheckCircle
    }
  }

  const handleGradeChange = (parameterId, grade) => {
    onAssessmentChange(parameterId, {
      grade,
      remarks: assessments[parameterId]?.remarks || '',
    })
  }

  const handleRemarksChange = (parameterId, remarks) => {
    onAssessmentChange(parameterId, {
      grade: assessments[parameterId]?.grade || '',
      remarks,
    })
  }

  if (!parameters || parameters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No parameters available for assessment</p>
      </div>
    )
  }

  // Group parameters by category
  const groupedParameters = Array.isArray(parameters)
    ? parameters.reduce((acc, param) => {
        if (!acc[param.category]) {
          acc[param.category] = []
        }
        acc[param.category].push(param)
        return acc
      }, {})
    : {}

  return (
    <div className="space-y-6">
      {Array.isArray(Object.entries(groupedParameters)) &&
        Object.entries(groupedParameters).map(([category, categoryParams]) => {
          const Icon = getCategoryIcon(category)
          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Icon className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium capitalize">
                  {category} Parameters
                </h3>
                <span className="text-sm text-gray-500">
                  ({categoryParams.length})
                </span>
              </div>
              <div className="space-y-4">
                {Array.isArray(categoryParams) &&
                  categoryParams.map(parameter => (
                    <div key={parameter.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{parameter.name}</h4>
                          <p className="text-sm text-gray-600">
                            {parameter.description}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            Weight: {parameter.weight}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Grade *
                          </label>
                          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                            {parameter.rubric?.map(rubricItem => (
                              <button
                                key={rubricItem.grade}
                                type="button"
                                onClick={() =>
                                  handleGradeChange(
                                    parameter.id,
                                    rubricItem.grade,
                                  )
                                }
                                className={`p-2 border rounded text-sm font-medium transition-colors ${
                                  assessments[parameter.id]?.grade ===
                                  rubricItem.grade
                                    ? getGradeColor(rubricItem.grade)
                                    : 'border-gray-300 hover:bg-gray-50'
                                }`}
                                title={rubricItem.description}
                              >
                                {rubricItem.grade}
                              </button>
                            ))}
                          </div>
                          {assessments[parameter.id]?.grade && (
                            <div className="mt-1 text-xs text-gray-600">
                              {
                                parameter.rubric?.find(
                                  r =>
                                    r.grade === assessments[parameter.id]?.grade,
                                )?.description
                              }
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Remarks (Optional)
                            </label>
                            <textarea
                              value={assessments[parameter.id]?.remarks || ''}
                              onChange={e =>
                                handleRemarksChange(
                                  parameter.id,
                                  e.target.value
                                )
                              }
                              rows={2}
                              className="w-full border rounded px-3 py-2 text-sm"
                              placeholder="Add specific observations or comments..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )
        })}
    </div>
  )
}

const RecommendationInput = ({ recommendations, onRecommendationsChange }) => {
  const addRecommendation = () => {
    onRecommendationsChange([...recommendations, ''])
  }

  const updateRecommendation = (index, value) => {
    const updated = recommendations.map((rec, i) => (i === index ? value : rec))
    onRecommendationsChange(updated)
  }

  const removeRecommendation = index => {
    onRecommendationsChange(recommendations.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Recommendations
        </label>
        <button
          type="button"
          onClick={addRecommendation}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Recommendation
        </button>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-gray-500 text-sm">No recommendations added</p>
      ) : (
        <div className="space-y-2">
          {Array.isArray(recommendations) &&
            recommendations.map((recommendation, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={recommendation}
                  onChange={e => updateRecommendation(index, e.target.value)}
                  placeholder="Enter recommendation..."
                  className="flex-1 border rounded px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeRecommendation(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

const AssignObservation = () => {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [assessments, setAssessments] = useState({})
  const [recommendations, setRecommendations] = useState([])

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(observationSchema),
    defaultValues: {
      observationDate: new Date().toISOString().split('T')[0],
      term: 'term1',
    },
  })

  const watchedSubject = watch('subjectId')

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: () => observationApi.getSubjects(),
  })

  const { data: parametersData } = useQuery({
    queryKey: ['observation', 'parameters', 'by-subject', watchedSubject],
    queryFn: () => observationApi.getParametersBySubject(watchedSubject),
    enabled: !!watchedSubject,
  })

  const createObservationMutation = useMutation({
    mutationFn: observationApi.createObservation,
    onSuccess: () => {
      queryClient.invalidateQueries(['observations'])
      reset()
      setSelectedStudent(null)
      setAssessments({})
      setRecommendations([])
    },
  })

  const handleAssessmentChange = (parameterId, assessment) => {
    setAssessments(prev => ({
      ...prev,
      [parameterId]: assessment,
    }))
  }

  const onSubmit = data => {
    // Validate that all parameters have grades
    const requiredParameters = parametersData?.data || []
    const missingAssessments = requiredParameters.filter(
      param => !assessments[param.id]?.grade
    )

    if (missingAssessments.length > 0) {
      alert(
        `Please provide grades for all parameters: ${missingAssessments.map(p => p.name).join(', ')}`,
      )
      return
    }

    const observationData = {
      ...data,
      studentId: selectedStudent?.id,
      parameters: Object.entries(assessments).map(
        ([parameterId, assessment]) => ({
          parameterId,
          grade: assessment.grade,
          remarks: assessment.remarks,
        }),
      ),
      recommendations: recommendations.filter(rec => rec.trim()),
      observedBy: 'current-user', // In real app, get from auth
      observedAt: new Date().toISOString(),
    }

    createObservationMutation.mutate(observationData)
  }

  const getCompletionStats = () => {
    const totalParameters = parametersData?.data?.length || 0
    const completedParameters = Object.keys(assessments).filter(
      id => assessments[id]?.grade
    ).length

    return {
      total: totalParameters,
      completed: completedParameters,
      percentage:
        totalParameters > 0
          ? Math.round((completedParameters / totalParameters) * 100)
          : 0,
    }
  }

  const stats = getCompletionStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Assign Observation</h1>
        <div className="text-sm text-gray-500">
          Progress: {stats.completed}/{stats.total} parameters (
          {stats.percentage}%)
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <StudentSelector
                onSelect={setSelectedStudent}
                selectedStudent={selectedStudent}
              />
              {!selectedStudent && (
                <p className="text-red-500 text-sm">Please select a student</p>
              )}

              <Controller
                name="subjectId"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Subject *
                    </label>
                    <select
                      {...field}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        errors.subjectId ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Subject</option>
                      {Array.isArray(subjectsData?.data) &&
                        subjectsData.data.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                    </select>
                    {errors.subjectId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.subjectId.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="space-y-4">
              <Controller
                name="term"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Term *
                    </label>
                    <select
                      {...field}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="term1">Term 1</option>
                      <option value="term2">Term 2</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                )}
              />

              <Controller
                name="observationDate"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Observation Date *"
                    type="date"
                    {...field}
                    error={errors.observationDate?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Parameter Assessment */}
        {watchedSubject && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Parameter Assessment</h2>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {stats.percentage}%
                </span>
              </div>
            </div>

            <ParameterAssessment
              parameters={parametersData?.data}
              assessments={assessments}
              onAssessmentChange={handleAssessmentChange}
            />
          </div>
        )}

        {/* Overall Comments and Recommendations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Overall Assessment</h2>

          <div className="space-y-4">
            <Controller
              name="overallComments"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Overall Comments
                  </label>
                  <textarea
                    {...field}
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Provide overall observations about the student's performance..."
                  />
                </div>
              )}
            />

            <RecommendationInput
              recommendations={recommendations}
              onRecommendationsChange={setRecommendations}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              reset()
              setSelectedStudent(null)
              setAssessments({})
              setRecommendations([])
            }}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={
              createObservationMutation.isPending ||
              !selectedStudent ||
              stats.percentage < 100
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {createObservationMutation.isPending
              ? 'Saving...'
              : 'Save Observation'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AssignObservation
