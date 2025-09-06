import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
} from 'lucide-react'
import { Table } from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { Dropdown } from '../../components/ui/Dropdown'
import { classesApi } from '../../lib/api/classes'

const Classes = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    order: '',
    isActive: true,
  })
  const [errors, setErrors] = useState({})

  const queryClient = useQueryClient()

  const {
    data: classesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['classes', { page: currentPage, pageSize, search: searchTerm }],
    queryFn: () =>
      classesApi.getAll({ page: currentPage, pageSize, search: searchTerm }),
  })

  const createMutation = useMutation({
    mutationFn: classesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['classes'])
      setShowCreateDialog(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => classesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['classes'])
      setShowEditDialog(false)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: classesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['classes'])
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: classesApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(['classes'])
      setSelectedItems([])
    },
  })

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Class name is required'
    }

    if (!formData.code || formData.code.trim() === '') {
      newErrors.code = 'Class code is required'
    }

    if (formData.order && isNaN(Number(formData.order))) {
      newErrors.order = 'Order must be a number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validateForm()) return

    if (selectedClass) {
      updateMutation.mutate({ id: selectedClass.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = classItem => {
    setSelectedClass(classItem)
    setFormData({
      name: classItem.name,
      code: classItem.code,
      description: classItem.description || '',
      order: classItem.order?.toString() || '',
      isActive: classItem.isActive,
    })
    setShowEditDialog(true)
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.length} classes?`,
      )
    ) {
      bulkDeleteMutation.mutate(selectedItems)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      order: '',
      isActive: true,
    })
    setErrors({})
    setSelectedClass(null)
  }

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedItems.length === classesData?.data?.length}
          onChange={e => {
            if (e.target.checked) {
              setSelectedItems(
                Array.isArray(classesData?.data)
                  ? classesData.data.map(item => item.id)
                  : [],
              )
            } else {
              setSelectedItems([])
            }
          }}
        />
      ),
      render: item => (
        <input
          type="checkbox"
          checked={selectedItems.includes(item.id)}
          onChange={e => {
            if (e.target.checked) {
              setSelectedItems([...selectedItems, item.id])
            } else {
              setSelectedItems(selectedItems.filter(id => id !== item.id))
            }
          }}
        />
      ),
    },
    { key: 'code', header: 'Code', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'description', header: 'Description' },
    { key: 'order', header: 'Order', sortable: true },
    {
      key: 'isActive',
      header: 'Status',
      render: item => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            item.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: item => (
        <Dropdown
          trigger={<MoreHorizontal className="w-4 h-4" />}
          items={[
            {
              label: 'Edit',
              icon: Edit,
              onClick: () => handleEdit(item),
            },
            {
              label: 'View Sections',
              icon: Users,
              onClick: () => console.log('View sections for', item.id),
            },
            {
              label: 'Delete',
              icon: Trash2,
              onClick: () => handleDelete(item.id),
              className: 'text-red-600',
            },
          ]}
        />
      ),
    },
  ]

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState message="Failed to load classes" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Classes</h1>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Class
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
            </button>
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete Selected ({selectedItems.length})
              </button>
            )}
          </div>
        </div>

        {classesData?.data?.length === 0 ? (
          <EmptyState
            title="No classes found"
            description="Get started by creating your first class"
            action={{
              label: 'Add Class',
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <>
            <Table data={classesData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((classesData?.total || 0) / pageSize)}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false)
          resetForm()
        }}
        title="Add New Class"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Class Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="Class Code"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
            error={errors.code}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            multiline
            rows={3}
          />
          <Input
            label="Display Order"
            type="number"
            value={formData.order}
            onChange={e => setFormData({ ...formData, order: e.target.value })}
            error={errors.order}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={e =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
            <label htmlFor="isActive">Active</label>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Class'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateDialog(false)
                resetForm()
              }}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false)
          resetForm()
        }}
        title="Edit Class"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Class Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="Class Code"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
            error={errors.code}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            multiline
            rows={3}
          />
          <Input
            label="Display Order"
            type="number"
            value={formData.order}
            onChange={e => setFormData({ ...formData, order: e.target.value })}
            error={errors.order}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editIsActive"
              checked={formData.isActive}
              onChange={e =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
            <label htmlFor="editIsActive">Active</label>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Class'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEditDialog(false)
                resetForm()
              }}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

export default Classes
