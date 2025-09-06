import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  DollarSign,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Eye,
  Percent,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { feesApi } from '../../lib/api/fees'

const KPICard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color = 'blue',
}) => {
  const getColorClasses = color => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      red: 'text-red-600 bg-red-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      purple: 'text-purple-600 bg-purple-100',
    }
    return colors[color] || colors.blue
  }

  const getChangeColor = changeType => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div
              className={`flex items-center gap-1 text-sm ${getChangeColor(changeType)}`}
            >
              {changeType === 'positive' ? (
                <TrendingUp className="w-4 h-4" />
              ) : changeType === 'negative' ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${getColorClasses(color)}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

const CollectionChart = ({ data, period }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Collection Trends</h3>
        <div className="text-sm text-gray-500">
          {period === 'daily' ? 'Last 30 Days' : 'Last 12 Months'}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip
            formatter={value => [`₹${value.toLocaleString()}`, 'Amount']}
            labelFormatter={label => `Period: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

const PaymentModeChart = ({ data }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-6">Payment Mode Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {Array.isArray(data) &&
              data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
          </Pie>
          <Tooltip
            formatter={value => [`₹${value.toLocaleString()}`, 'Amount']}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

const DuesAgingChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-6">Dues Aging Analysis</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ageGroup" />
          <YAxis />
          <Tooltip
            formatter={value => [`₹${value.toLocaleString()}`, 'Amount']}
          />
          <Bar dataKey="amount" fill="#EF4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const ConcessionAnalyticsChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-6">Concession Analytics</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="concessionType" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [
              name === 'students' ? value : `₹${value.toLocaleString()}`,
              name === 'students' ? 'Students' : 'Amount',
            ]}
          />
          <Bar dataKey="amount" fill="#10B981" name="amount" />
          <Bar dataKey="students" fill="#3B82F6" name="students" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const ReportFilters = ({ filters, onFiltersChange }) => {
  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => feesApi.getClasses(),
  })

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Report Filters</h3>
        <button
          onClick={() =>
            onFiltersChange({
              dateFrom: '',
              dateTo: '',
              classId: '',
              reportType: 'collection',
              period: 'daily',
            })
          }
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Report Type</label>
          <select
            value={filters.reportType}
            onChange={e =>
              onFiltersChange({ ...filters, reportType: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="collection">Collection Report</option>
            <option value="dues">Dues Report</option>
            <option value="concessions">Concessions Report</option>
            <option value="payment_modes">Payment Modes</option>
            <option value="aging">Aging Analysis</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Period</label>
          <select
            value={filters.period}
            onChange={e =>
              onFiltersChange({ ...filters, period: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <Input
          label="From Date"
          type="date"
          value={filters.dateFrom}
          onChange={e =>
            onFiltersChange({ ...filters, dateFrom: e.target.value })
          }
        />

        <Input
          label="To Date"
          type="date"
          value={filters.dateTo}
          onChange={e =>
            onFiltersChange({ ...filters, dateTo: e.target.value })
          }
        />

        <div>
          <label className="block text-sm font-medium mb-1">Class</label>
          <select
            value={filters.classId}
            onChange={e =>
              onFiltersChange({ ...filters, classId: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">All Classes</option>
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
  )
}

const DetailedReportDialog = ({ reportType, filters, open, onClose }) => {
  const { data: detailedData, isLoading } = useQuery({
    queryKey: ['detailed-report', reportType, filters],
    queryFn: () => feesApi.getDetailedReport(reportType, filters),
    enabled: open,
  })

  const handleExport = async format => {
    try {
      const exportData = detailedData?.data || []
      let content, filename, mimeType

      if (format === 'csv') {
        content = generateCSVContent(exportData, reportType)
        filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
      } else if (format === 'pdf') {
        content = generatePDFContent(exportData, reportType)
        filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`
        mimeType = 'application/pdf'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Error exporting report. Please try again.')
    }
  }

  const generateCSVContent = (data, reportType) => {
    if (reportType === 'collection') {
      const headers = [
        'Date',
        'Student Name',
        'Class',
        'Amount',
        'Payment Mode',
        'Receipt No',
      ]
      const rows = data.map(item => [
        new Date(item.date).toLocaleDateString(),
        item.studentName,
        item.className,
        item.amount,
        item.paymentMode,
        item.receiptNumber,
      ])
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
    // Add other report type CSV generation logic here
    return ''
  }

  const generatePDFContent = (data, reportType) => {
    // PDF generation logic would go here
    return ''
  }

  if (!open) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Detailed ${reportType} Report`}
      size="xl"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Report Details</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {reportType === 'collection' && (
                    <>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Date
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Student
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Class
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right">
                        Amount
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Mode
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Receipt
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {detailedData?.data?.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {reportType === 'collection' && (
                      <>
                        <td className="border border-gray-300 px-4 py-2">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {item.studentName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {item.className}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          ₹{item.amount.toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 capitalize">
                          {item.paymentMode.replace('_', ' ')}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {item.receiptNumber}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const FeesReports = () => {
  const [filters, setFilters] = useState({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    classId: '',
    reportType: 'collection',
    period: 'daily',
  })
  const [showDetailedReport, setShowDetailedReport] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('')

  const {
    data: dashboardData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['fees-dashboard', filters],
    queryFn: () => feesApi.getFeesDashboard(filters),
  })

  const handleViewDetailedReport = reportType => {
    setSelectedReportType(reportType)
    setShowDetailedReport(true)
  }

  const handleExportDashboard = async () => {
    try {
      const exportData = {
        filters,
        kpis: dashboardData?.kpis,
        summary: dashboardData?.summary,
        generatedAt: new Date().toISOString(),
      }

      const content = JSON.stringify(exportData, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fees-dashboard-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Error exporting dashboard. Please try again.')
    }
  }

  if (isLoading) return <LoadingSkeleton />

  const kpis = dashboardData?.kpis || {}
  const charts = dashboardData?.charts || {}

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fees Reports Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExportDashboard}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Dashboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters filters={filters} onFiltersChange={setFilters} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Collection"
          value={`₹${kpis.totalCollection?.toLocaleString() || 0}`}
          change={kpis.collectionChange}
          changeType={kpis.collectionChangeType}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Outstanding Dues"
          value={`₹${kpis.outstandingDues?.toLocaleString() || 0}`}
          change={kpis.duesChange}
          changeType={kpis.duesChangeType}
          icon={AlertTriangle}
          color="red"
        />
        <KPICard
          title="Students Paid"
          value={kpis.studentsPaid || 0}
          change={kpis.studentsChange}
          changeType={kpis.studentsChangeType}
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Collection Rate"
          value={`${kpis.collectionRate || 0}%`}
          change={kpis.rateChange}
          changeType={kpis.rateChangeType}
          icon={Percent}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CollectionChart
          data={charts.collectionTrends || []}
          period={filters.period}
        />
        <PaymentModeChart data={charts.paymentModes || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DuesAgingChart data={charts.duesAging || []} />
        <ConcessionAnalyticsChart data={charts.concessionAnalytics || []} />
      </div>

      {/* Quick Reports */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleViewDetailedReport('collection')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-medium">Daily Collection</span>
            </div>
            <p className="text-sm text-gray-600">
              Detailed collection report with payment breakdowns
            </p>
          </button>

          <button
            onClick={() => handleViewDetailedReport('dues')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-red-600" />
              <span className="font-medium">Outstanding Dues</span>
            </div>
            <p className="text-sm text-gray-600">
              Students with pending fee payments
            </p>
          </button>

          <button
            onClick={() => handleViewDetailedReport('concessions')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Percent className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Concessions Report</span>
            </div>
            <p className="text-sm text-gray-600">
              Discount and concession analytics
            </p>
          </button>

          <button
            onClick={() => handleViewDetailedReport('aging')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Aging Analysis</span>
            </div>
            <p className="text-sm text-gray-600">
              Age-wise breakdown of outstanding dues
            </p>
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              ₹{dashboardData?.summary?.totalCollected?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">
              Total Collected This Period
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              ₹{dashboardData?.summary?.totalOutstanding?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">Total Outstanding</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {dashboardData?.summary?.collectionEfficiency || 0}%
            </div>
            <div className="text-sm text-gray-600">Collection Efficiency</div>
          </div>
        </div>
      </div>

      {/* Detailed Report Dialog */}
      <DetailedReportDialog
        reportType={selectedReportType}
        filters={filters}
        open={showDetailedReport}
        onClose={() => setShowDetailedReport(false)}
      />
    </div>
  )
}

export default FeesReports
