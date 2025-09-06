import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileSpreadsheet,
  Upload,
  Download,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Filter,
  Search,
  RefreshCw,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { examApi } from '../../lib/api/exams'

const MarksEntryGrid = ({
  examSchedule,
  students,
  marks,
  onMarksChange,
  onSave,
  isPublished,
}) => {
  const [selectedCell, setSelectedCell] = useState(null)
  const [editingCell, setEditingCell] = useState(null)
  const [tempValue, setTempValue] = useState('')
  const gridRef = useRef(null)

  const handleCellClick = (studentId, field) => {
    if (isPublished) return
    setSelectedCell({ studentId, field })
    setEditingCell({ studentId, field })
    const currentValue = getFieldValue(studentId, field)
    setTempValue(currentValue?.toString() || '')
  }

  const handleCellKeyDown = (e, studentId, field) => {
    if (isPublished) return

    switch (e.key) {
      case 'Enter':
        handleCellSave()
        // Move to next row
        const currentIndex = students.findIndex(s => s.id === studentId)
        if (currentIndex < students.length - 1) {
          const nextStudent = students[currentIndex + 1]
          handleCellClick(nextStudent.id, field)
        }
        break
      case 'Tab':
        e.preventDefault()
        handleCellSave()
        // Move to next column or next row
        if (field === 'marksObtained') {
          handleCellClick(studentId, 'remarks')
        } else {
          const currentIndex = students.findIndex(s => s.id === studentId)
          if (currentIndex < students.length - 1) {
            const nextStudent = students[currentIndex + 1]
            handleCellClick(nextStudent.id, 'marksObtained')
          }
        }
        break
      case 'Escape':
        setEditingCell(null)
        setSelectedCell(null)
        setTempValue('')
        break
    }
  }

  const handleCellSave = () => {
    if (editingCell) {
      const { studentId, field } = editingCell
      let value = tempValue

      if (field === 'marksObtained') {
        // Validate marks
        if (value === 'AB' || value === 'ab') {
          value = 'AB'
        } else {
          const numValue = parseFloat(value)
          if (isNaN(numValue)) {
            value = ''
          } else if (numValue < 0) {
            value = 0
          } else if (numValue > examSchedule.maxMarks) {
            value = examSchedule.maxMarks
          } else {
            value = numValue
          }
        }
      }

      onMarksChange(studentId, field, value)
    }

    setEditingCell(null)
    setSelectedCell(null)
    setTempValue('')
  }

  const getFieldValue = (studentId, field) => {
    const studentMark = marks.find(m => m.studentId === studentId)
    return studentMark ? studentMark[field] : ''
  }

  const calculateGrade = (marksObtained, maxMarks) => {
    if (marksObtained === 'AB') return 'AB'
    if (!marksObtained || marksObtained === '') return ''

    const percentage = (marksObtained / maxMarks) * 100

    if (percentage >= 91) return 'A+'
    if (percentage >= 81) return 'A'
    if (percentage >= 71) return 'B+'
    if (percentage >= 61) return 'B'
    if (percentage >= 51) return 'C+'
    if (percentage >= 41) return 'C'
    if (percentage >= 33) return 'D'
    return 'E'
  }

  const getGradeColor = grade => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-50'
      case 'B+':
      case 'B':
        return 'text-blue-600 bg-blue-50'
      case 'C+':
      case 'C':
        return 'text-yellow-600 bg-yellow-50'
      case 'D':
      case 'E':
        return 'text-red-600 bg-red-50'
      case 'AB':
        return 'text-gray-600 bg-gray-50'
      default:
        return ''
    }
  }

  const isValidMarks = (value, maxMarks) => {
    if (value === 'AB' || value === '') return true
    const numValue = parseFloat(value)
    return !isNaN(numValue) && numValue >= 0 && numValue <= maxMarks
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">
              {examSchedule.subjectName} - {examSchedule.className}
            </h3>
            <p className="text-sm text-gray-600">
              Max Marks: {examSchedule.maxMarks} | Pass Marks:{' '}
              {examSchedule.passMarks}
            </p>
          </div>
          <div className="flex gap-2">
            {!isPublished && (
              <button
                onClick={onSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Marks
              </button>
            )}
            {isPublished && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Published
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto" ref={gridRef}>
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left py-3 px-4 border-r">S.No</th>
              <th className="text-left py-3 px-4 border-r">Roll No</th>
              <th className="text-left py-3 px-4 border-r">Student Name</th>
              <th className="text-center py-3 px-4 border-r">
                Marks Obtained
                <div className="text-xs text-gray-500 font-normal">
                  (Max: {examSchedule.maxMarks})
                </div>
              </th>
              <th className="text-center py-3 px-4 border-r">Grade</th>
              <th className="text-center py-3 px-4 border-r">Status</th>
              <th className="text-left py-3 px-4">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(students) &&
              students.map((student, index) => {
                const marksObtained = getFieldValue(student.id, 'marksObtained')
                const remarks = getFieldValue(student.id, 'remarks')
                const grade = calculateGrade(
                  marksObtained,
                  examSchedule.maxMarks,
                )
                const isPass =
                  marksObtained !== 'AB' &&
                  marksObtained >= examSchedule.passMarks
                const isAbsent = marksObtained === 'AB'

                return (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 border-r text-center">
                      {index + 1}
                    </td>
                    <td className="py-2 px-4 border-r font-medium">
                      {student.rollNumber}
                    </td>
                    <td className="py-2 px-4 border-r">{student.name}</td>

                    {/* Marks Input Cell */}
                    <td className="py-2 px-4 border-r text-center">
                      {editingCell?.studentId === student.id &&
                      editingCell?.field === 'marksObtained' ? (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={e => setTempValue(e.target.value)}
                          onBlur={handleCellSave}
                          onKeyDown={e =>
                            handleCellKeyDown(e, student.id, 'marksObtained')
                          }
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            !isValidMarks(tempValue, examSchedule.maxMarks)
                              ? 'border-red-500'
                              : ''
                          }`}
                          placeholder="0 or AB"
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() =>
                            handleCellClick(student.id, 'marksObtained')
                          }
                          className={`w-20 mx-auto px-2 py-1 rounded cursor-pointer hover:bg-gray-100 ${
                            selectedCell?.studentId === student.id &&
                            selectedCell?.field === 'marksObtained'
                              ? 'ring-2 ring-blue-500'
                              : ''
                          } ${isPublished ? 'cursor-not-allowed' : ''}`}
                        >
                          {marksObtained || '-'}
                        </div>
                      )}
                    </td>

                    {/* Grade Cell */}
                    <td className="py-2 px-4 border-r text-center">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(grade)}`}
                      >
                        {grade || '-'}
                      </span>
                    </td>

                    {/* Status Cell */}
                    <td className="py-2 px-4 border-r text-center">
                      {isAbsent ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                          Absent
                        </span>
                      ) : marksObtained ? (
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            isPass
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isPass ? 'Pass' : 'Fail'}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Remarks Cell */}
                    <td className="py-2 px-4">
                      {editingCell?.studentId === student.id &&
                      editingCell?.field === 'remarks' ? (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={e => setTempValue(e.target.value)}
                          onBlur={handleCellSave}
                          onKeyDown={e =>
                            handleCellKeyDown(e, student.id, 'remarks')
                          }
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Add remarks..."
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => handleCellClick(student.id, 'remarks')}
                          className={`px-2 py-1 rounded cursor-pointer hover:bg-gray-100 min-h-[28px] ${
                            selectedCell?.studentId === student.id &&
                            selectedCell?.field === 'remarks'
                              ? 'ring-2 ring-blue-500'
                              : ''
                          } ${isPublished ? 'cursor-not-allowed' : ''}`}
                        >
                          {remarks || ''}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-gray-50 border-t text-sm text-gray-600">
        <div className="flex flex-wrap gap-4">
          <span>• Click on cells to edit marks or remarks</span>
          <span>• Use "AB" for absent students</span>
          <span>
            • Press Enter to move to next row, Tab to move to next column
          </span>
          <span>• Press Escape to cancel editing</span>
        </div>
      </div>
    </div>
  )
}

const AnalyticsWidgets = ({ examSchedule, marks, students }) => {
  const calculateAnalytics = () => {
    const validMarks = marks.filter(
      m =>
        m.marksObtained !== 'AB' &&
        m.marksObtained !== '' &&
        m.marksObtained !== null,
    )
    const absentCount = marks.filter(m => m.marksObtained === 'AB').length

    if (validMarks.length === 0) {
      return {
        totalStudents: students.length,
        appeared: 0,
        absent: absentCount,
        passed: 0,
        failed: 0,
        passPercentage: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        toppers: [],
        gradeDistribution: {},
      }
    }

    const marksArray = validMarks.map(m => parseFloat(m.marksObtained))
    const passed = validMarks.filter(
      m => parseFloat(m.marksObtained) >= examSchedule.passMarks,
    ).length
    const failed = validMarks.length - passed

    const average = Array.isArray(marksArray)
      ? marksArray.reduce((sum, mark) => sum + mark, 0) / marksArray.length
      : 0
    const highest = Math.max(...marksArray)
    const lowest = Math.min(...marksArray)

    // Get top 3 students
    const toppers = validMarks
      .map(m => ({
        ...students.find(s => s.id === m.studentId),
        marks: parseFloat(m.marksObtained),
      }))
      .sort((a, b) => b.marks - a.marks)
      .slice(0, 3)

    // Grade distribution
    const gradeDistribution = Array.isArray(validMarks)
      ? validMarks.reduce((acc, m) => {
          const percentage =
            (parseFloat(m.marksObtained) / examSchedule.maxMarks) * 100
          let grade
          if (percentage >= 91) grade = 'A+'
          else if (percentage >= 81) grade = 'A'
          else if (percentage >= 71) grade = 'B+'
          else if (percentage >= 61) grade = 'B'
          else if (percentage >= 51) grade = 'C+'
          else if (percentage >= 41) grade = 'C'
          else if (percentage >= 33) grade = 'D'
          else grade = 'E'

          acc[grade] = (acc[grade] || 0) + 1
          return acc
        }, {})
      : {}

    return {
      totalStudents: students.length,
      appeared: validMarks.length,
      absent: absentCount,
      passed,
      failed,
      passPercentage:
        validMarks.length > 0 ? (passed / validMarks.length) * 100 : 0,
      average: Math.round(average * 100) / 100,
      highest,
      lowest,
      toppers,
      gradeDistribution,
    }
  }

  const analytics = calculateAnalytics()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Statistics Cards */}
      <div className="space-y-4">
        <h3 className="font-medium">Performance Statistics</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{analytics.appeared}</div>
            <div className="text-sm text-gray-600">Appeared</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow text-center">
            <XCircle className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <div className="text-2xl font-bold">{analytics.absent}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{analytics.passed}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow text-center">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">{analytics.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(analytics.passPercentage)}%
            </div>
            <div className="text-sm text-gray-600">Pass Percentage</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Average:</span>
            <span className="font-medium">{analytics.average}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Highest:</span>
            <span className="font-medium text-green-600">
              {analytics.highest}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Lowest:</span>
            <span className="font-medium text-red-600">{analytics.lowest}</span>
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="space-y-4">
        <h3 className="font-medium">Grade Distribution</h3>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="space-y-3">
            {Array.isArray(Object.entries(analytics.gradeDistribution)) &&
              Object.entries(analytics.gradeDistribution).map(
                ([grade, count]) => {
                  const percentage =
                    analytics.appeared > 0
                      ? (count / analytics.appeared) * 100
                      : 0
                  const getGradeColor = grade => {
                    switch (grade) {
                      case 'A+':
                      case 'A':
                        return 'bg-green-500'
                      case 'B+':
                      case 'B':
                        return 'bg-blue-500'
                      case 'C+':
                      case 'C':
                        return 'bg-yellow-500'
                      case 'D':
                      case 'E':
                        return 'bg-red-500'
                      default:
                        return 'bg-gray-500'
                    }
                  }

                  return (
                    <div key={grade} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Grade {grade}</span>
                        <span>
                          {count} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getGradeColor(grade)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                },
              )}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="space-y-4">
        <h3 className="font-medium">Top Performers</h3>
        <div className="bg-white p-4 rounded-lg shadow">
          {analytics.toppers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No results available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(analytics.toppers) &&
                analytics.toppers.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                            ? 'bg-gray-400'
                            : 'bg-orange-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">
                        Roll: {student.rollNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{student.marks}</div>
                      <div className="text-sm text-gray-500">
                        {Math.round(
                          (student.marks / examSchedule.maxMarks) * 100,
                        )}
                        %
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CSVImportDialog = ({ open, onClose, onImport, examSchedule }) => {
  const [csvData, setCsvData] = useState('')
  const [previewData, setPreviewData] = useState([])
  const [errors, setErrors] = useState([])
  const fileInputRef = useRef(null)

  const handleFileUpload = event => {
    const file = event.target.files[0]
    if (file && file.type === 'text/csv') {
      const reader = new FileReader()
      reader.onload = e => {
        const csv = e.target.result
        setCsvData(csv)
        parseCSV(csv)
      }
      reader.readAsText(file)
    }
  }

  const parseCSV = csv => {
    const lines = csv.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      setErrors(['CSV file must have at least a header row and one data row'])
      return
    }

    const headers = lines[0].split(',').map(h => h.trim())
    const expectedHeaders = ['rollNumber', 'marksObtained', 'remarks']

    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      setErrors([`Missing required headers: ${missingHeaders.join(', ')}`])
      return
    }

    const data = []
    const validationErrors = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row = {}

      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      // Validate marks
      const marks = row.marksObtained
      if (marks !== 'AB' && marks !== '') {
        const numMarks = parseFloat(marks)
        if (isNaN(numMarks)) {
          validationErrors.push(`Row ${i + 1}: Invalid marks "${marks}"`)
        } else if (numMarks < 0 || numMarks > examSchedule.maxMarks) {
          validationErrors.push(
            `Row ${i + 1}: Marks must be between 0 and ${examSchedule.maxMarks}`,
          )
        }
      }

      data.push(row)
    }

    setPreviewData(data)
    setErrors(validationErrors)
  }

  const handleImport = () => {
    if (errors.length === 0 && previewData.length > 0) {
      onImport(previewData)
      onClose()
    }
  }

  const sampleCSV = `rollNumber,marksObtained,remarks
001,85,Good performance
002,AB,Absent due to illness
003,72,Needs improvement in calculation`

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Import Marks from CSV"
      size="xl"
    >
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">CSV Format Requirements</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Your CSV file must include these columns: rollNumber,
              marksObtained, remarks
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border">
              {sampleCSV}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Upload CSV File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">
              Validation Errors:
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Array.isArray(errors) &&
                errors.map((error, index) => <li key={index}>• {error}</li>)}
            </ul>
          </div>
        )}

        {previewData.length > 0 && errors.length === 0 && (
          <div>
            <h4 className="font-medium mb-2">
              Preview ({previewData.length} records)
            </h4>
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3">Roll Number</th>
                    <th className="text-left py-2 px-3">Marks</th>
                    <th className="text-left py-2 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2 px-3">{row.rollNumber}</td>
                      <td className="py-2 px-3">{row.marksObtained}</td>
                      <td className="py-2 px-3">{row.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 10 && (
                <div className="text-center py-2 text-gray-500 text-sm">
                  ... and {previewData.length - 10} more records
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={errors.length > 0 || previewData.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Import Marks
          </button>
        </div>
      </div>
    </Dialog>
  )
}
const ParentalViewPreview = ({
  examSchedule,
  studentMarks,
  student,
  open,
  onClose,
}) => {
  if (!student || !studentMarks) return null

  const calculateGrade = (marksObtained, maxMarks) => {
    if (marksObtained === 'AB') return 'AB'
    if (!marksObtained) return ''

    const percentage = (marksObtained / maxMarks) * 100

    if (percentage >= 91) return 'A+'
    if (percentage >= 81) return 'A'
    if (percentage >= 71) return 'B+'
    if (percentage >= 61) return 'B'
    if (percentage >= 51) return 'C+'
    if (percentage >= 41) return 'C'
    if (percentage >= 33) return 'D'
    return 'E'
  }

  const grade = calculateGrade(
    studentMarks.marksObtained,
    examSchedule.maxMarks,
  )
  const percentage =
    studentMarks.marksObtained !== 'AB' && studentMarks.marksObtained
      ? Math.round((studentMarks.marksObtained / examSchedule.maxMarks) * 100)
      : 0
  const isPass =
    studentMarks.marksObtained !== 'AB' &&
    studentMarks.marksObtained >= examSchedule.passMarks

  return (
    <Dialog open={open} onClose={onClose} title="Parent View Preview" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-bold">SCHOOL EXAMINATION RESULT</h2>
          <p className="text-gray-600">Academic Year 2024-25</p>
        </div>

        {/* Student Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Student Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Student Name:</span>
              <div className="font-medium">{student.name}</div>
            </div>
            <div>
              <span className="text-gray-600">Roll Number:</span>
              <div className="font-medium">{student.rollNumber}</div>
            </div>
            <div>
              <span className="text-gray-600">Class:</span>
              <div className="font-medium">
                {examSchedule.className} - {examSchedule.section}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Father's Name:</span>
              <div className="font-medium">{student.fatherName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Exam Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Examination Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Exam:</span>
              <div className="font-medium">{examSchedule.examGroupName}</div>
            </div>
            <div>
              <span className="text-gray-600">Subject:</span>
              <div className="font-medium">{examSchedule.subjectName}</div>
            </div>
            <div>
              <span className="text-gray-600">Exam Date:</span>
              <div className="font-medium">
                {new Date(examSchedule.examDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Max Marks:</span>
              <div className="font-medium">{examSchedule.maxMarks}</div>
            </div>
          </div>
        </div>

        {/* Result Summary */}
        <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 text-center">RESULT SUMMARY</h3>

          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {studentMarks.marksObtained === 'AB'
                  ? 'AB'
                  : studentMarks.marksObtained || '-'}
              </div>
              <div className="text-sm text-gray-600">Marks Obtained</div>
            </div>

            <div className="text-center">
              <div
                className={`text-3xl font-bold mb-2 ${
                  grade === 'A+' || grade === 'A'
                    ? 'text-green-600'
                    : grade === 'B+' || grade === 'B'
                      ? 'text-blue-600'
                      : grade === 'C+' || grade === 'C'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                }`}
              >
                {grade || '-'}
              </div>
              <div className="text-sm text-gray-600">Grade</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-medium">{percentage}%</div>
                <div className="text-gray-600">Percentage</div>
              </div>
              <div>
                <div className="font-medium">{examSchedule.passMarks}</div>
                <div className="text-gray-600">Pass Marks</div>
              </div>
              <div>
                <div
                  className={`font-medium ${isPass ? 'text-green-600' : 'text-red-600'}`}
                >
                  {studentMarks.marksObtained === 'AB'
                    ? 'ABSENT'
                    : isPass
                      ? 'PASS'
                      : 'FAIL'}
                </div>
                <div className="text-gray-600">Result</div>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        {studentMarks.remarks && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Teacher's Remarks</h3>
            <p className="text-sm">{studentMarks.remarks}</p>
          </div>
        )}

        {/* Grade Scale */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Grading Scale</h3>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center p-2 bg-green-100 rounded">
              <div className="font-medium">A+ (91-100)</div>
              <div className="text-gray-600">Outstanding</div>
            </div>
            <div className="text-center p-2 bg-green-100 rounded">
              <div className="font-medium">A (81-90)</div>
              <div className="text-gray-600">Excellent</div>
            </div>
            <div className="text-center p-2 bg-blue-100 rounded">
              <div className="font-medium">B+ (71-80)</div>
              <div className="text-gray-600">Very Good</div>
            </div>
            <div className="text-center p-2 bg-blue-100 rounded">
              <div className="font-medium">B (61-70)</div>
              <div className="text-gray-600">Good</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs mt-2">
            <div className="text-center p-2 bg-yellow-100 rounded">
              <div className="font-medium">C+ (51-60)</div>
              <div className="text-gray-600">Satisfactory</div>
            </div>
            <div className="text-center p-2 bg-yellow-100 rounded">
              <div className="font-medium">C (41-50)</div>
              <div className="text-gray-600">Acceptable</div>
            </div>
            <div className="text-center p-2 bg-red-100 rounded">
              <div className="font-medium">D (33-40)</div>
              <div className="text-gray-600">Needs Improvement</div>
            </div>
            <div className="text-center p-2 bg-red-100 rounded">
              <div className="font-medium">E (0-32)</div>
              <div className="text-gray-600">Unsatisfactory</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>
            This is a computer-generated result. For any queries, please contact
            the school.
          </p>
          <p className="mt-1">
            Generated on: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close Preview
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const ExamResult = () => {
  const [selectedExamSchedule, setSelectedExamSchedule] = useState(null)
  const [marks, setMarks] = useState([])
  const [students, setStudents] = useState([])
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [showParentPreview, setShowParentPreview] = useState(false)
  const [previewStudent, setPreviewStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterExamGroup, setFilterExamGroup] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const queryClient = useQueryClient()

  const { data: examSchedulesData, isLoading } = useQuery({
    queryKey: ['exam-schedules', 'for-results'],
    queryFn: () => examApi.getExamSchedulesForResults(),
  })

  const { data: examGroupsData } = useQuery({
    queryKey: ['exam-groups', 'active'],
    queryFn: () => examApi.getActiveExamGroups(),
  })

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'by-schedule', selectedExamSchedule?.id],
    queryFn: () => examApi.getStudentsBySchedule(selectedExamSchedule.id),
    enabled: !!selectedExamSchedule,
  })

  const { data: marksData } = useQuery({
    queryKey: ['marks', selectedExamSchedule?.id],
    queryFn: () => examApi.getMarksBySchedule(selectedExamSchedule.id),
    enabled: !!selectedExamSchedule,
  })

  const saveMarksMutation = useMutation({
    mutationFn: ({ scheduleId, marks }) => examApi.saveMarks(scheduleId, marks),
    onSuccess: () => {
      queryClient.invalidateQueries(['marks'])
    },
  })

  const publishResultsMutation = useMutation({
    mutationFn: examApi.publishResults,
    onSuccess: () => {
      queryClient.invalidateQueries(['exam-schedules'])
    },
  })

  const importMarksMutation = useMutation({
    mutationFn: ({ scheduleId, csvData }) =>
      examApi.importMarks(scheduleId, csvData),
    onSuccess: () => {
      queryClient.invalidateQueries(['marks'])
    },
  })

  React.useEffect(() => {
    if (studentsData?.data) {
      setStudents(studentsData.data)
    }
  }, [studentsData])

  React.useEffect(() => {
    if (marksData?.data) {
      setMarks(marksData.data)
    } else if (students.length > 0) {
      // Initialize empty marks for all students
      const initialMarks = students.map(student => ({
        studentId: student.id,
        marksObtained: '',
        remarks: '',
      }))
      setMarks(initialMarks)
    }
  }, [marksData, students])

  const handleScheduleSelect = schedule => {
    setSelectedExamSchedule(schedule)
    setMarks([])
  }

  const handleMarksChange = (studentId, field, value) => {
    setMarks(prev => {
      const updated = prev.map(mark =>
        mark.studentId === studentId ? { ...mark, [field]: value } : mark
      )

      // If student not found, add new record
      if (!prev.find(mark => mark.studentId === studentId)) {
        updated.push({
          studentId,
          marksObtained: '',
          remarks: '',
          [field]: value,
        })
      }

      return updated
    })
  }

  const handleSaveMarks = () => {
    if (selectedExamSchedule) {
      saveMarksMutation.mutate({
        scheduleId: selectedExamSchedule.id,
        marks,
      })
    }
  }

  const handlePublishResults = () => {
    if (
      selectedExamSchedule &&
      confirm(
        'Are you sure you want to publish these results? This action cannot be undone.',
      )
    ) {
      publishResultsMutation.mutate(selectedExamSchedule.id)
    }
  }

  const handleCSVImport = csvData => {
    if (selectedExamSchedule) {
      importMarksMutation.mutate({
        scheduleId: selectedExamSchedule.id,
        csvData,
      })
    }
  }

  const handleParentPreview = student => {
    setPreviewStudent(student)
    setShowParentPreview(true)
  }

  const handleExportResults = () => {
    if (selectedExamSchedule) {
      // Export functionality
      console.log('Exporting results for:', selectedExamSchedule.id)
    }
  }

  const filteredSchedules =
    examSchedulesData?.data?.filter(schedule => {
      const matchesSearch =
        schedule.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.examGroupName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        schedule.className.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesExamGroup =
        filterExamGroup === 'all' || schedule.examGroupId === filterExamGroup
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'published' && schedule.isPublished) ||
        (filterStatus === 'unpublished' && !schedule.isPublished)

      return matchesSearch && matchesExamGroup && matchesStatus
    }) || []

  const getPreviewStudentMarks = () => {
    if (!previewStudent) return null
    return marks.find(m => m.studentId === previewStudent.id)
  }

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exam Results</h1>
        <div className="flex gap-2">
          {selectedExamSchedule && (
            <>
              <button
                onClick={() => setShowCSVImport(true)}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <button
                onClick={handleExportResults}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              {!selectedExamSchedule.isPublished && (
                <button
                  onClick={handlePublishResults}
                  disabled={publishResultsMutation.isPending}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {selectedExamSchedule.isPublished ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {publishResultsMutation.isPending
                    ? 'Publishing...'
                    : 'Publish Results'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Exam Schedule Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Select Exam Schedule</h2>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
            </div>
            <select
              value={filterExamGroup}
              onChange={e => setFilterExamGroup(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Exam Groups</option>
              {examGroupsData?.data?.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(filteredSchedules) &&
            filteredSchedules.map(schedule => (
              <div
                key={schedule.id}
                onClick={() => handleScheduleSelect(schedule)}
                className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                  selectedExamSchedule?.id === schedule.id
                    ? 'border-blue-500 bg-blue-50'
                    : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{schedule.subjectName}</h3>
                  {schedule.isPublished && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      Published
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {schedule.examGroupName}
                </p>
                <p className="text-sm text-gray-600">
                  {schedule.className} - {schedule.section}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(schedule.examDate).toLocaleDateString()}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Marks Entry and Analytics */}
      {selectedExamSchedule && students.length > 0 && (
        <div className="space-y-6">
          {/* Analytics Widgets */}
          <AnalyticsWidgets
            examSchedule={selectedExamSchedule}
            marks={marks}
            students={students}
          />

          {/* Marks Entry Grid */}
          <MarksEntryGrid
            examSchedule={selectedExamSchedule}
            students={students}
            marks={marks}
            onMarksChange={handleMarksChange}
            onSave={handleSaveMarks}
            isPublished={selectedExamSchedule.isPublished}
          />

          {/* Parent Preview Actions */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-3">Parent View Preview</h3>
            <div className="flex flex-wrap gap-2">
              {students.slice(0, 5).map(student => (
                <button
                  key={student.id}
                  onClick={() => handleParentPreview(student)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Preview: {student.name}
                </button>
              ))}
              {students.length > 5 && (
                <span className="px-3 py-2 text-gray-500 text-sm">
                  +{students.length - 5} more students
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Dialog */}
      <CSVImportDialog
        open={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImport={handleCSVImport}
        examSchedule={selectedExamSchedule}
      />

      {/* Parent View Preview Dialog */}
      <ParentalViewPreview
        examSchedule={selectedExamSchedule}
        studentMarks={getPreviewStudentMarks()}
        student={previewStudent}
        open={showParentPreview}
        onClose={() => setShowParentPreview(false)}
      />
    </div>
  )
}

export default ExamResult
