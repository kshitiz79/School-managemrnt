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
  QrCode,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react'
import { examApi } from '../../lib/api/exams'
import { printToPDF } from '../../lib/print'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import Input from '../../components/ui/Input'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'

const AdmitCardPreview = ({ student, template, examSchedule, watermark }) => {
  const generateQRData = (student, examSchedule) => {
    return JSON.stringify({
      studentId: student.id,
      rollNumber: student.rollNumber,
      examId: examSchedule.id,
      examDate: examSchedule.examDate,
      timestamp: Date.now(),
    })
  }

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
      case 'photo':
        return (
          <div
            key={field.id}
            style={style}
            className="border-2 border-gray-300"
          >
            {student.photo ? (
              <img
                src={student.photo}
                alt="Student"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        )

      case 'qr_code':
        return (
          <div
            key={field.id}
            style={style}
            className="flex items-center justify-center border border-gray-300"
          >
            <div className="w-full h-full bg-white flex items-center justify-center">
              <QrCode className="w-12 h-12 text-gray-700" />
              <div className="absolute inset-0 opacity-0">
                {generateQRData(student, examSchedule)}
              </div>
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
              {watermark || 'ADMIT CARD'}
            </span>
          </div>
        )

      default: // text fields
        const getFieldValue = () => {
          switch (field.id) {
            case 'student-name':
              return `Name: ${student.name}`
            case 'roll-number':
              return `Roll No: ${student.rollNumber}`
            case 'class-section':
              return `Class: ${student.className} - ${student.section}`
            case 'exam-name':
              return `Exam: ${examSchedule.examGroupName}`
            case 'school-name':
              return 'GREENWOOD HIGH SCHOOL'
            case 'admit-card-title':
              return 'ADMIT CARD'
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
              <th className="text-left py-3 px-4">Section</th>
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
                  <td className="py-3 px-4">{student.className}</td>
                  <td className="py-3 px-4">{student.section}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const PrintAdmitCard = () => {
  const [selectedExamSchedule, setSelectedExamSchedule] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [showPreview, setShowPreview] = useState(false)
  const [previewStudent, setPreviewStudent] = useState(null)
  const [watermarkText, setWatermarkText] = useState('ADMIT CARD')
  const [printSettings, setPrintSettings] = useState({
    cardsPerPage: 1,
    includeWatermark: true,
    printQuality: 'high',
  })
  const [isPrinting, setIsPrinting] = useState(false)

  const { data: examSchedulesData, isLoading: loadingSchedules } = useQuery({
    queryKey: ['exam-schedules', 'for-admit-cards'],
    queryFn: () => examApi.getExamSchedules(),
  })

  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['students', 'by-schedule', selectedExamSchedule?.id],
    queryFn: () => examApi.getStudentsBySchedule(selectedExamSchedule.id),
    enabled: !!selectedExamSchedule,
  })

  const { data: templatesData } = useQuery({
    queryKey: ['admit-card-templates'],
    queryFn: () => {
      // Load from localStorage for demo
      const saved = localStorage.getItem('admitCardTemplates')
      return Promise.resolve({
        success: true,
        data: saved ? JSON.parse(saved) : [],
      })
    },
  })

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
      const studentsToprint = filteredStudents.filter(s =>
        selectedStudents.includes(s.id),
      )

      // Generate HTML for all selected admit cards
      const admitCardsHTML = studentsToprint
        .map(student => {
          return `
          <div class="admit-card-page" style="
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

                  let content = ''
                  switch (field.id) {
                    case 'student-name':
                      content = `Name: ${student.name}`
                      break
                    case 'roll-number':
                      content = `Roll No: ${student.rollNumber}`
                      break
                    case 'class-section':
                      content = `Class: ${student.className} - ${student.section}`
                      break
                    case 'exam-name':
                      content = `Exam: ${selectedExamSchedule.examGroupName}`
                      break
                    case 'school-name':
                      content = 'GREENWOOD HIGH SCHOOL'
                      break
                    case 'admit-card-title':
                      content = 'ADMIT CARD'
                      break
                    default:
                      content = field.label
                  }

                  if (field.type === 'photo') {
                    return `<div style="${style} border: 2px solid #d1d5db;">
                  <div style="width: 100%; height: 100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #6b7280;">
                    PHOTO
                  </div>
                </div>`
                  } else if (field.type === 'qr_code') {
                    return `<div style="${style} border: 1px solid #d1d5db; display: flex; align-items: center; justify-content: center;">
                  <div style="font-size: 10px; color: #6b7280;">QR CODE</div>
                </div>`
                  } else if (field.type === 'signature') {
                    return `<div style="${style} border-bottom: 2px solid #9ca3af; display: flex; align-items: end; justify-content: center; padding-bottom: 4px;">
                  <span style="font-size: 10px; color: #6b7280;">${field.label}</span>
                </div>`
                  } else {
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
          <title>Admit Cards</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .admit-card-page:last-child { page-break-after: avoid; }
            @media print {
              body { margin: 0; padding: 0; }
              .admit-card-page { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${admitCardsHTML}
        </body>
        </html>
      `

      await printToPDF(
        fullHTML,
        `admit-cards-${selectedExamSchedule.examGroupName}.pdf`,
      )
    } catch (error) {
      console.error('Print error:', error)
      alert('Error generating admit cards. Please try again.')
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

  if (loadingSchedules) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Print Admit Cards</h1>
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

      {/* Step 1: Select Exam Schedule */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">
          Step 1: Select Exam Schedule
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examSchedulesData?.data?.map(schedule => (
            <div
              key={schedule.id}
              onClick={() => setSelectedExamSchedule(schedule)}
              className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                selectedExamSchedule?.id === schedule.id
                  ? 'border-blue-500 bg-blue-50'
                  : ''
              }`}
            >
              <h3 className="font-medium">{schedule.subjectName}</h3>
              <p className="text-sm text-gray-600">{schedule.examGroupName}</p>
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

      {/* Step 2: Select Template */}
      {selectedExamSchedule && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Step 2: Select Template</h2>
          {templatesData?.data?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Templates Found
              </h3>
              <p className="text-gray-500 mb-4">
                Create a template first using the Design Admit Card feature.
              </p>
              <button className="text-blue-600 hover:text-blue-700">
                Go to Design Admit Card
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
      {selectedExamSchedule && selectedTemplate && (
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
                examSchedule={selectedExamSchedule}
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
                  Cards Per Page
                </label>
                <select
                  value={printSettings.cardsPerPage}
                  onChange={e =>
                    setPrintSettings(prev => ({
                      ...prev,
                      cardsPerPage: parseInt(e.target.value),
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value={1}>1 Card per Page</option>
                  <option value={2}>2 Cards per Page</option>
                  <option value={4}>4 Cards per Page</option>
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

            <div className="mt-4">
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
        title={`Admit Card Preview - ${previewStudent?.name}`}
        size="xl"
      >
        {previewStudent && selectedTemplate && (
          <div className="flex justify-center p-4">
            <div
              style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}
            >
              <AdmitCardPreview
                student={previewStudent}
                template={selectedTemplate}
                examSchedule={selectedExamSchedule}
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

export default PrintAdmitCard
