import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRight,
  Users,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Download,
  Upload,
} from 'lucide-react'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import { Table } from '../../components/ui/Table'
import { promotionApi } from '../../lib/api/promotion'
import { classesApi } from '../../lib/api/classes'
import { sectionsApi } from '../../lib/api/sections'
import { studentsApi } from '../../lib/api/students'

const PromoteStudents = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [sourceClass, setSourceClass] = useState('')
  const [sourceSection, setSourceSection] = useState('')
  const [targetClass, setTargetClass] = useState('')
  const [targetSection, setTargetSection] = useState('')
  const [selectedStudents, setSelectedStudents] = useState([])
  const [promotionData, setPromotionData] = useState(null)
  const [promotionResult, setPromotionResult] = useState(null)

  const queryClient = useQueryClient()

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.getAll({ all: true }),
  })

  const { data: sourceSections } = useQuery({
    queryKey: ['sections', 'by-class', sourceClass],
    queryFn: () => sectionsApi.getByClass(sourceClass),
    enabled: !!sourceClass,
  })

  const { data: targetSections } = useQuery({
    queryKey: ['sections', 'by-class', targetClass],
    queryFn: () => sectionsApi.getByClass(targetClass),
    enabled: !!targetClass,
  })

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', 'by-section', sourceSection],
    queryFn: () => studentsApi.getBySection(sourceSection),
    enabled: !!sourceSection && currentStep >= 2,
  })

  const previewPromotionMutation = useMutation({
    mutationFn: promotionApi.preview,
    onSuccess: data => {
      setPromotionData(data)
      setCurrentStep(3)
    },
  })

  const executePromotionMutation = useMutation({
    mutationFn: promotionApi.execute,
    onSuccess: data => {
      setPromotionResult(data)
      setCurrentStep(4)
      queryClient.invalidateQueries(['students'])
    },
  })

  const rollbackPromotionMutation = useMutation({
    mutationFn: promotionApi.rollback,
    onSuccess: () => {
      queryClient.invalidateQueries(['students'])
      setCurrentStep(1)
      resetForm()
    },
  })

  const resetForm = () => {
    setSourceClass('')
    setSourceSection('')
    setTargetClass('')
    setTargetSection('')
    setSelectedStudents([])
    setPromotionData(null)
    setPromotionResult(null)
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!sourceClass || !sourceSection || !targetClass || !targetSection) {
        alert('Please select both source and target class/section')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (selectedStudents.length === 0) {
        alert('Please select at least one student to promote')
        return
      }

      previewPromotionMutation.mutate({
        sourceClassId: sourceClass,
        sourceSectionId: sourceSection,
        targetClassId: targetClass,
        targetSectionId: targetSection,
        studentIds: selectedStudents,
      })
    }
  }

  const handleExecutePromotion = () => {
    executePromotionMutation.mutate({
      sourceClassId: sourceClass,
      sourceSectionId: sourceSection,
      targetClassId: targetClass,
      targetSectionId: targetSection,
      studentIds: selectedStudents,
    })
  }

  const handleRollback = () => {
    if (
      window.confirm(
        'Are you sure you want to rollback this promotion? This action cannot be undone.',
      )
    ) {
      rollbackPromotionMutation.mutate(promotionResult.promotionId)
    }
  }

  const steps = [
    {
      number: 1,
      title: 'Select Classes',
      description: 'Choose source and target class/section',
    },
    {
      number: 2,
      title: 'Select Students',
      description: 'Choose students to promote',
    },
    { number: 3, title: 'Preview', description: 'Review promotion details' },
    { number: 4, title: 'Complete', description: 'Promotion completed' },
  ]

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.isArray(steps) &&
        steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}
            >
              {currentStep > step.number ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <div className="ml-3 text-sm">
              <div
                className={`font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'}`}
              >
                {step.title}
              </div>
              <div className="text-gray-500">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-5 h-5 text-gray-400 mx-6" />
            )}
          </div>
        ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">
        Select Source and Target Classes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Source Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">From (Source)</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Class</label>
            <select
              value={sourceClass}
              onChange={e => {
                setSourceClass(e.target.value)
                setSourceSection('')
              }}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Source Class</option>
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
              value={sourceSection}
              onChange={e => setSourceSection(e.target.value)}
              disabled={!sourceClass}
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
            >
              <option value="">Select Source Section</option>
              {sourceSections?.data?.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Target Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">To (Target)</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Class</label>
            <select
              value={targetClass}
              onChange={e => {
                setTargetClass(e.target.value)
                setTargetSection('')
              }}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Target Class</option>
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
              value={targetSection}
              onChange={e => setTargetSection(e.target.value)}
              disabled={!targetClass}
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
            >
              <option value="">Select Target Section</option>
              {targetSections?.data?.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name} (Capacity: {section.capacity || 'Unlimited'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleNext}
          disabled={
            !sourceClass || !sourceSection || !targetClass || !targetSection
          }
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          Next: Select Students
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => {
    if (studentsLoading) return <LoadingSkeleton />

    const columns = [
      {
        key: 'select',
        header: (
          <input
            type="checkbox"
            checked={selectedStudents.length === studentsData?.data?.length}
            onChange={e => {
              if (e.target.checked) {
                setSelectedStudents(
                  Array.isArray(studentsData?.data)
                    ? studentsData.data.map(s => s.id)
                    : [],
                )
              } else {
                setSelectedStudents([])
              }
            }}
          />
        ),
        render: student => (
          <input
            type="checkbox"
            checked={selectedStudents.includes(student.id)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedStudents([...selectedStudents, student.id])
              } else {
                setSelectedStudents(
                  selectedStudents.filter(id => id !== student.id),
                )
              }
            }}
          />
        ),
      },
      { key: 'rollNumber', header: 'Roll No.' },
      { key: 'name', header: 'Student Name' },
      { key: 'fatherName', header: 'Father Name' },
      {
        key: 'status',
        header: 'Status',
        render: student => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              student.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {student.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
    ]

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Select Students to Promote
            </h2>
            <div className="text-sm text-gray-500">
              {selectedStudents.length} of {studentsData?.data?.length || 0}{' '}
              students selected
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            From: {classesData?.data?.find(c => c.id === sourceClass)?.name} -{' '}
            {sourceSections?.data?.find(s => s.id === sourceSection)?.name}
            <br />
            To: {
              classesData?.data?.find(c => c.id === targetClass)?.name
            } - {targetSections?.data?.find(s => s.id === targetSection)?.name}
          </div>
        </div>

        {studentsData?.data?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No students found in the selected section</p>
          </div>
        ) : (
          <Table data={studentsData?.data || []} columns={columns} />
        )}

        <div className="p-6 border-t flex justify-between">
          <button
            onClick={() => setCurrentStep(1)}
            className="border px-6 py-2 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={
              selectedStudents.length === 0 ||
              previewPromotionMutation.isPending
            }
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {previewPromotionMutation.isPending
              ? 'Loading...'
              : 'Preview Promotion'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Promotion Preview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Source</h3>
            <p className="text-blue-700">
              {promotionData?.sourceClass} - {promotionData?.sourceSection}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {selectedStudents.length} students selected
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Target</h3>
            <p className="text-green-700">
              {promotionData?.targetClass} - {promotionData?.targetSection}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Available capacity:{' '}
              {promotionData?.availableCapacity || 'Unlimited'}
            </p>
          </div>
        </div>

        {promotionData?.warnings?.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
              <AlertTriangle className="w-5 h-5" />
              Warnings
            </div>
            <ul className="text-yellow-700 text-sm space-y-1">
              {Array.isArray(promotionData.warnings) &&
                promotionData.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
            </ul>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Summary</h3>
          <ul className="text-sm space-y-1">
            <li>• {selectedStudents.length} students will be promoted</li>
            <li>• Academic year: {promotionData?.academicYear}</li>
            <li>• Promotion date: {new Date().toLocaleDateString()}</li>
            <li>• This action can be rolled back within 24 hours</li>
          </ul>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentStep(2)}
            className="border px-6 py-2 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleExecutePromotion}
            disabled={executePromotionMutation.isPending}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {executePromotionMutation.isPending
              ? 'Processing...'
              : 'Execute Promotion'}
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-green-800">
          Promotion Completed Successfully!
        </h2>
        <p className="text-gray-600 mt-2">
          {promotionResult?.promotedCount} students have been promoted
          successfully
        </p>
      </div>

      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-green-800 mb-2">Promotion Details</h3>
        <div className="text-sm text-green-700 space-y-1">
          <p>Promotion ID: {promotionResult?.promotionId}</p>
          <p>
            Date: {new Date(promotionResult?.promotionDate).toLocaleString()}
          </p>
          <p>Students Promoted: {promotionResult?.promotedCount}</p>
          <p>
            From: {promotionResult?.sourceClass} -{' '}
            {promotionResult?.sourceSection}
          </p>
          <p>
            To: {promotionResult?.targetClass} -{' '}
            {promotionResult?.targetSection}
          </p>
        </div>
      </div>

      {promotionResult?.canRollback && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
            <AlertTriangle className="w-5 h-5" />
            Rollback Available
          </div>
          <p className="text-yellow-700 text-sm mb-3">
            You can rollback this promotion within 24 hours if needed.
          </p>
          <button
            onClick={handleRollback}
            disabled={rollbackPromotionMutation.isPending}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {rollbackPromotionMutation.isPending
              ? 'Rolling back...'
              : 'Rollback Promotion'}
          </button>
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setCurrentStep(1)
            resetForm()
          }}
          className="border px-6 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          Promote More Students
        </button>
        <button
          onClick={() => console.log('Download report')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Promote Students</h1>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Template
          </button>
        </div>
      </div>

      {renderStepIndicator()}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
    </div>
  )
}

export default PromoteStudents
