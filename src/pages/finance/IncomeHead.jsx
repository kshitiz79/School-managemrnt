import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '../../lib/api/finance'
import Button from '../../components/Button'

const IncomeHead = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [editingId, setEditingId] = useState(null)

  const queryClient = useQueryClient()

  const { data: incomeHeads = [], isLoading } = useQuery({
    queryKey: ['incomeHeads'],
    queryFn: financeApi.getIncomeHeads,
  })

  const addMutation = useMutation({
    mutationFn: financeApi.addIncomeHead,
    onSuccess: () => {
      queryClient.invalidateQueries(['incomeHeads'])
      setFormData({ name: '', description: '' })
      alert('Income head added successfully!')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => financeApi.updateIncomeHead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['incomeHeads'])
      setFormData({ name: '', description: '' })
      setEditingId(null)
      alert('Income head updated successfully!')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: financeApi.deleteIncomeHead,
    onSuccess: () => {
      queryClient.invalidateQueries(['incomeHeads'])
      alert('Income head deleted successfully!')
    },
  })

  const handleSubmit = e => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      addMutation.mutate(formData)
    }
  }

  const handleEdit = head => {
    setFormData({ name: head.name, description: head.description || '' })
    setEditingId(head.id)
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this income head?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '' })
    setEditingId(null)
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Income Heads Management</h2>

        {/* Add/Edit Form */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Income Head' : 'Add New Income Head'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Income Head
              </Button>
              {editingId && (
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Income Heads List */}
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(incomeHeads) &&
                  incomeHeads.map(head => (
                    <tr key={head.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        {head.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {head.description || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => handleEdit(head)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(head.id)}
                            disabled={deleteMutation.isPending}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {incomeHeads.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No income heads found. Add one to get started.
          </div>
        )}
      </div>
    </div>
  )
}

export default IncomeHead
