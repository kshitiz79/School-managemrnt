import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { financeApi } from '../../lib/api/finance'
import Button from '../../components/Button'
import { exportToCSV, exportToPDF } from '../../lib/export'

const SearchExpense = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    expenseHead: '',
    minAmount: '',
    maxAmount: '',
  })

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => financeApi.searchExpenses(filters),
  })

  const { data: expenseHeads = [] } = useQuery({
    queryKey: ['expenseHeads'],
    queryFn: financeApi.getExpenseHeads,
  })

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleExportCSV = () => {
    const exportData = Array.isArray(expenses)
      ? expenses.map(expense => ({
          Date: expense.date,
          'Expense Head': expense.expenseHeadName,
          Amount: expense.amount,
          'Invoice Number': expense.invoiceNumber || '',
          Description: expense.description || '',
        }))
      : []
    exportToCSV(exportData, 'expenses')
  }

  const handleExportPDF = () => {
    const columns = [
      'Date',
      'Expense Head',
      'Amount',
      'Invoice Number',
      'Description',
    ]
    const data = expenses.map(expense => [
      expense.date,
      expense.expenseHeadName,
      `$${expense.amount}`,
      expense.invoiceNumber || '',
      expense.description || '',
    ])
    exportToPDF(columns, data, 'Expenses Report')
  }

  const totalAmount = Array.isArray(expenses)
    ? expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
    : 0

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Search Expenses</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">From Date</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To Date</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Expense Head
            </label>
            <select
              name="expenseHead"
              value={filters.expenseHead}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Heads</option>
              {Array.isArray(expenseHeads) &&
                expenseHeads.map(head => (
                  <option key={head.id} value={head.id}>
                    {head.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Min Amount</label>
            <input
              type="number"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Amount</label>
            <input
              type="number"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
              step="0.01"
            />
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-4 mb-6">
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

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Total Records:</span>
              <span className="ml-2 font-semibold">{expenses.length}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="ml-2 font-semibold text-red-600">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Expense Head
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Amount
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Invoice No.
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Attachment
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(expenses) &&
                  expenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {expense.date}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {expense.expenseHeadName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        ${expense.amount}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {expense.invoiceNumber || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {expense.description || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {expense.attachment ? (
                          <a
                            href={expense.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {expenses.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No expenses found matching the criteria.
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchExpense
