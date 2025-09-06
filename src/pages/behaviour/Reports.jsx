import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  Eye,
  User,
  School,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { behaviourApi } from '../../lib/api/behaviour'

const SeverityHeatmap = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No data available for heatmap</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(item => item.total))

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Severity Distribution by Class</h3>
      <div className="space-y-2">
        {Array.isArray(data) &&
          data.map((classData, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{classData.className}</span>
                <span className="text-gray-500">Total: {classData.total}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 h-8">
                <div
                  className="bg-green-500 rounded flex items-center justify-center text-white text-xs"
                  style={{
                    opacity: classData.low / maxValue || 0.1,
                    minHeight: '100%',
                  }}
                >
                  {classData.low}
                </div>
                <div
                  className="bg-yellow-500 rounded flex items-center justify-center text-white text-xs"
                  style={{
                    opacity: classData.medium / maxValue || 0.1,
                    minHeight: '100%',
                  }}
                >
                  {classData.medium}
                </div>
                <div
                  className="bg-orange-500 rounded flex items-center justify-center text-white text-xs"
                  style={{
                    opacity: classData.high / maxValue || 0.1,
                    minHeight: '100%',
                  }}
                >
                  {classData.high}
                </div>
                <div
                  className="bg-red-500 rounded flex items-center justify-center text-white text-xs"
                  style={{
                    opacity: classData.critical / maxValue || 0.1,
                    minHeight: '100%',
                  }}
                >
                  {classData.critical}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1 text-xs text-gray-500">
                <span className="text-center">Low</span>
                <span className="text-center">Medium</span>
                <span className="text-center">High</span>
                <span className="text-center">Critical</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

const TrendChart = ({ data, type = 'incidents' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No trend data available</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(item => item.value))

  return (
    <div className="space-y-4">
      <h3 className="font-medium">
        {type === 'incidents' ? 'Incident Trends' : 'Behavior Trends'} (Last 30
        Days)
      </h3>
      <div className="flex items-end justify-between h-40 gap-1">
        {Array.isArray(data) &&
          data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  minHeight: item.value > 0 ? '4px' : '0px',
                }}
                title={`${item.date}: ${item.value} incidents`}
              />
              <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                {new Date(item.date).toLocaleDateString('en', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

const StudentWiseReport = ({ data, onViewStudent }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No student data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Top Students by Incident Count</h3>
      <div className="space-y-2">
        {data.slice(0, 10).map((student, index) => (
          <div
            key={student.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">{student.name}</div>
                <div className="text-sm text-gray-500">
                  {student.className} - {student.section} | Roll:{' '}
                  {student.rollNumber}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-medium">{student.totalIncidents}</div>
                <div className="text-sm text-gray-500">incidents</div>
              </div>
              <div className="flex gap-1">
                <div
                  className="w-3 h-3 bg-green-500 rounded"
                  title={`Low: ${student.low}`}
                />
                <div
                  className="w-3 h-3 bg-yellow-500 rounded"
                  title={`Medium: ${student.medium}`}
                />
                <div
                  className="w-3 h-3 bg-orange-500 rounded"
                  title={`High: ${student.high}`}
                />
                <div
                  className="w-3 h-3 bg-red-500 rounded"
                  title={`Critical: ${student.critical}`}
                />
              </div>
              <button
                onClick={() => onViewStudent(student)}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const ClassWiseReport = ({ data, onViewClass }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <School className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No class data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Class-wise Incident Summary</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Class</th>
              <th className="text-center py-2">Total Students</th>
              <th className="text-center py-2">Total Incidents</th>
              <th className="text-center py-2">Low</th>
              <th className="text-center py-2">Medium</th>
              <th className="text-center py-2">High</th>
              <th className="text-center py-2">Critical</th>
              <th className="text-center py-2">Avg per Student</th>
              <th className="text-center py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) &&
              data.map((classData, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{classData.className}</td>
                  <td className="py-3 text-center">
                    {classData.totalStudents}
                  </td>
                  <td className="py-3 text-center font-medium">
                    {classData.totalIncidents}
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      {classData.low}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                      {classData.medium}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                      {classData.high}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                      {classData.critical}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    {(
                      classData.totalIncidents / classData.totalStudents
                    ).toFixed(1)}
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => onViewClass(classData)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const CategoryBreakdown = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No category data available</p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Incidents by Category</h3>
      <div className="space-y-3">
        {Array.isArray(data) &&
          data.map((category, index) => {
            const percentage = ((category.count / total) * 100).toFixed(1)
            return (
              <div key={category.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-gray-500">
                    {category.count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${colors[index % colors.length]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [reportType, setReportType] = useState('overview') // overview, student-wise, class-wise
  const [selectedClass, setSelectedClass] = useState('all')

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['behaviour', 'reports', dateRange, reportType, selectedClass],
    queryFn: () =>
      behaviourApi.getReports({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        type: reportType,
        classId: selectedClass,
      }),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => behaviourApi.getClasses(),
  })

  const handleViewStudent = student => {
    console.log('View student details:', student)
  }

  const handleViewClass = classData => {
    console.log('View class details:', classData)
  }

  const handleExport = format => {
    console.log('Export report in format:', format)
  }

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Behavior Reports</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={dateRange.startDate}
            onChange={e =>
              setDateRange(prev => ({ ...prev, startDate: e.target.value }))
            }
          />
          <Input
            label="End Date"
            type="date"
            value={dateRange.endDate}
            onChange={e =>
              setDateRange(prev => ({ ...prev, endDate: e.target.value }))
            }
          />
          <div>
            <label className="block text-sm font-medium mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="overview">Overview</option>
              <option value="student-wise">Student-wise</option>
              <option value="class-wise">Class-wise</option>
              <option value="category-wise">Category-wise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Class Filter
            </label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">All Classes</option>
              {Array.isArray(classesData?.data) &&
                classesData.data.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">
                {reportsData?.summary?.totalIncidents || 0}
              </p>
              <p className="text-sm text-gray-600">Total Incidents</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">
                {reportsData?.summary?.studentsInvolved || 0}
              </p>
              <p className="text-sm text-gray-600">Students Involved</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {reportsData?.summary?.avgPerStudent || 0}
              </p>
              <p className="text-sm text-gray-600">Avg per Student</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">
                {reportsData?.summary?.avgPerDay || 0}
              </p>
              <p className="text-sm text-gray-600">Avg per Day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {reportType === 'overview' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <TrendChart data={reportsData?.trends} />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <CategoryBreakdown data={reportsData?.categories} />
              </div>
            </>
          )}

          {reportType === 'student-wise' && (
            <div className="bg-white rounded-lg shadow p-6">
              <StudentWiseReport
                data={reportsData?.students}
                onViewStudent={handleViewStudent}
              />
            </div>
          )}

          {reportType === 'class-wise' && (
            <div className="bg-white rounded-lg shadow p-6">
              <ClassWiseReport
                data={reportsData?.classes}
                onViewClass={handleViewClass}
              />
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <SeverityHeatmap data={reportsData?.heatmap} />
          </div>

          {reportType === 'overview' && (
            <div className="bg-white rounded-lg shadow p-6">
              <StudentWiseReport
                data={reportsData?.topStudents}
                onViewStudent={handleViewStudent}
              />
            </div>
          )}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900">Most Common Category</h3>
            <p className="text-blue-700">
              {reportsData?.insights?.topCategory || 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-900">Peak Time</h3>
            <p className="text-yellow-700">
              {reportsData?.insights?.peakTime || 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900">Improvement Rate</h3>
            <p className="text-green-700">
              {reportsData?.insights?.improvementRate || 'N/A'}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
