import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Eye,
  User,
  Calendar,
  BookOpen,
  Star,
  TrendingUp,
  Filter,
  Search,
  Download,
  Plus,
  Edit,
  FileText,
  Award,
  Target,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { observationApi } from '../../lib/api/observation'

const ObservationCard = ({ observation, onView, onEdit }) => {
  const getGradeColor = grade => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100'
      case 'B+':
      case 'B':
        return 'text-blue-600 bg-blue-100'
      case 'C+':
      case 'C':
        return 'text-yellow-600 bg-yellow-100'
      case 'D':
      case 'E':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getOverallGrade = () => {
    const grades = observation.parameters.map(p => p.grade)
    // Simple average calculation for demo
    const gradePoints = grades.map(g => {
      switch (g) {
        case 'A+':
          return 10
        case 'A':
          return 9
        case 'B+':
          return 8
        case 'B':
          return 7
        case 'C+':
          return 6
        case 'C':
          return 5
        case 'D':
          return 4
        case 'E':
          return 3
        default:
          return 0
      }
    })
    const avg = Array.isArray(gradePoints)
      ? gradePoints.reduce((sum, p) => sum + p, 0) / gradePoints.length
      : 0

    if (avg >= 9.5) return 'A+'
    if (avg >= 8.5) return 'A'
    if (avg >= 7.5) return 'B+'
    if (avg >= 6.5) return 'B'
    if (avg >= 5.5) return 'C+'
    if (avg >= 4.5) return 'C'
    if (avg >= 3.5) return 'D'
    return 'E'
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium">{observation.studentName}</h3>
            <p className="text-sm text-gray-500">
              {observation.className} - {observation.section} | Roll:{' '}
              {observation.rollNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(getOverallGrade())}`}
          >
            {getOverallGrade()}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Term: {observation.term}</span>
          <BookOpen className="w-4 h-4 ml-2" />
          <span>Subject: {observation.subjectName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Eye className="w-4 h-4" />
          <span>Observed by: {observation.observerName}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Parameters assessed:</span>{' '}
          {observation.parameters.length}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {observation.parameters.slice(0, 4).map((param, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${getGradeColor(param.grade)}`}
              title={`${param.parameterName}: ${param.grade}`}
            >
              {param.grade}
            </div>
          ))}
          {observation.parameters.length > 4 && (
            <div className="w-6 h-6 rounded bg-gray-100 text-xs flex items-center justify-center text-gray-600">
              +{observation.parameters.length - 4}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onView(observation)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(observation)}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const ObservationDetailsDialog = ({ observation, open, onClose }) => {
  if (!observation) return null

  const getGradeColor = grade => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100'
      case 'B+':
      case 'B':
        return 'text-blue-600 bg-blue-100'
      case 'C+':
      case 'C':
        return 'text-yellow-600 bg-yellow-100'
      case 'D':
      case 'E':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getGradeDescription = grade => {
    switch (grade) {
      case 'A+':
        return 'Outstanding'
      case 'A':
        return 'Excellent'
      case 'B+':
        return 'Very Good'
      case 'B':
        return 'Good'
      case 'C+':
        return 'Satisfactory'
      case 'C':
        return 'Acceptable'
      case 'D':
        return 'Needs Improvement'
      case 'E':
        return 'Unsatisfactory'
      default:
        return 'Not Assessed'
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Observation Details" size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{observation.studentName}</h2>
            <p className="text-gray-600">
              {observation.className} - {observation.section} | Roll:{' '}
              {observation.rollNumber}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall Performance</div>
            <div className="text-2xl font-bold text-blue-600">A</div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Term
            </label>
            <p className="text-sm">{observation.term}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <p className="text-sm">{observation.subjectName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Observer
            </label>
            <p className="text-sm">{observation.observerName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <p className="text-sm">
              {new Date(observation.observationDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Parameters Assessment */}
        <div>
          <h3 className="text-lg font-medium mb-4">Parameter Assessment</h3>
          <div className="space-y-4">
            {Array.isArray(observation.parameters) &&
              observation.parameters.map((param, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{param.parameterName}</h4>
                      <p className="text-sm text-gray-600">
                        {param.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(param.grade)}`}
                      >
                        {param.grade}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {getGradeDescription(param.grade)}
                      </div>
                    </div>
                  </div>
                  {param.remarks && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <strong>Remarks:</strong> {param.remarks}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Overall Comments */}
        {observation.overallComments && (
          <div>
            <h3 className="text-lg font-medium mb-2">Overall Comments</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">{observation.overallComments}</p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {observation.recommendations &&
          observation.recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {Array.isArray(observation.recommendations) &&
                  observation.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const Observation = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [termFilter, setTermFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [selectedObservation, setSelectedObservation] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const { data: observationsData, isLoading } = useQuery({
    queryKey: [
      'observations',
      searchTerm,
      termFilter,
      classFilter,
      subjectFilter,
    ],
    queryFn: () =>
      observationApi.getObservations({
        search: searchTerm,
        term: termFilter,
        classId: classFilter,
        subjectId: subjectFilter,
      }),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => observationApi.getClasses(),
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: () => observationApi.getSubjects(),
  })

  const handleViewObservation = observation => {
    setSelectedObservation(observation)
    setShowDetails(true)
  }

  const handleEditObservation = observation => {
    // Navigate to edit form
    console.log('Edit observation:', observation.id)
  }

  const filteredObservations = observationsData?.data || []

  const getStatistics = () => {
    const total = filteredObservations.length
    const gradeDistribution = filteredObservations.reduce((acc, obs) => {
      obs.parameters.forEach(param => {
        acc[param.grade] = (acc[param.grade] || 0) + 1
      })
      return acc
    }, {})

    return {
      total,
      excellent: (gradeDistribution['A+'] || 0) + (gradeDistribution['A'] || 0),
      good: (gradeDistribution['B+'] || 0) + (gradeDistribution['B'] || 0),
      satisfactory:
        (gradeDistribution['C+'] || 0) + (gradeDistribution['C'] || 0),
      needsImprovement:
        (gradeDistribution['D'] || 0) + (gradeDistribution['E'] || 0),
    }
  }

  const stats = getStatistics()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Observations</h1>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Observation
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Observations</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.excellent}</p>
              <p className="text-sm text-gray-600">Excellent (A+/A)</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.good}</p>
              <p className="text-sm text-gray-600">Good (B+/B)</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.satisfactory}</p>
              <p className="text-sm text-gray-600">Satisfactory (C+/C)</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{stats.needsImprovement}</p>
              <p className="text-sm text-gray-600">Needs Improvement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={termFilter}
            onChange={e => setTermFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Terms</option>
            <option value="term1">Term 1</option>
            <option value="term2">Term 2</option>
            <option value="annual">Annual</option>
          </select>
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Classes</option>
            {Array.isArray(classesData?.data) &&
              classesData.data.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
          </select>
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Subjects</option>
            {Array.isArray(subjectsData?.data) &&
              subjectsData.data.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
          </select>
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Observations List */}
      <div className="space-y-4">
        {filteredObservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Observations Found
            </h3>
            <p className="text-gray-500">
              No observations match your current filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.isArray(filteredObservations) &&
              filteredObservations.map(observation => (
                <ObservationCard
                  key={observation.id}
                  observation={observation}
                  onView={handleViewObservation}
                  onEdit={handleEditObservation}
                />
              ))}
          </div>
        )}
      </div>

      {/* Observation Details Dialog */}
      <ObservationDetailsDialog
        observation={selectedObservation}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  )
}

export default Observation
