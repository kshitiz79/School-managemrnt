import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  Download,
  Filter,
  Calendar,
  Users,
  BookOpen,
  Award,
  Target,
  Eye,
  Settings,
  Printer,
  Mail,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { termReportsApi } from '../../lib/api/termReports'

const ReportCard = ({ report, onGenerate, onView, onDownload }) => {
  const getReportIcon = type => {
    switch (type) {
      case 'academic_performance':
        return BookOpen
      case 'attendance_summary':
        return Users
      case 'grade_distribution':
        return BarChart3
      case 'subject_analysis':
        return Target
      case 'student_progress':
        return TrendingUp
      case 'class_comparison':
        return Award
      default:
        return FileText
    }
  }

  const Icon = getReportIcon(report.type)

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{report.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{report.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Format: {report.formats.join(', ').toUpperCase()}</span>
              <span>•</span>
              <span>Frequency: {report.frequency}</span>
            </div>
            {report.lastGenerated && (
              <div className="text-sm text-gray-500">
                Last generated:{' '}
                {new Date(report.lastGenerated).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onGenerate(report)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Generate
            </button>
            {report.lastGenerated && (
              <>
                <button
                  onClick={() => onView(report)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => onDownload(report)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ReportGenerationDialog = ({ report, open, onClose, onGenerate }) => {
  const [formData, setFormData] = useState({
    termId: '',
    classIds: [],
    subjectIds: [],
    format: 'pdf',
    includeGraphs: true,
    includeComparisons: true,
    groupBy: 'class',
    dateRange: {
      startDate: '',
      endDate: '',
    },
  })

  const { data: termsData } = useQuery({
    queryKey: ['terms', 'active'],
    queryFn: () => termReportsApi.getActiveTerms(),
    enabled: open,
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => termReportsApi.getClasses(),
    enabled: open,
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: () => termReportsApi.getSubjects(),
    enabled: open,
  })

  const handleGenerate = () => {
    onGenerate(report.id, formData)
    onClose()
  }

  const toggleClass = classId => {
    setFormData(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId],
    }))
  }

  const toggleSubject = subjectId => {
    setFormData(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId],
    }))
  }

  if (!report) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Generate ${report.name}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Term *</label>
            <select
              value={formData.termId}
              onChange={e =>
                setFormData(prev => ({ ...prev, termId: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Term</option>
              {termsData?.data?.map(term => (
                <option key={term.id} value={term.id}>
                  {term.name} ({term.academicYear})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Format</label>
            <select
              value={formData.format}
              onChange={e =>
                setFormData(prev => ({ ...prev, format: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              {Array.isArray(report.formats) &&
                report.formats.map(format => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h3 className="font-medium mb-3">Date Range (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.dateRange.startDate}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, startDate: e.target.value },
                }))
              }
            />
            <Input
              label="End Date"
              type="date"
              value={formData.dateRange.endDate}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, endDate: e.target.value },
                }))
              }
            />
          </div>
        </div>

        {/* Classes Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Classes (Leave empty for all)
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
            {Array.isArray(classesData?.data) &&
              classesData.data.map(cls => (
                <label key={cls.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.classIds.includes(cls.id)}
                    onChange={() => toggleClass(cls.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{cls.name}</span>
                </label>
              ))}
          </div>
        </div>

        {/* Subjects Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Subjects (Leave empty for all)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {Array.isArray(subjectsData?.data) &&
              subjectsData.data.map(subject => (
                <label key={subject.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.subjectIds.includes(subject.id)}
                    onChange={() => toggleSubject(subject.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{subject.name}</span>
                </label>
              ))}
          </div>
        </div>

        {/* Report Options */}
        <div>
          <h3 className="font-medium mb-3">Report Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.includeGraphs}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    includeGraphs: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span className="text-sm">Include graphs and charts</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.includeComparisons}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    includeComparisons: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span className="text-sm">Include comparative analysis</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-1">Group By</label>
              <select
                value={formData.groupBy}
                onChange={e =>
                  setFormData(prev => ({ ...prev, groupBy: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 max-w-xs"
              >
                <option value="class">Class</option>
                <option value="subject">Subject</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!formData.termId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const QuickStatsCard = ({ title, value, change, icon: Icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{Math.abs(change)}% from last term</span>
            </div>
          )}
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  )
}

const RecentReportsTable = ({ reports, onView, onDownload }) => {
  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No recent reports available</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Report Name</th>
            <th className="text-left py-3 px-4">Type</th>
            <th className="text-left py-3 px-4">Generated</th>
            <th className="text-left py-3 px-4">Format</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-center py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(reports) &&
            reports.map((report, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{report.name}</td>
                <td className="py-3 px-4 capitalize">
                  {report.type.replace('_', ' ')}
                </td>
                <td className="py-3 px-4">
                  {new Date(report.generatedAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 uppercase">{report.format}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : report.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onView(report)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDownload(report)}
                      className="p-1 text-gray-400 hover:text-green-600"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null)
  const [showGenerationDialog, setShowGenerationDialog] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['term-reports', 'available'],
    queryFn: () => termReportsApi.getAvailableReports(),
  })

  const { data: quickStatsData } = useQuery({
    queryKey: ['term-reports', 'quick-stats'],
    queryFn: () => termReportsApi.getQuickStats(),
  })

  const { data: recentReportsData } = useQuery({
    queryKey: ['term-reports', 'recent'],
    queryFn: () => termReportsApi.getRecentReports(),
  })

  const handleGenerateReport = report => {
    setSelectedReport(report)
    setShowGenerationDialog(true)
  }

  const handleViewReport = report => {
    // Open report in new tab or modal
    window.open(`/reports/${report.id}`, '_blank')
  }

  const handleDownloadReport = report => {
    // Trigger download
    const link = document.createElement('a')
    link.href = report.downloadUrl
    link.download = report.filename
    link.click()
  }

  const handleConfirmGeneration = (reportId, options) => {
    // API call to generate report
    console.log('Generating report:', reportId, options)
  }

  const filteredReports =
    reportsData?.data?.filter(report => {
      if (filterCategory === 'all') return true
      return report.category === filterCategory
    }) || []

  const reportCategories = [
    { id: 'all', label: 'All Reports' },
    { id: 'academic', label: 'Academic Performance' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'behavioral', label: 'Behavioral' },
    { id: 'administrative', label: 'Administrative' },
  ]

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Term Reports</h1>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Report Settings
          </button>
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Reports
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickStatsCard
          title="Average Performance"
          value={quickStatsData?.data?.averagePerformance || '85.2%'}
          change={2.3}
          icon={TrendingUp}
          color="text-green-600"
        />
        <QuickStatsCard
          title="Attendance Rate"
          value={quickStatsData?.data?.attendanceRate || '92.8%'}
          change={-1.2}
          icon={Users}
          color="text-blue-600"
        />
        <QuickStatsCard
          title="Pass Rate"
          value={quickStatsData?.data?.passRate || '94.5%'}
          change={3.1}
          icon={Award}
          color="text-purple-600"
        />
        <QuickStatsCard
          title="Reports Generated"
          value={quickStatsData?.data?.reportsGenerated || '156'}
          change={12.5}
          icon={FileText}
          color="text-orange-600"
        />
      </div>

      {/* Report Categories Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {Array.isArray(reportCategories) &&
            reportCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setFilterCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
        </div>
      </div>

      {/* Available Reports */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.isArray(filteredReports) &&
            filteredReports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onGenerate={handleGenerateReport}
                onView={handleViewReport}
                onDownload={handleDownloadReport}
              />
            ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Reports</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
        </div>
        <div className="p-6">
          <RecentReportsTable
            reports={recentReportsData?.data}
            onView={handleViewReport}
            onDownload={handleDownloadReport}
          />
        </div>
      </div>

      {/* Report Generation Dialog */}
      <ReportGenerationDialog
        report={selectedReport}
        open={showGenerationDialog}
        onClose={() => setShowGenerationDialog(false)}
        onGenerate={handleConfirmGeneration}
      />
    </div>
  )
}

export default Reports
