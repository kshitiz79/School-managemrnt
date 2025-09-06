import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Filter,
  Save,
  AlertTriangle,
  CheckCircle,
  User,
  Users,
} from 'lucide-react'
import { Table } from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import { classTeacherApi } from '../../lib/api/classTeacher'
import { classesApi } from '../../lib/api/classes'
import { sectionsApi } from '../../lib/api/sections'
import { staffApi } from '../../lib/api/staff'

const AssignClassTeacher = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [assignments, setAssignments] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [hasChanges, setHasChanges] = useState(false)

  const queryClient = useQueryClient()

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.getAll({ all: true }),
  })

  const { data: sectionsData, isLoading: sectionsLoading } = useQuery({
    queryKey: ['sections', 'by-class', selectedClass],
    queryFn: () => sectionsApi.getByClass(selectedClass),
    enabled: !!selectedClass,
  })

  const { data: teachersData } = useQuery({
    queryKey: ['staff', 'teachers'],
    queryFn: () => staffApi.getTeachers(),
  })

  const { data: currentAssignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['classTeacher', 'assignments', selectedClass],
    queryFn: () => classTeacherApi.getAssignments(selectedClass),
    enabled: !!selectedClass,
  })

  const saveAssignmentsMutation = useMutation({
    mutationFn: classTeacherApi.saveAssignments,
    onSuccess: () => {
      queryClient.invalidateQueries(['classTeacher'])
      setHasChanges(false)
      setConflicts([])
    },
  })

  const checkConflictsMutation = useMutation({
    mutationFn: classTeacherApi.checkConflicts,
    onSuccess: data => {
      setConflicts(data.conflicts || [])
    },
  })

  // Initialize assignments when data loads
  React.useEffect(() => {
    if (sectionsData?.data && currentAssignments?.data) {
      const initialAssignments = sectionsData.data.map(section => {
        const existing = currentAssignments.data.find(
          a => a.sectionId === section.id,
        )
        return {
          sectionId: section.id,
          sectionName: section.name,
          className: section.class?.name,
          teacherId: existing?.teacherId || '',
          teacherName: existing?.teacher?.name || '',
          isNew: !existing,
        }
      })
      setAssignments(initialAssignments)
    }
  }, [sectionsData, currentAssignments])

  const handleTeacherChange = (sectionId, teacherId) => {
    const teacher = teachersData?.data?.find(t => t.id === teacherId)

    setAssignments(prev =>
      prev.map(assignment =>
        assignment.sectionId === sectionId
          ? {
              ...assignment,
              teacherId,
              teacherName: teacher?.name || '',
              isModified: true,
            }
          : assignment
      ),
    )

    setHasChanges(true)

    // Check for conflicts
    const updatedAssignments = assignments.map(assignment =>
      assignment.sectionId === sectionId
        ? { ...assignment, teacherId }
        : assignment
    )

    checkConflictsMutation.mutate({
      classId: selectedClass,
      assignments: updatedAssignments,
    })
  }

  const handleSaveAssignments = () => {
    const assignmentsToSave = assignments
      .filter(a => a.teacherId)
      .map(a => ({
        sectionId: a.sectionId,
        teacherId: a.teacherId,
      }))

    saveAssignmentsMutation.mutate({
      classId: selectedClass,
      assignments: assignmentsToSave,
    })
  }

  const getConflictForSection = sectionId => {
    return conflicts.find(c => c.sectionId === sectionId)
  }

  const getTeacherWorkload = teacherId => {
    if (!teacherId) return 0
    return assignments.filter(a => a.teacherId === teacherId).length
  }

  const columns = [
    {
      key: 'sectionName',
      header: 'Section',
      render: item => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium">{item.sectionName}</div>
            <div className="text-sm text-gray-500">{item.className}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'currentTeacher',
      header: 'Current Teacher',
      render: item => (
        <div className="flex items-center gap-2">
          {item.teacherName ? (
            <>
              <User className="w-4 h-4 text-gray-400" />
              <span>{item.teacherName}</span>
              {!item.isNew && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Assigned
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400 italic">Not assigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'assignTeacher',
      header: 'Assign Teacher',
      render: item => {
        const conflict = getConflictForSection(item.sectionId)
        return (
          <div className="space-y-2">
            <select
              value={item.teacherId}
              onChange={e =>
                handleTeacherChange(item.sectionId, e.target.value)
              }
              className={`w-full border rounded-lg px-3 py-2 ${
                conflict ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select Teacher</option>
              {Array.isArray(teachersData?.data) &&
                teachersData.data.map(teacher => {
                  const workload = getTeacherWorkload(teacher.id)
                  return (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} {workload > 0 && `(${workload} sections)`}
                    </option>
                  )
                })}
            </select>
            {conflict && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{conflict.message}</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: item => {
        const conflict = getConflictForSection(item.sectionId)

        if (conflict) {
          return (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Conflict
            </span>
          )
        }

        if (item.teacherId) {
          return (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {item.isModified ? 'Modified' : 'Assigned'}
            </span>
          )
        }

        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            Unassigned
          </span>
        )
      },
    },
  ]

  const isLoading = sectionsLoading || assignmentsLoading

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Assign Class Teachers</h1>
        {hasChanges && (
          <button
            onClick={handleSaveAssignments}
            disabled={saveAssignmentsMutation.isPending || conflicts.length > 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saveAssignmentsMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Class Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Choose a class</option>
              {Array.isArray(classesData?.data) &&
                classesData.data.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Input
              label="Search Sections"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
        </div>
      </div>

      {/* Conflicts Summary */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
            <AlertTriangle className="w-5 h-5" />
            Assignment Conflicts Detected
          </div>
          <div className="text-red-700 text-sm">
            Please resolve the following conflicts before saving:
            <ul className="list-disc list-inside mt-2">
              {Array.isArray(conflicts) &&
                conflicts.map((conflict, index) => (
                  <li key={index}>{conflict.message}</li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {/* Teacher Workload Summary */}
      {selectedClass && teachersData?.data && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">
            Teacher Workload Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teachersData.data
              .filter(teacher => getTeacherWorkload(teacher.id) > 0)
              .map(teacher => (
                <div key={teacher.id} className="text-sm">
                  <span className="font-medium">{teacher.name}</span>
                  <span className="text-blue-600 ml-2">
                    ({getTeacherWorkload(teacher.id)} sections)
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow">
        {!selectedClass ? (
          <EmptyState
            title="Select a class to assign teachers"
            description="Choose a class from the dropdown above to view and manage section assignments"
          />
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : assignments.length === 0 ? (
          <EmptyState
            title="No sections found"
            description="This class doesn't have any sections yet"
          />
        ) : (
          <>
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">
                  Section Assignments -{' '}
                  {classesData?.data?.find(c => c.id === selectedClass)?.name}
                </h2>
                <div className="text-sm text-gray-500">
                  {assignments.filter(a => a.teacherId).length} of{' '}
                  {assignments.length} sections assigned
                </div>
              </div>
            </div>
            <Table
              data={assignments.filter(
                assignment =>
                  assignment.sectionName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  assignment.teacherName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )}
              columns={columns}
            />
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Instructions</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            • Select a class to view its sections and current teacher
            assignments
          </li>
          <li>• Choose a teacher for each section from the dropdown</li>
          <li>
            • The system will automatically check for conflicts (e.g., teacher
            already assigned to another section)
          </li>
          <li>• Resolve any conflicts before saving the assignments</li>
          <li>• Teacher workload is displayed to help balance assignments</li>
        </ul>
      </div>
    </div>
  )
}

export default AssignClassTeacher
