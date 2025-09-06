import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { attendanceApi } from '../../lib/api/attendance'

const AttendanceChart = ({ data, type = 'bar' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No data available for chart</p>
      </div>
    )
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    return (
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {Array.isArray(data) &&
              data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const strokeDasharray = `${percentage} ${100 - percentage}`
                const strokeDashoffset = data
                  .slice(0, index)
                  .reduce((sum, prev) => sum + (prev.value / total) * 100, 0)

                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="15.915"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-strokeDashoffset}
                    className="transition-all duration-300"
                  />
                )
              })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>
        <div className="ml-6 space-y-2">
          {Array.isArray(data) &&
            data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={'w-3 h-3 rounded-full'}
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm">
                  {item.label}: {item.value}
                </span>
              </div>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Attendance Overview</h3>
        <div className="text-sm text-gray-500">
          Total:{' '}
          {data.reduce(
            (sum, item) => sum + item.present + item.absent + item.late,
            0,
          )}{' '}
          students
        </div>
      </div>
      <div className="space-y-2">
        {Array.isArray(data) &&
          data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>
                  {item.className} - {item.section}
                </span>
                <span>
                  {Math.round(
                    (item.present / (item.present + item.absent + item.late)) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="flex h-4 bg-gray-200 rounded overflow-hidden">
                <div
                  className="bg-green-500"
                  style={{
                    width: `${(item.present / (item.present + item.absent + item.late)) * 100}%`,
                  }}
                />
                <div
                  className="bg-red-500"
                  style={{
                    width: `${(item.absent / (item.present + item.absent + item.late)) * 100}%`,
                  }}
                />
                <div
                  className="bg-yellow-500"
                  style={{
                    width: `${(item.late / (item.present + item.absent + item.late)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Present: {item.present}</span>
                <span>Absent: {item.absent}</span>
                <span>Late: {item.late}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

const AttendanceSummaryCard = ({ title, value, total, icon: Icon, color }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{percentage}% of total</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  )
}

const ClassAttendanceTable = ({ data, onClassClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No attendance data available</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Class</th>
            <th className="text-left py-3 px-4">Section</th>
            <th className="text-center py-3 px-4">Total</th>
            <th className="text-center py-3 px-4">Present</th>
            <th className="text-center py-3 px-4">Absent</th>
            <th className="text-center py-3 px-4">Late</th>
            <th className="text-center py-3 px-4">Attendance %</th>
            <th className="text-center py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) &&
            data.map((classData, index) => {
              const total =
                classData.present + classData.absent + classData.late
              const percentage =
                total > 0 ? Math.round((classData.present / total) * 100) : 0

              return (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">
                    {classData.className}
                  </td>
                  <td className="py-3 px-4">{classData.section}</td>
                  <td className="py-3 px-4 text-center">{total}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      {classData.present}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <XCircle className="w-4 h-4" />
                      {classData.absent}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-yellow-600">
                      <Clock className="w-4 h-4" />
                      {classData.late}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-medium ${
                        percentage >= 90
                          ? 'text-green-600'
                          : percentage >= 75
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onClassClick(classData)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}

const AttendanceByDate = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [viewType, setViewType] = useState('summary') // summary, chart, table
  const [chartType, setChartType] = useState('bar')
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance', 'by-date', selectedDate],
    queryFn: () => attendanceApi.getByDate(selectedDate),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => attendanceApi.getClasses(),
  })

  const handleClassClick = classData => {
    // Navigate to detailed view or show modal
    console.log('View details for:', classData)
  }

  const getOverallStats = () => {
    if (!attendanceData?.data)
      return { total: 0, present: 0, absent: 0, late: 0 }

    return Array.isArray(attendanceData.data)
      ? attendanceData.data.reduce(
          (acc, classData) => ({
            total:
              acc.total + classData.present + classData.absent + classData.late,
            present: acc.present + classData.present,
            absent: acc.absent + classData.absent,
            late: acc.late + classData.late,
          }),
          { total: 0, present: 0, absent: 0, late: 0 },
        )
      : { total: 0, present: 0, absent: 0, late: 0 }
  }

  const getChartData = () => {
    if (!attendanceData?.data) return []

    if (chartType === 'pie') {
      const stats = getOverallStats()
      return [
        { label: 'Present', value: stats.present, color: '#10b981' },
        { label: 'Absent', value: stats.absent, color: '#ef4444' },
        { label: 'Late', value: stats.late, color: '#f59e0b' },
      ]
    }

    return attendanceData.data
  }

  const filteredData =
    attendanceData?.data?.filter(classData => {
      const matchesSearch =
        classData.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classData.section.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClass =
        classFilter === 'all' || classData.classId === classFilter

      return matchesSearch && matchesClass
    }) || []

  const stats = getOverallStats()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Attendance by Date</h1>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Compare Dates
          </button>
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Date Selection and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium mb-1">View Type</label>
            <select
              value={viewType}
              onChange={e => setViewType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="summary">Summary</option>
              <option value="chart">Chart View</option>
              <option value="table">Table View</option>
            </select>
          </div>
          {viewType === 'chart' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={e => setChartType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 mt-6" />
            <Input
              label="Search Classes"
              type="text"
              placeholder="Search by class or section..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter by Class
            </label>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
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
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AttendanceSummaryCard
          title="Total Students"
          value={stats.total}
          total={stats.total}
          icon={Users}
          color="text-blue-600"
        />
        <AttendanceSummaryCard
          title="Present"
          value={stats.present}
          total={stats.total}
          icon={CheckCircle}
          color="text-green-600"
        />
        <AttendanceSummaryCard
          title="Absent"
          value={stats.absent}
          total={stats.total}
          icon={XCircle}
          color="text-red-600"
        />
        <AttendanceSummaryCard
          title="Late"
          value={stats.late}
          total={stats.total}
          icon={Clock}
          color="text-yellow-600"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">
            Attendance for{' '}
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewType('summary')}
              className={`px-3 py-1 rounded text-sm ${
                viewType === 'summary'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setViewType('chart')}
              className={`px-3 py-1 rounded text-sm ${
                viewType === 'chart'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Chart
            </button>
            <button
              onClick={() => setViewType('table')}
              className={`px-3 py-1 rounded text-sm ${
                viewType === 'table'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {viewType === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttendanceChart data={filteredData} type="bar" />
            <AttendanceChart data={getChartData()} type="pie" />
          </div>
        )}

        {viewType === 'chart' && (
          <AttendanceChart data={getChartData()} type={chartType} />
        )}

        {viewType === 'table' && (
          <ClassAttendanceTable
            data={filteredData}
            onClassClick={handleClassClick}
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <Calendar className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium">Mark Today's Attendance</h4>
            <p className="text-sm text-gray-600">
              Quickly mark attendance for all classes
            </p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium">View Trends</h4>
            <p className="text-sm text-gray-600">
              Analyze attendance patterns over time
            </p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <Download className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-medium">Generate Report</h4>
            <p className="text-sm text-gray-600">
              Create detailed attendance reports
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttendanceByDate
