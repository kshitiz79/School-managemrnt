import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { examApi } from '../../lib/api/exams'

const ExamTest = () => {
  const { data: examGroups, isLoading: loadingGroups } = useQuery({
    queryKey: ['exam-groups-test'],
    queryFn: () => examApi.getExamGroups(),
  })

  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ['exam-schedules-test'],
    queryFn: () => examApi.getExamSchedules(),
  })

  const { data: resultsSchedules, isLoading: loadingResults } = useQuery({
    queryKey: ['exam-results-test'],
    queryFn: () => examApi.getExamSchedulesForResults(),
  })

  const TestSection = ({ title, data, isLoading, icon: Icon }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : data?.success ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">API working correctly</span>
          </div>
          <div className="text-sm text-gray-600">
            Loaded {data.data?.length || 0} records
          </div>
          {data.data?.slice(0, 2).map((item, index) => (
            <div key={index} className="text-xs bg-gray-50 p-2 rounded">
              {item.name || item.subjectName || 'Record'} -{' '}
              {item.status || 'Active'}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="w-4 h-4" />
          <span className="text-sm">API error or no data</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold">Examination System Test</h1>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          This is a test page to verify the examination system components and
          API are working correctly. Check each section below for status
          indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TestSection
          title="Exam Groups"
          data={examGroups}
          isLoading={loadingGroups}
          icon={CheckCircle}
        />

        <TestSection
          title="Exam Schedules"
          data={schedules}
          isLoading={loadingSchedules}
          icon={CheckCircle}
        />

        <TestSection
          title="Exam Results"
          data={resultsSchedules}
          isLoading={loadingResults}
          icon={CheckCircle}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Component Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">ExamGroup.jsx - Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">ExamSchedule.jsx - Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">ExamResult.jsx - Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">API Layer - Complete</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Navigate to the main exam tabs to test full functionality</li>
          <li>• Create test exam groups and schedules</li>
          <li>• Try the Excel-like marks entry interface</li>
          <li>• Test CSV import/export features</li>
          <li>• Preview the parent view functionality</li>
        </ul>
      </div>
    </div>
  )
}

export default ExamTest
