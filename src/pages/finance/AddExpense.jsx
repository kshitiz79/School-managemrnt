import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '../../lib/api/finance'
import Button from '../../components/Button'

const AddExpense = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    expenseHead: '',
    amount: '',
    description: '',
    invoiceNumber: '',
    attachment: null,
  })

  const queryClient = useQueryClient()

  const { data: expenseHeads = [] } = useQuery({
    queryKey: ['expenseHeads'],
    queryFn: financeApi.getExpenseHeads,
  })

  const addExpenseMutation = useMutation({
    mutationFn: financeApi.addExpense,
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses'])
      setFormData({
        date: new Date().toISOString().split('T')[0],
        expenseHead: '',
        amount: '',
        description: '',
        invoiceNumber: '',
        attachment: null,
      })
      alert('Expense added successfully!')
    },
  })

  const handleSubmit = e => {
    e.preventDefault()
    const submitData = new FormData()
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        submitData.append(key, formData[key])
      }
    })
    addExpenseMutation.mutate(submitData)
  }

  const handleChange = e => {
    const { name, value, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }))
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Add Expense</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Expense Head *
              </label>
              <select
                name="expenseHead"
                value={formData.expenseHead}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Expense Head</option>
                {Array.isArray(expenseHeads) &&
                  expenseHeads.map(head => (
                    <option key={head.id} value={head.id}>
                      {head.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Attachment</label>
            <input
              type="file"
              name="attachment"
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={addExpenseMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              {addExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
            </Button>
            <Button
              type="button"
              onClick={() =>
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  expenseHead: '',
                  amount: '',
                  description: '',
                  invoiceNumber: '',
                  attachment: null,
                })
              }
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddExpense
