import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { financeApi } from '../../lib/api/finance'
import Button from '../../components/Button'
import { exportToCSV, exportToPDF } from '../../lib/export'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const ProfitLoss = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  const { data: plData, isLoading } = useQuery({
    queryKey: ['profitLoss', dateRange],
    queryFn: () => financeApi.getProfitLossData(dateRange),
  })

  const handleDateChange = e => {
    const { name, value } = e.target
    setDateRange(prev => ({ ...prev, [name]: value }))
  }

  const handleExportCSV = () => {
    if (!plData) return

    const exportData = [
      { Category: 'Total Income', Amount: plData.totalIncome || 0 },
      { Category: 'Total Expenses', Amount: plData.totalExpenses || 0 },
      { Category: 'Net Profit/Loss', Amount: plData.netProfitLoss || 0 },
      ...(plData.incomeByHead || []).map(item => ({
        Category: `Income - ${item.name}`,
        Amount: item.amount || 0,
      })),
      ...(plData.expensesByHead || []).map(item => ({
        Category: `Expense - ${item.name}`,
        Amount: item.amount || 0,
      })),
    ]
    exportToCSV(exportData, 'profit-loss-report')
  }

  const handleExportPDF = () => {
    if (!plData) return

    const columns = ['Category', 'Amount']
    const data = [
      ['Total Income', `$${(plData.totalIncome || 0).toFixed(2)}`],
      ['Total Expenses', `$${(plData.totalExpenses || 0).toFixed(2)}`],
      ['Net Profit/Loss', `$${(plData.netProfitLoss || 0).toFixed(2)}`],
      ['', ''],
      ['INCOME BREAKDOWN', ''],
      ...(plData.incomeByHead || []).map(item => [
        item.name,
        `$${(item.amount || 0).toFixed(2)}`,
      ]),
      ['', ''],
      ['EXPENSE BREAKDOWN', ''],
      ...(plData.expensesByHead || []).map(item => [
        item.name,
        `$${(item.amount || 0).toFixed(2)}`,
      ]),
    ]
    exportToPDF(columns, data, 'Profit & Loss Report')
  }

  // Chart configurations
  const incomeChartData = {
    labels: plData?.incomeByHead
      ? plData.incomeByHead.map(item => item.name)
      : [],
    datasets: [
      {
        label: 'Income',
        data: plData?.incomeByHead
          ? plData.incomeByHead.map(item => item.amount)
          : [],
        backgroundColor: [
          '#10B981',
          '#059669',
          '#047857',
          '#065F46',
          '#064E3B',
          '#6EE7B7',
          '#34D399',
          '#10B981',
          '#059669',
          '#047857',
        ],
      },
    ],
  }

  const expenseChartData = {
    labels: plData?.expensesByHead
      ? plData.expensesByHead.map(item => item.name)
      : [],
    datasets: [
      {
        label: 'Expenses',
        data: plData?.expensesByHead
          ? plData.expensesByHead.map(item => item.amount)
          : [],
        backgroundColor: [
          '#EF4444',
          '#DC2626',
          '#B91C1C',
          '#991B1B',
          '#7F1D1D',
          '#FCA5A5',
          '#F87171',
          '#EF4444',
          '#DC2626',
          '#B91C1C',
        ],
      },
    ],
  }

  const comparisonChartData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount',
        data: [plData?.totalIncome || 0, plData?.totalExpenses || 0],
        backgroundColor: ['#10B981', '#EF4444'],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Financial Overview',
      },
    },
  }

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>
  }

  if (!plData) {
    return <div className="p-6 text-center text-red-600">Error loading data. Please try again.</div>
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Profit & Loss Statement</h2>

        {/* Date Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              onClick={handleExportCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Export CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Export PDF
            </Button>
          </div>
        </div>

        {plData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="text-lg font-semibold text-green-800">
                  Total Income
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  ${(plData.totalIncome || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                <h3 className="text-lg font-semibold text-red-800">
                  Total Expenses
                </h3>
                <p className="text-3xl font-bold text-red-600">
                  ${(plData.totalExpenses || 0).toFixed(2)}
                </p>
              </div>
              <div
                className={`p-6 rounded-lg border-l-4 ${(plData.netProfitLoss || 0) >= 0 ? 'bg-blue-50 border-blue-500' : 'bg-orange-50 border-orange-500'}`}
              >
                <h3
                  className={`text-lg font-semibold ${(plData.netProfitLoss || 0) >= 0 ? 'text-blue-800' : 'text-orange-800'}`}
                >
                  Net {(plData.netProfitLoss || 0) >= 0 ? 'Profit' : 'Loss'}
                </h3>
                <p
                  className={`text-3xl font-bold ${(plData.netProfitLoss || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}
                >
                  ${Math.abs(plData.netProfitLoss || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Income vs Expenses
                </h3>
                <Bar data={comparisonChartData} options={chartOptions} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Income by Head</h3>
                <Pie data={incomeChartData} options={chartOptions} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Expense by Head</h3>
                <Pie data={expenseChartData} options={chartOptions} />
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Income Breakdown */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-800">
                  Income Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Head
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(plData.incomeByHead || []).map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">
                            {item.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-green-600 font-semibold">
                            ${(item.amount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-green-100 font-bold">
                        <td className="border border-gray-300 px-4 py-2">
                          Total Income
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-green-700">
                          ${(plData.totalIncome || 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expense Breakdown */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-red-800">
                  Expense Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-red-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Head
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(plData.expensesByHead || []).map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">
                            {item.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-red-600 font-semibold">
                            ${(item.amount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-red-100 font-bold">
                        <td className="border border-gray-300 px-4 py-2">
                          Total Expenses
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-red-700">
                          ${(plData.totalExpenses || 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ProfitLoss
