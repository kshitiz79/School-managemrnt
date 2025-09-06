import React, { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Printer,
  Download,
  Eye,
  Filter,
  Search,
  CheckSquare,
  Square,
  FileText,
  Users,
  Settings,
  BarChart3,
  Award,
  Percent,
  Hash,
  RefreshCw,
  Table as TableIcon,
} from 'lucide-react'
import { examApi } from '../../lib/api/exams'
import { printToPDF } from '../../lib/print'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import Input from '../../components/ui/Input'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'

const MarksheetPreview = ({ student, template, examResults, watermark }) => {
  const calculateGrade = percentage => {
    if (percentage >= 91) return 'A+'
    if (percentage >= 81) return 'A'
    if (percentage >= 71) return 'B+'
    if (percentage >= 61) return 'B'
    if (percentage >= 51) return 'C+'
    if (percentage >= 41) return 'C'
    if (percentage >= 33) return 'D'
    return 'E'
  }

  const calculateTotals = () => {
    const totalMax = examResults.reduce(
      (sum, result) => sum + result.maxMarks,
      0
    )
    const totalObtained = examResults.reduce(
      (sum, result) =>
        result.marksObtained === 'AB'
          ? sum
          : sum + parseFloat(result.marksObtained || 0),
      0
    )
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
    const grade = calculateGrade(percentage)
    const isPassed = examResults.every(
      result =>
        result.marksObtained !== 'AB' &&
        parseFloat(result.marksObtained || 0) >= result.passMarks
    )

    return { totalMax, totalObtained, percentage, grade, isPassed }
  }

  const totals = calculateTotals()

  const renderField = field => {
    const style = {
      position: 'absolute',
      left: `${field.x}px`,
      top: `${field.y}px`,
      width: `${field.width}px`,
      height: `${field.height}px`,
      fontSize: `${field.fontSize || 14}px`,
      fontWeight: field.fontWeight || 'normal',
      textAlign: field.textAlign || 'left',
      color: template.theme.textColor,
      zIndex: field.zIndex || 1,
    }

    switch (field.type) {
      case 'student_info':
        return (
          <div
            key={field.id}
            style={style}
            className="p-2 bg-gray-50 border border-gray-300"
          >
            <div className="text-sm space-y-1">
              <div>
                <strong>Name:</strong> {student.name}
              </div>
              <div>
                <strong>Roll No:</strong> {student.rollNumber}
              </div>
              <div>
                <strong>Class:</strong> {student.className} - {student.section}
              </div>
              <div>
                <strong>Father:</strong> {student.fatherName || 'N/A'}
              </div>
            </div>
          </div>
        )

      case 'marks_table':
        return (
          <div key={field.id} style={style} className="border border-gray-300">
            <div
              className="p-2 text-sm font-medium border-b"
              style={{ backgroundColor: template.theme.tableHeaderBg }}
            >
              Subject-wise Marks
            </div>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: template.theme.tableHeaderBg }}>
                <tr>
                  <th className="text-left p-2 border-r">Subject</th>
                  <th className="text-center p-2 border-r">Max Marks</th>
                  <th className="text-center p-2 border-r">Obtained</th>
                  <th className="text-center p-2 border-r">Grade</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(examResults) &&
                  examResults.map((result, index) => {
                    const percentage =
                      result.marksObtained !== 'AB'
                        ? (parseFloat(result.marksObtained || 0) /
                            result.maxMarks) *
                          100
                        : 0
                    const grade =
                      result.marksObtained === 'AB'
                        ? 'AB'
                        : calculateGrade(percentage)
                    const isPassed =
                      result.marksObtained !== 'AB' &&
                      parseFloat(result.marksObtained || 0) >= result.passMarks

                    return (
                      <tr key={index} className="border-b">
                        <td className="p-2 border-r">{result.subjectName}</td>
                        <td className="p-2 border-r text-center">
                          {result.maxMarks}
                        </td>
                        <td className="p-2 border-r text-center">
                          {result.marksObtained}
                        </td>
                        <td className="p-2 border-r text-center font-medium">
                          {grade}
                        </td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              result.marksObtained === 'AB'
                                ? 'bg-gray-100 text-gray-700'
                                : isPassed
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {result.marksObtained === 'AB'
                              ? 'Absent'
                              : isPassed
                                ? 'Pass'
                                : 'Fail'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                <tr className="border-t-2 font-bold">
                  <td className="p-2 border-r">TOTAL</td>
                  <td className="p-2 border-r text-center">
                    {totals.totalMax}
                  </td>
                  <td className="p-2 border-r text-center">
                    {totals.totalObtained}
                  </td>
                  <td className="p-2 border-r text-center">{totals.grade}</td>
                  <td className="p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        totals.isPassed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {totals.isPassed ? 'Pass' : 'Fail'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )

      case 'grade_summary':
        return (
          <div
            key={field.id}
            style={style}
            className="p-3 bg-blue-50 border border-blue-300"
          >
            <div className="text-sm font-medium mb-2">Grade Summary</div>
            <div className="text-sm space-y-1">
              <div>
                Total: {totals.totalObtained}/{totals.totalMax}
              </div>
              <div>Percentage: {Math.round(totals.percentage)}%</div>
              <div>
                Overall Grade: <strong>{totals.grade}</strong>
              </div>
            </div>
          </div>
        )

      case 'result_status':
        return (
          <div
            key={field.id}
            style={style}
            className={`p-3 border flex items-center justify-center ${
              totals.isPassed
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="text-center">
              <div
                className={`text-lg font-bold ${
                  totals.isPassed ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {totals.isPassed ? 'PASS' : 'FAIL'}
              </div>
              <div className="text-sm text-gray-600">
                {totals.isPassed ? 'Promoted' : 'Not Promoted'}
              </div>
            </div>
          </div>
        )

      case 'percentage':
        return (
          <div
            key={field.id}
            style={style}
            className="p-3 bg-yellow-50 border border-yellow-300 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(totals.percentage)}%
              </div>
              <div className="text-sm text-gray-600">Percentage</div>
            </div>
          </div>
        )

      case 'rank':
        return (
          <div
            key={field.id}
            style={style}
            className="p-3 bg-purple-50 border border-purple-300 flex items-center justify-center"
          >
            <div className="text-center">
              <Award className="w-6 h-6 mx-auto mb-1" />
              <div className="font-bold">Rank: {student.rank || 'N/A'}</div>
            </div>
          </div>
        )

      case 'signature':
        return (
          <div
            key={field.id}
            style={style}
            className="border-b-2 border-gray-400"
          >
            <div className="w-full h-full flex items-end justify-center pb-1">
              <span className="text-xs text-gray-600">{field.label}</span>
            </div>
          </div>
        )

      case 'logo':
        return (
          <div
            key={field.id}
            style={style}
            className="flex items-center justify-center"
          >
            <div className="w-full h-full bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">LOGO</span>
            </div>
          </div>
        )

      case 'watermark':
        return (
          <div
            key={field.id}
            style={{
              ...style,
              opacity: 0.1,
              transform: 'rotate(-45deg)',
              pointerEvents: 'none',
            }}
            className="flex items-center justify-center"
          >
            <span className="text-4xl font-bold text-gray-500">
              {watermark || 'MARKSHEET'}
            </span>
          </div>
        )

      default: // text fields
        const getFieldValue = () => {
          switch (field.id) {
            case 'school-name':
              return 'GREENWOOD HIGH SCHOOL'
            case 'marksheet-title':
              return 'MARK SHEET'
            default:
              return field.label
          }
        }

        return (
          <div key={field.id} style={style} className="flex items-center">
            {getFieldValue()}
          </div>
        )
    }
  }

  return (
    <div
      className="relative bg-white border shadow-sm mx-auto"
      style={{
        width: '595px',
        height: '842px',
        backgroundColor: template.theme.backgroundColor,
      }}
    >
      {/* Header Background */}
      <div
        className="absolute top-0 left-0 right-0 h-24"
        style={{ backgroundColor: template.theme.headerBg }}
      />

      {/* Render all fields */}
      {Array.isArray(template.fields) && template.fields.map(renderField)}

      {/* Border */}
      <div
        className="absolute inset-4 border-2 rounded"
        style={{ borderColor: template.theme.borderColor }}
      />
    </div>
  )
}

const StudentSelectionTable = ({
  students,
  selectedStudents,
  onSelectionChange,
  examSchedule,
}) => {
  const toggleStudent = studentId => {
    const newSelection = selectedStudents.includes(studentId)
      ? selectedStudents.filter(id => id !== studentId)
      : [...selectedStudents, studentId]
    onSelectionChange(newSelection)
  }

  const toggleAll = () => {
    const allSelected = selectedStudents.length === students.length
    onSelectionChange(allSelected ? [] : students.map(s => s.id))
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Select Students</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedStudents.length} of {students.length} selected
            </span>
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedStudents.length === students.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Select All
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left py-3 px-4 w-12">
                <input
                  type="checkbox"
                  checked={
                    selectedStudents.length === students.length &&
                    students.length > 0
                  }
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="text-left py-3 px-4">Roll No</th>
              <th className="text-left py-3 px-4">Student Name</th>
              <th className="text-left py-3 px-4">Class</th>
              <th className="text-left py-3 px-4">Results Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(students) &&
              students.map(student => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {student.rollNumber}
                  </td>
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4">
                    {student.className} - {student.section}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      Results Available
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const PrintMarksheet = () => {
  const [selectedExamGroup, setSelectedExamGroup] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [showPreview, setShowPreview] = useState(false)
  const [previewStudent, setPreviewStudent] = useState(null)
  const [watermarkText, setWatermarkText] = useState('MARKSHEET')
  const [printSettings, setPrintSettings] = useState({
    sheetsPerPage: 1,
    includeWatermark: true,
    printQuality: 'high',
    includeGrades: true,
  })
  const [isPrinting, setIsPrinting] = useState(false)

  const { data: examGroupsData, isLoading: loadingGroups } = useQuery({
    queryKey: ['exam-groups', 'completed'],
    queryFn: () => examApi.getExamGroups(),
  })

  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['students', 'with-results', selectedExamGroup?.id],
    queryFn: () => examApi.getStudentsBySchedule(selectedExamGroup?.id),
    enabled: !!selectedExamGroup,
  })

  const { data: templatesData } = useQuery({
    queryKey: ['marksheet-templates'],
    queryFn: () => {
      // Load from localStorage for demo
      const saved = localStorage.getItem('marksheetTemplates')
      return Promise.resolve({
        success: true,
        data: saved ? JSON.parse(saved) : [],
      })
    },
  })

  // Mock exam results data
  const generateMockResults = studentId => {
    const subjects = [
      'Mathematics',
      'English',
      'Science',
      'Social Studies',
      'Hindi',
    ]
    return subjects.map(subject => ({
      subjectName: subject,
      maxMarks: 100,
      passMarks: 35,
      marksObtained:
        Math.random() < 0.1 ? 'AB' : Math.floor(Math.random() * 40) + 50, // 10% absent, rest 50-90
    }))
  }

  const filteredStudents =
    studentsData?.data?.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClass =
        filterClass === 'all' || student.className === filterClass
      return matchesSearch && matchesClass
    }) || []

  const handlePrintSelected = async () => {
    if (!selectedTemplate || selectedStudents.length === 0) {
      alert('Please select a template and students to print')
      return
    }

    setIsPrinting(true)

    try {
      const studentsToPrint = filteredStudents.filter(s =>
        selectedStudents.includes(s.id)
      )

      // Generate HTML for all selected marksheets
      const marksheetsHTML = studentsToPrint
        .map(student => {
          const examResults = generateMockResults(student.id)

          return `
          <div class="marksheet-page" style="
            width: 595px; 
            height: 842px; 
            position: relative; 
            background: ${selectedTemplate.theme.backgroundColor};
            page-break-after: always;
            margin: 0 auto;
          ">
            ${
              Array.isArray(selectedTemplate.fields) &&
              selectedTemplate.fields
                .map(field => {
                  const style = `
                position: absolute;
                left: ${field.x}px;
                top: ${field.y}px;
                width: ${field.width}px;
                height: ${field.height}px;
                font-size: ${field.fontSize || 14}px;
                font-weight: ${field.fontWeight || 'normal'};
                text-align: ${field.textAlign || 'left'};
                color: ${selectedTemplate.theme.textColor};
              `

                  if (field.type === 'student_info') {
                    return `<div style="${style} padding: 8px; background: #f9fafb; border: 1px solid #d1d5db;">
                  <div style="font-size: 14px;">
                    <div><strong>Name:</strong> ${student.name}</div>
                    <div><strong>Roll No:</strong> ${student.rollNumber}</div>
                    <div><strong>Class:</strong> ${student.className} - ${student.section}</div>
                    <div><strong>Father:</strong> ${student.fatherName || 'N/A'}</div>
                  </div>
                </div>`
                  } else if (field.type === 'marks_table') {
                    const totalMax = examResults.reduce(
                      (sum, r) => sum + r.maxMarks,
                      0
                    )
                    const totalObtained = examResults.reduce(
                      (sum, r) =>
                        r.marksObtained === 'AB'
                          ? sum
                          : sum + parseFloat(r.marksObtained),
                      0
                    )
                    const percentage = (totalObtained / totalMax) * 100

                    return `<div style="${style} border: 1px solid #d1d5db;">
                  <div style="padding: 8px; background: ${selectedTemplate.theme.tableHeaderBg}; border-bottom: 1px solid #d1d5db; font-weight: bold;">
                    Subject-wise Marks
                  </div>
                  <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                    <thead style="background: ${selectedTemplate.theme.tableHeaderBg};">
                      <tr>
                        <th style="text-align: left; padding: 4px; border-right: 1px solid #d1d5db;">Subject</th>
                        <th style="text-align: center; padding: 4px; border-right: 1px solid #d1d5db;">Max</th>
                        <th style="text-align: center; padding: 4px; border-right: 1px solid #d1d5db;">Obtained</th>
                        <th style="text-align: center; padding: 4px; border-right: 1px solid #d1d5db;">Grade</th>
                        <th style="text-align: center; padding: 4px;">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${
                        Array.isArray(examResults) &&
                        examResults
                          .map(result => {
                            const perc =
                              result.marksObtained !== 'AB'
                                ? (result.marksObtained / result.maxMarks) * 100
                                : 0
                            const grade =
                              result.marksObtained === 'AB'
                                ? 'AB'
                                : perc >= 91
                                  ? 'A+'
                                  : perc >= 81
                                    ? 'A'
                                    : perc >= 71
                                      ? 'B+'
                                      : perc >= 61
                                        ? 'B'
                                        : perc >= 51
                                          ? 'C+'
                                          : perc >= 41
                                            ? 'C'
                                            : perc >= 33
                                              ? 'D'
                                              : 'E'
                            const isPassed =
                              result.marksObtained !== 'AB' &&
                              result.marksObtained >= result.passMarks

                            return `<tr style="border-bottom: 1px solid #e5e7eb;">
                          <td style="padding: 4px; border-right: 1px solid #d1d5db;">${result.subjectName}</td>
                          <td style="padding: 4px; border-right: 1px solid #d1d5db; text-align: center;">${result.maxMarks}</td>
                          <td style="padding: 4px; border-right: 1px solid #d1d5db; text-align: center;">${result.marksObtained}</td>
                          <td style="padding: 4px; border-right: 1px solid #d1d5db; text-align: center; font-weight: bold;">${grade}</td>
                          <td style="padding: 4px; text-align: center;">
                            <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; ${
                              result.marksObtained === 'AB'
                                ? 'background: #f3f4f6; color: #374151;'
                                : isPassed
                                  ? 'background: #dcfce7; color: #166534;'
                                  : 'background: #fecaca; color: #991b1b;'
                            }">
                              ${result.marksObtained === 'AB' ? 'Absent' : isPassed ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                        </tr>`
                          })
                          .join('')
                      }
                      <tr style="border-top: 2px solid #374151; font-weight: bold;">
                        <td style="padding: 4px; border-right: 1px solid #d1d5db;">TOTAL</td>
                        <td style="padding: 4px; border-right: 1px solid #d1d5db; text-align: center;">${totalMax}</td>
                        <td style="padding: 4px; border-right: 1px solid #d1d5db; text-align: center;">${totalObtained}</td>
                        <td style="padding: 4px; border-right: 1px solid #d1d5db; text-align: center;">${
                          percentage >= 91
                            ? 'A+'
                            : percentage >= 81
                              ? 'A'
                              : percentage >= 71
                                ? 'B+'
                                : percentage >= 61
                                  ? 'B'
                                  : percentage >= 51
                                    ? 'C+'
                                    : percentage >= 41
                                      ? 'C'
                                      : percentage >= 33
                                        ? 'D'
                                        : 'E'
                        }</td>
                        <td style="padding: 4px; text-align: center;">
                          <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; ${
                            percentage >= 33
                              ? 'background: #dcfce7; color: #166534;'
                              : 'background: #fecaca; color: #991b1b;'
                          }">
                            ${percentage >= 33 ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>`
                  } else if (field.type === 'grade_summary') {
                    const totalMax = examResults.reduce(
                      (sum, r) => sum + r.maxMarks,
                      0
                    )
                    const totalObtained = examResults.reduce(
                      (sum, r) =>
                        r.marksObtained === 'AB'
                          ? sum
                          : sum + parseFloat(r.marksObtained),
                      0
                    )
                    const percentage = Math.round(
                      (totalObtained / totalMax) * 100
                    )
                    const grade =
                      percentage >= 91
                        ? 'A+'
                        : percentage >= 81
                          ? 'A'
                          : percentage >= 71
                            ? 'B+'
                            : percentage >= 61
                              ? 'B'
                              : percentage >= 51
                                ? 'C+'
                                : percentage >= 41
                                  ? 'C'
                                  : percentage >= 33
                                    ? 'D'
                                    : 'E'

                    return `<div style="${style} padding: 12px; background: #dbeafe; border: 1px solid #3b82f6;">
                  <div style="font-weight: bold; margin-bottom: 8px;">Grade Summary</div>
                  <div style="font-size: 14px;">
                    <div>Total: ${totalObtained}/${totalMax}</div>
                    <div>Percentage: ${percentage}%</div>
                    <div>Overall Grade: <strong>${grade}</strong></div>
                  </div>
                </div>`
                  } else if (field.type === 'result_status') {
                    const totalMax = examResults.reduce(
                      (sum, r) => sum + r.maxMarks,
                      0
                    )
                    const totalObtained = examResults.reduce(
                      (sum, r) =>
                        r.marksObtained === 'AB'
                          ? sum
                          : sum + parseFloat(r.marksObtained),
                      0
                    )
                    const percentage = (totalObtained / totalMax) * 100
                    const isPassed = percentage >= 33

                    return `<div style="${style} padding: 12px; border: 1px solid ${isPassed ? '#10b981' : '#ef4444'}; background: ${isPassed ? '#d1fae5' : '#fee2e2'}; display: flex; align-items: center; justify-content: center;">
                  <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: ${isPassed ? '#065f46' : '#991b1b'};">
                      ${isPassed ? 'PASS' : 'FAIL'}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">
                      ${isPassed ? 'Promoted' : 'Not Promoted'}
                    </div>
                  </div>
                </div>`
                  } else if (field.type === 'percentage') {
                    const totalMax = examResults.reduce(
                      (sum, r) => sum + r.maxMarks,
                      0
                    )
                    const totalObtained = examResults.reduce(
                      (sum, r) =>
                        r.marksObtained === 'AB'
                          ? sum
                          : sum + parseFloat(r.marksObtained),
                      0
                    )
                    const percentage = Math.round(
                      (totalObtained / totalMax) * 100
                    )

                    return `<div style="${style} padding: 12px; background: #fef3c7; border: 1px solid #f59e0b; display: flex; align-items: center; justify-content: center;">
                  <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: bold;">${percentage}%</div>
                    <div style="font-size: 12px; color: #6b7280;">Percentage</div>
                  </div>
                </div>`
                  } else if (field.type === 'signature') {
                    return `<div style="${style} border-bottom: 2px solid #9ca3af; display: flex; align-items: end; justify-content: center; padding-bottom: 4px;">
                  <span style="font-size: 10px; color: #6b7280;">${field.label}</span>
                </div>`
                  } else {
                    let content = field.label
                    if (field.id === 'school-name')
                      content = 'GREENWOOD HIGH SCHOOL'
                    if (field.id === 'marksheet-title') content = 'MARK SHEET'

                    return `<div style="${style}">${content}</div>`
                  }
                })
                .join('')
            }
            
            <!-- Border -->
            <div style="
              position: absolute;
              top: 16px;
              left: 16px;
              right: 16px;
              bottom: 16px;
              border: 2px solid ${selectedTemplate.theme.borderColor};
              border-radius: 4px;
            "></div>
            
            <!-- Header Background -->
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 96px;
              background: ${selectedTemplate.theme.headerBg};
            "></div>
            
            ${
              printSettings.includeWatermark
                ? `
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 48px;
                font-weight: bold;
                color: #6b7280;
                opacity: 0.1;
                pointer-events: none;
              ">
                ${watermarkText}
              </div>
            `
                : ''
            }
          </div>
        `
        })
        .join('')

      const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Marksheets</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .marksheet-page:last-child { page-break-after: avoid; }
            @media print {
              body { margin: 0; padding: 0; }
              .marksheet-page { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${marksheetsHTML}
        </body>
        </html>
      `

      await printToPDF(fullHTML, `marksheets-${selectedExamGroup.name}.pdf`)
    } catch (error) {
      console.error('Print error:', error)
      alert('Error generating marksheets. Please try again.')
    } finally {
      setIsPrinting(false)
    }
  }

  const handlePreviewStudent = student => {
    setPreviewStudent(student)
    setShowPreview(true)
  }

  const getUniqueClasses = () => {
    const classes = new Set()
    filteredStudents.forEach(student => classes.add(student.className))
    return Array.from(classes)
  }

  if (loadingGroups) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Print Marksheets</h1>
        <div className="flex gap-2">
          <button
            onClick={handlePrintSelected}
            disabled={
              !selectedTemplate || selectedStudents.length === 0 || isPrinting
            }
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isPrinting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            {isPrinting
              ? 'Generating...'
              : `Print Selected (${selectedStudents.length})`}
          </button>
        </div>
      </div>

      {/* Step 1: Select Exam Group */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Step 1: Select Exam Group</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examGroupsData?.data
            ?.filter(group => group.status === 'completed')
            .map(group => (
              <div
                key={group.id}
                onClick={() => setSelectedExamGroup(group)}
                className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                  selectedExamGroup?.id === group.id
                    ? 'border-blue-500 bg-blue-50'
                    : ''
                }`}
              >
                <h3 className="font-medium">{group.name}</h3>
                <p className="text-sm text-gray-600">{group.description}</p>
                <p className="text-sm text-gray-600">
                  Classes: {group.classNames?.join(', ')}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Status: {group.status}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Step 2: Select Template */}
      {selectedExamGroup && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">
            Step 2: Select Marksheet Template
          </h2>
          {templatesData?.data?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Templates Found
              </h3>
              <p className="text-gray-500 mb-4">
                Create a marksheet template first using the Design Marksheet
                feature.
              </p>
              <button className="text-blue-600 hover:text-blue-700">
                Go to Design Marksheet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesData?.data?.map(template => (
                <div
                  key={template.name}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                    selectedTemplate?.name === template.name
                      ? 'border-blue-500 bg-blue-50'
                      : ''
                  }`}
                >
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-600">
                    Theme: {template.theme.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Fields: {template.fields.length}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Select Students */}
      {selectedExamGroup && selectedTemplate && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">
              Step 3: Select Students
            </h2>

            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full"
                />
              </div>
              <select
                value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All Classes</option>
                {getUniqueClasses().map(className => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>

            {loadingStudents ? (
              <LoadingSkeleton />
            ) : (
              <StudentSelectionTable
                students={filteredStudents}
                selectedStudents={selectedStudents}
                onSelectionChange={setSelectedStudents}
                examSchedule={selectedExamGroup}
              />
            )}
          </div>

          {/* Print Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Print Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sheets Per Page
                </label>
                <select
                  value={printSettings.sheetsPerPage}
                  onChange={e =>
                    setPrintSettings(prev => ({
                      ...prev,
                      sheetsPerPage: parseInt(e.target.value),
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value={1}>1 Sheet per Page</option>
                  <option value={2}>2 Sheets per Page</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Print Quality
                </label>
                <select
                  value={printSettings.printQuality}
                  onChange={e =>
                    setPrintSettings(prev => ({
                      ...prev,
                      printQuality: e.target.value,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="normal">Normal</option>
                  <option value="high">High Quality</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={e => setWatermarkText(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter watermark text"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={printSettings.includeWatermark}
                  onChange={e =>
                    setPrintSettings(prev => ({
                      ...prev,
                      includeWatermark: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <span className="text-sm">Include watermark</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={printSettings.includeGrades}
                  onChange={e =>
                    setPrintSettings(prev => ({
                      ...prev,
                      includeGrades: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <span className="text-sm">Include grade columns</span>
              </label>
            </div>
          </div>

          {/* Preview Section */}
          {selectedStudents.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium mb-4">Preview Selected Students</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredStudents
                  .filter(s => selectedStudents.includes(s.id))
                  .slice(0, 12)
                  .map(student => (
                    <button
                      key={student.id}
                      onClick={() => handlePreviewStudent(student)}
                      className="p-3 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <div className="font-medium text-sm">{student.name}</div>
                      <div className="text-xs text-gray-500">
                        {student.rollNumber}
                      </div>
                    </button>
                  ))}
                {selectedStudents.length > 12 && (
                  <div className="p-3 border rounded-lg bg-gray-50 flex items-center justify-center">
                    <span className="text-sm text-gray-600">
                      +{selectedStudents.length - 12} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={`Marksheet Preview - ${previewStudent?.name}`}
        size="xl"
      >
        {previewStudent && selectedTemplate && (
          <div className="flex justify-center p-4">
            <div
              style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}
            >
              <MarksheetPreview
                student={previewStudent}
                template={selectedTemplate}
                examResults={generateMockResults(previewStudent.id)}
                watermark={
                  printSettings.includeWatermark ? watermarkText : null
                }
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

export default PrintMarksheet
