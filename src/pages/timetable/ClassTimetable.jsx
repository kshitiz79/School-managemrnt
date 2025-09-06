import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Save,
  Download,
  Upload,
  
  Copy,
  AlertTriangle,
  Clock,
  Users,
  BookOpen,
  MapPin,
  Eye,
  Edit3,
  RotateCcw,
  Printer,
} from 'lucide-react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import { Dropdown } from '../../components/ui/Dropdown'
import { timetableApi } from '../../lib/api/timetable'
import { classesApi } from '../../lib/api/classes'
import { sectionsApi } from '../../lib/api/sections'
import { subjectsApi } from '../../lib/api/subjects'
import { staffApi } from '../../lib/api/staff'

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

const DraggableSubject = ({ subject, teacher, room }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'subject',
    item: { subject, teacher, room },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div
      ref={drag}
      className={`p-2 bg-blue-100 border border-blue-300 rounded cursor-move text-xs ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="font-medium text-blue-800">{subject?.name}</div>
      <div className="text-blue-600">{teacher?.name}</div>
      {room && <div className="text-blue-500">{room}</div>}
    </div>
  )
}

const TimetableCell = ({ day, period, entry, onDrop, conflicts }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'subject',
    drop: item => onDrop(day, period.id, item),
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  })

  const hasConflict = conflicts.some(
    c => c.day === day && c.periodId === period.id,
  )

  if (period.isBreak) {
    return (
      <td className="border border-gray-300 bg-gray-100 text-center text-gray-500 text-sm p-2">
        {period.name}
      </td>
    )
  }

  return (
    <td
      ref={drop}
      className={`border border-gray-300 p-1 h-20 relative ${
        isOver ? 'bg-blue-50' : 'bg-white'
      } ${hasConflict ? 'bg-red-50 border-red-300' : ''}`}
    >
      {entry ? (
        <div className="relative h-full">
          <DraggableSubject
            subject={entry.subject}
            teacher={entry.teacher}
            room={entry.room}
          />
          {hasConflict && (
            <AlertTriangle className="absolute top-0 right-0 w-4 h-4 text-red-500" />
          )}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400 text-xs">
          Drop here
        </div>
      )}
    </td>
  )
}

const SubjectPool = ({ subjects, teachers, onAssignTeacher }) => {
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [room, setRoom] = useState('')

  const handleCreateEntry = () => {
    if (!selectedSubject || !selectedTeacher) return

    const subject = subjects.find(s => s.id === selectedSubject)
    const teacher = teachers.find(t => t.id === selectedTeacher)

    onAssignTeacher({ subject, teacher, room })

    setSelectedSubject('')
    setSelectedTeacher('')
    setRoom('')
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-medium mb-4">Subject Pool</h3>

      <div className="space-y-3 mb-4">
        <select
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="">Select Subject</option>
          {Array.isArray(subjects) &&
            subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </option>
            ))}
        </select>

        <select
          value={selectedTeacher}
          onChange={e => setSelectedTeacher(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="">Select Teacher</option>
          {Array.isArray(teachers) &&
            teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
        </select>

        <Input
          placeholder="Room (optional)"
          value={room}
          onChange={e => setRoom(e.target.value)}
          size="sm"
        />

        <button
          onClick={handleCreateEntry}
          disabled={!selectedSubject || !selectedTeacher}
          className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Create Entry
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {Array.isArray(subjects) &&
          subjects.map(subject => (
            <div key={subject.id} className="p-2 border rounded text-sm">
              <div className="font-medium">{subject.name}</div>
              <div className="text-gray-500 text-xs">{subject.code}</div>
            </div>
          ))}
      </div>
    </div>
  )
}

const ClassTimetable = () => {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [timetableData, setTimetableData] = useState({})
  const [conflicts, setConflicts] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [isDraft, setIsDraft] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const queryClient = useQueryClient()

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.getAll({ all: true }),
  })

  const { data: sectionsData } = useQuery({
    queryKey: ['sections', 'by-class', selectedClass],
    queryFn: () => sectionsApi.getByClass(selectedClass),
    enabled: !!selectedClass,
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'by-class', selectedClass],
    queryFn: () => subjectsApi.getByClass(selectedClass),
    enabled: !!selectedClass,
  })

  const { data: teachersData } = useQuery({
    queryKey: ['staff', 'teachers'],
    queryFn: () => staffApi.getTeachers(),
  })

  const { data: currentTimetable, isLoading } = useQuery({
    queryKey: ['timetable', 'class', selectedClass, selectedSection],
    queryFn: () =>
      timetableApi.getClassTimetable(selectedClass, selectedSection),
    enabled: !!selectedClass && !!selectedSection,
  })

  const saveTimetableMutation = useMutation({
    mutationFn: timetableApi.saveClassTimetable,
    onSuccess: () => {
      queryClient.invalidateQueries(['timetable'])
      setHasChanges(false)
    },
  })

  const publishTimetableMutation = useMutation({
    mutationFn: timetableApi.publishTimetable,
    onSuccess: () => {
      queryClient.invalidateQueries(['timetable'])
      setIsDraft(false)
      setHasChanges(false)
    },
  })

  const checkConflictsMutation = useMutation({
    mutationFn: timetableApi.checkConflicts,
    onSuccess: data => {
      setConflicts(data.conflicts || [])
    },
  })

  // Initialize timetable data
  React.useEffect(() => {
    if (currentTimetable?.data) {
      setTimetableData(currentTimetable.data.schedule || {})
      setIsDraft(currentTimetable.data.status === 'draft')
      setConflicts(currentTimetable.data.conflicts || [])
    } else {
      setTimetableData({})
      setConflicts([])
    }
  }, [currentTimetable])

  const handleDrop = useCallback(
    (day, periodId, item) => {
      const key = `${day}-${periodId}`
      const newTimetableData = {
        ...timetableData,
        [key]: item,
      }

      setTimetableData(newTimetableData)
      setHasChanges(true)

      // Check for conflicts
      checkConflictsMutation.mutate({
        classId: selectedClass,
        sectionId: selectedSection,
        schedule: newTimetableData,
      })
    },
    [timetableData, selectedClass, selectedSection, checkConflictsMutation]
  )

  const handleSave = (publish = false) => {
    const data = {
      classId: selectedClass,
      sectionId: selectedSection,
      schedule: timetableData,
      status: publish ? 'published' : 'draft',
    }

    if (publish) {
      publishTimetableMutation.mutate(data)
    } else {
      saveTimetableMutation.mutate(data)
    }
  }

  const handleExport = () => {
    const csvData = generateCSV()
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timetable-${selectedClass}-${selectedSection}.csv`
    a.click()
  }

  const generateCSV = () => {
    let csv = 'Day,'
    csv += `${PERIODS.filter(p => !p.isBreak)
      .map(p => p.name)
      .join(',')}\n`

    DAYS.forEach(day => {
      csv += `${day},`
      const row = PERIODS.filter(p => !p.isBreak).map(period => {
        const entry = timetableData[`${day}-${period.id}`]
        return entry ? `${entry.subject?.name} (${entry.teacher?.name})` : ''
      })
      csv += `${row.join(',')}\n`
    })

    return csv
  }

  const handlePrint = () => {
    window.print()
  }

  const getTimetableEntry = (day, periodId) => {
    return timetableData[`${day}-${periodId}`]
  }

  if (isLoading) return <LoadingSkeleton />

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Class Timetable</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportDialog(true)}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={handleExport}
              disabled={!selectedClass || !selectedSection}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handlePrint}
              disabled={!selectedClass || !selectedSection}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Class and Section Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={e => {
                  setSelectedClass(e.target.value)
                  setSelectedSection('')
                }}
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
              <label className="block text-sm font-medium mb-1">Section</label>
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
                className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">Select Section</option>
                {Array.isArray(sectionsData?.data) &&
                  sectionsData.data.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              {hasChanges && (
                <button
                  onClick={() => handleSave(false)}
                  disabled={saveTimetableMutation.isPending}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
              )}
              {isDraft && selectedClass && selectedSection && (
                <button
                  onClick={() => handleSave(true)}
                  disabled={
                    publishTimetableMutation.isPending || conflicts.length > 0
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status and Conflicts */}
        {selectedClass && selectedSection && (
          <div className="flex gap-4">
            <div
              className={`px-4 py-2 rounded-lg text-sm ${
                isDraft
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              Status: {isDraft ? 'Draft' : 'Published'}
            </div>
            {conflicts.length > 0 && (
              <div className="px-4 py-2 rounded-lg text-sm bg-red-100 text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {conflicts.length} Conflicts
              </div>
            )}
          </div>
        )}

        {selectedClass && selectedSection && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Subject Pool */}
            <div className="lg:col-span-1">
              <SubjectPool
                subjects={subjectsData?.data}
                teachers={teachersData?.data}
                onAssignTeacher={entry => {
                  // This could be used for quick assignment
                  console.log('Quick assign:', entry)
                }}
              />
            </div>

            {/* Timetable Grid */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 bg-gray-50 p-3 text-left font-medium">
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
                          <td className="border border-gray-300 bg-gray-50 p-3 font-medium">
                            {day}
                          </td>
                          {Array.isArray(PERIODS) &&
                            PERIODS.map(period => (
                              <TimetableCell
                                key={`${day}-${period.id}`}
                                day={day}
                                period={period}
                                entry={getTimetableEntry(day, period.id)}
                                onDrop={handleDrop}
                                conflicts={conflicts}
                              />
                            ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Conflicts List */}
        {conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Timetable Conflicts
            </h3>
            <div className="space-y-2">
              {Array.isArray(conflicts) &&
                conflicts.map((conflict, index) => (
                  <div key={index} className="text-red-700 text-sm">
                    • {conflict.message}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Import Dialog */}
        <Dialog
          open={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          title="Import Timetable"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>CSV format should include:</p>
              <ul className="list-disc list-inside mt-1">
                <li>First row: Day, Period 1, Period 2, ...</li>
                <li>Each row: Day name, Subject (Teacher), ...</li>
              </ul>
            </div>
            <div className="flex gap-2 pt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Import
              </button>
              <button
                onClick={() => setShowImportDialog(false)}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    </DndProvider>
  )
}

export default ClassTimetable
