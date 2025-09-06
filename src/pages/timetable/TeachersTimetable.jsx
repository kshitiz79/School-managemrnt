import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Save,
  Download,
  Upload,

  Search,
  Filter,
  AlertTriangle,
  Clock,
  Users,
  BookOpen,
  MapPin,
  Eye,
  Calendar,
  User,
  Printer,
} from 'lucide-react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import { Dropdown } from '../../components/ui/Dropdown'
import { Table } from '../../components/ui/Table'
import { timetableApi } from '../../lib/api/timetable'
import { staffApi } from '../../lib/api/staff'
import { classesApi } from '../../lib/api/classes'
import { subjectsApi } from '../../lib/api/subjects'

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

const DraggableClass = ({ classData, subject, room }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'class',
    item: { classData, subject, room },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div
      ref={drag}
      className={`p-2 bg-green-100 border border-green-300 rounded cursor-move text-xs ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="font-medium text-green-800">{classData?.name}</div>
      <div className="text-green-600">{subject?.name}</div>
      {room && <div className="text-green-500">{room}</div>}
    </div>
  )
}

const TeacherTimetableCell = ({
  day,
  period,
  entry,
  onDrop,
  conflicts,
  teacherId,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'class',
    drop: item => onDrop(day, period.id, item),
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  })

  const hasConflict = conflicts.some(
    c => c.day === day && c.periodId === period.id && c.teacherId === teacherId,
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
        isOver ? 'bg-green-50' : 'bg-white'
      } ${hasConflict ? 'bg-red-50 border-red-300' : ''}`}
    >
      {entry ? (
        <div className="relative h-full">
          <DraggableClass
            classData={entry.classData}
            subject={entry.subject}
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

const TeacherWorkloadSummary = ({ teacherId, timetableData }) => {
  const getWorkloadStats = () => {
    const entries = Object.values(timetableData).filter(entry => entry)
    const totalPeriods = entries.length
    const uniqueClasses = new Set(
      Array.isArray(entries) ? entries.map(e => e.classData?.id) : []
    ).size
    const uniqueSubjects = new Set(
      Array.isArray(entries) ? entries.map(e => e.subject?.id) : []
    ).size

    const dailyLoad = DAYS.map(day => {
      const dayEntries = Object.entries(timetableData).filter(
        ([key, entry]) => key.startsWith(day) && entry
      ).length
      return { day, periods: dayEntries }
    })

    return { totalPeriods, uniqueClasses, uniqueSubjects, dailyLoad }
  }

  const stats = getWorkloadStats()

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-medium mb-4">Workload Summary</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalPeriods}
          </div>
          <div className="text-sm text-blue-800">Total Periods</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded">
          <div className="text-2xl font-bold text-green-600">
            {stats.uniqueClasses}
          </div>
          <div className="text-sm text-green-800">Classes</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded">
          <div className="text-2xl font-bold text-purple-600">
            {stats.uniqueSubjects}
          </div>
          <div className="text-sm text-purple-800">Subjects</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round((stats.totalPeriods / 6) * 10) / 10}
          </div>
          <div className="text-sm text-orange-800">Avg/Day</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Daily Distribution</h4>
        {Array.isArray(stats.dailyLoad) &&
          stats.dailyLoad.map(({ day, periods }) => (
            <div key={day} className="flex justify-between text-sm">
              <span>{day.slice(0, 3)}</span>
              <span className="font-medium">{periods} periods</span>
            </div>
          ))}
      </div>
    </div>
  )
}

const ClassPool = ({ classes, subjects, onAssignClass }) => {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [room, setRoom] = useState('')

  const handleCreateEntry = () => {
    if (!selectedClass || !selectedSubject) return

    const classData = classes.find(c => c.id === selectedClass)
    const subject = subjects.find(s => s.id === selectedSubject)

    onAssignClass({ classData, subject, room })

    setSelectedClass('')
    setSelectedSubject('')
    setRoom('')
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-medium mb-4">Class Pool</h3>

      <div className="space-y-3 mb-4">
        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="">Select Class</option>
          {Array.isArray(classes) &&
            classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
        </select>

        <select
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="">Select Subject</option>
          {Array.isArray(subjects) &&
            subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
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
          disabled={!selectedClass || !selectedSubject}
          className="w-full bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
        >
          Create Entry
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {Array.isArray(classes) &&
          classes.map(cls => (
            <div key={cls.id} className="p-2 border rounded text-sm">
              <div className="font-medium">{cls.name}</div>
              <div className="text-gray-500 text-xs">
                {cls.sections?.length || 0} sections
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

const TeachersTimetable = () => {
  const [viewMode, setViewMode] = useState('individual') // 'individual' or 'overview'
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [timetableData, setTimetableData] = useState({})
  const [conflicts, setConflicts] = useState([])
  const [hasChanges, setHasChanges] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const queryClient = useQueryClient()

  const { data: teachersData } = useQuery({
    queryKey: ['staff', 'teachers'],
    queryFn: () => staffApi.getTeachers(),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.getAll({ all: true }),
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: () => subjectsApi.getAll({ all: true }),
  })

  const { data: currentTimetable, isLoading } = useQuery({
    queryKey: ['timetable', 'teacher', selectedTeacher],
    queryFn: () => timetableApi.getTeacherTimetable(selectedTeacher),
    enabled: !!selectedTeacher,
  })

  const { data: allTimetables } = useQuery({
    queryKey: ['timetable', 'teachers', 'overview'],
    queryFn: () => timetableApi.getAllTeacherTimetables(),
    enabled: viewMode === 'overview',
  })

  const saveTimetableMutation = useMutation({
    mutationFn: timetableApi.saveTeacherTimetable,
    onSuccess: () => {
      queryClient.invalidateQueries(['timetable'])
      setHasChanges(false)
    },
  })

  const checkConflictsMutation = useMutation({
    mutationFn: timetableApi.checkTeacherConflicts,
    onSuccess: data => {
      setConflicts(data.conflicts || [])
    },
  })

  // Initialize timetable data
  React.useEffect(() => {
    if (currentTimetable?.data) {
      setTimetableData(currentTimetable.data.schedule || {})
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
        teacherId: selectedTeacher,
        schedule: newTimetableData,
      })
    },
    [timetableData, selectedTeacher, checkConflictsMutation]
  )

  const handleSave = () => {
    saveTimetableMutation.mutate({
      teacherId: selectedTeacher,
      schedule: timetableData,
    })
  }

  const handleExport = () => {
    if (viewMode === 'individual') {
      exportIndividualTimetable()
    } else {
      exportAllTimetables()
    }
  }

  const exportIndividualTimetable = () => {
    const teacher = teachersData?.data?.find(t => t.id === selectedTeacher)
    const csvData = generateTeacherCSV(teacher, timetableData)
    downloadCSV(csvData, `teacher-timetable-${teacher?.name}.csv`)
  }

  const exportAllTimetables = () => {
    const csvData = generateAllTeachersCSV()
    downloadCSV(csvData, 'all-teachers-timetable.csv')
  }

  const generateTeacherCSV = (teacher, schedule) => {
    let csv = `Teacher: ${teacher?.name}\n`
    csv += 'Day,'
    csv += `${PERIODS.filter(p => !p.isBreak)
      .map(p => p.name)
      .join(',')}\n`

    DAYS.forEach(day => {
      csv += `${day},`
      const row = PERIODS.filter(p => !p.isBreak).map(period => {
        const entry = schedule[`${day}-${period.id}`]
        return entry ? `${entry.classData?.name} - ${entry.subject?.name}` : ''
      })
      csv += `${row.join(',')}\n`
    })

    return csv
  }

  const generateAllTeachersCSV = () => {
    let csv = 'Teacher,Day,Period,Class,Subject,Room\n'

    allTimetables?.data?.forEach(teacherData => {
      const schedule = teacherData.schedule || {}
      Object.entries(schedule).forEach(([key, entry]) => {
        const [day, periodId] = key.split('-')
        const period = PERIODS.find(p => p.id === parseInt(periodId))
        if (entry && !period?.isBreak) {
          csv += `${teacherData.teacher.name},${day},${period.name},${entry.classData?.name || ''},${entry.subject?.name || ''},${entry.room || ''}\n`
        }
      })
    })

    return csv
  }

  const downloadCSV = (csvData, filename) => {
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  const getTimetableEntry = (day, periodId) => {
    return timetableData[`${day}-${periodId}`]
  }

  const filteredTeachers =
    teachersData?.data?.filter(teacher =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const renderOverviewTable = () => {
    const columns = [
      { key: 'name', header: 'Teacher Name', sortable: true },
      { key: 'department', header: 'Department' },
      {
        key: 'totalPeriods',
        header: 'Total Periods',
        render: teacher => {
          const schedule =
            allTimetables?.data?.find(t => t.teacherId === teacher.id)
              ?.schedule || {}
          return Object.values(schedule).filter(entry => entry).length
        },
      },
      {
        key: 'classes',
        header: 'Classes',
        render: teacher => {
          const schedule =
            allTimetables?.data?.find(t => t.teacherId === teacher.id)
              ?.schedule || {}
          const uniqueClasses = new Set(
            Object.values(schedule)
              .filter(entry => entry)
              .map(entry => entry.classData?.name),
          )
          return uniqueClasses.size
        },
      },
      {
        key: 'conflicts',
        header: 'Conflicts',
        render: teacher => {
          const teacherConflicts = conflicts.filter(
            c => c.teacherId === teacher.id
          )
          return teacherConflicts.length > 0 ? (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              {teacherConflicts.length}
            </span>
          ) : (
            <span className="text-green-600">None</span>
          )
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        render: teacher => (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedTeacher(teacher.id)
                setViewMode('individual')
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => console.log('View details for', teacher.id)}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              View
            </button>
          </div>
        ),
      },
    ]

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Teachers Overview</h2>
            <div className="flex gap-4 items-center">
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                icon={Search}
                size="sm"
              />
            </div>
          </div>
        </div>
        <Table data={filteredTeachers} columns={columns} />
      </div>
    )
  }

  const renderIndividualTimetable = () => {
    if (!selectedTeacher) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Teacher
          </h3>
          <p className="text-gray-500">
            Choose a teacher to view and edit their timetable
          </p>
        </div>
      )
    }

    if (isLoading) return <LoadingSkeleton />

    const teacher = teachersData?.data?.find(t => t.id === selectedTeacher)

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Class Pool and Workload */}
        <div className="lg:col-span-1 space-y-6">
          <ClassPool
            classes={classesData?.data}
            subjects={subjectsData?.data}
            onAssignClass={entry => {
              console.log('Quick assign:', entry)
            }}
          />
          <TeacherWorkloadSummary
            teacherId={selectedTeacher}
            timetableData={timetableData}
          />
        </div>

        {/* Timetable Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">
                  {teacher?.name} - Timetable
                </h2>
                {hasChanges && (
                  <button
                    onClick={handleSave}
                    disabled={saveTimetableMutation.isPending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
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
                            <TeacherTimetableCell
                              key={`${day}-${period.id}`}
                              day={day}
                              period={period}
                              entry={getTimetableEntry(day, period.id)}
                              onDrop={handleDrop}
                              conflicts={conflicts}
                              teacherId={selectedTeacher}
                            />
                          ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teachers Timetable</h1>
          <div className="flex gap-2">
            <div className="flex border rounded-lg">
              <button
                onClick={() => setViewMode('individual')}
                className={`px-4 py-2 text-sm ${
                  viewMode === 'individual'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Individual
              </button>
              <button
                onClick={() => setViewMode('overview')}
                className={`px-4 py-2 text-sm ${
                  viewMode === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
            </div>
            <button
              onClick={() => setShowImportDialog(true)}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => window.print()}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Teacher Selection for Individual View */}
        {viewMode === 'individual' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Teacher
                </label>
                <select
                  value={selectedTeacher}
                  onChange={e => setSelectedTeacher(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Choose a teacher</option>
                  {Array.isArray(teachersData?.data) &&
                    teachersData.data.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.department}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex items-end">
                {conflicts.length > 0 && (
                  <div className="px-4 py-2 rounded-lg text-sm bg-red-100 text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {conflicts.length} Conflicts
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'overview'
          ? renderOverviewTable()
          : renderIndividualTimetable()}

        {/* Conflicts List */}
        {conflicts.length > 0 && viewMode === 'individual' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Teacher Timetable Conflicts
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
          title="Import Teacher Timetables"
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
                <li>Teacher, Day, Period, Class, Subject, Room</li>
                <li>One row per class assignment</li>
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

export default TeachersTimetable
