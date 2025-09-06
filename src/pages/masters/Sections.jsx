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
import { sectionsApi } from '../../lib/api/sections'
import { classesApi } from '../../lib/api/classes'

const Sections = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    classId: '',
    capacity: '',
    description: '',
    isActive: true,
  })
  const [errors, setErrors] = useState({})

  const queryClient = useQueryClient()

  const {
    data: sectionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sections', { page: currentPage, pageSize, search: searchTerm }],
    queryFn: () =>
      sectionsApi.getAll({ page: currentPage, pageSize, search: searchTerm }),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.getAll({ all: true }),
  })

  const createMutation = useMutation({
    mutationFn: sectionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['sections'])
      setShowCreateDialog(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => sectionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sections'])
      setShowEditDialog(false)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: sectionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['sections'])
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: sectionsApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(['sections'])
      setSelectedItems([])
    },
  })

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Section name is required'
    }

    if (!formData.code || formData.code.trim() === '') {
      newErrors.code = 'Section code is required'
    }

    if (!formData.classId || formData.classId.trim() === '') {
      newErrors.classId = 'Class is required'
    }

    if (formData.capacity && isNaN(Number(formData.capacity))) {
      newErrors.capacity = 'Capacity must be a number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validateForm()) return

    const submitData = {
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
    }

    if (selectedSection) {
      updateMutation.mutate({ id: selectedSection.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = section => {
    setSelectedSection(section)
    setFormData({
      name: section.name,
      code: section.code,
      classId: section.classId,
      capacity: section.capacity?.toString() || '',
      description: section.description || '',
      isActive: section.isActive,
    })
    setShowEditDialog(true)
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.length} sections?`,
      )
    ) {
      bulkDeleteMutation.mutate(selectedItems)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      classId: '',
      capacity: '',
      description: '',
      isActive: true,
    })
    setErrors({})
    setSelectedSection(null)
  }

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedItems.length === sectionsData?.data?.length}
          onChange={e => {
            if (e.target.checked) {
              setSelectedItems(
                Array.isArray(sectionsData?.data)
                  ? sectionsData.data.map(item => item.id)
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
    {
      key: 'className',
      header: 'Class',
      render: item => item.class?.name || 'N/A',
    },
    { key: 'capacity', header: 'Capacity' },
    {
      key: 'currentStrength',
      header: 'Current Strength',
      render: item => item.currentStrength || 0,
    },
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
              label: 'View Students',
              icon: Users,
              onClick: () => console.log('View students for', item.id),
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
  if (error) return <ErrorState message="Failed to load sections" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sections</h1>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search sections..."
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

        {sectionsData?.data?.length === 0 ? (
          <EmptyState
            title="No sections found"
            description="Get started by creating your first section"
            action={{
              label: 'Add Section',
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <>
            <Table data={sectionsData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((sectionsData?.total || 0) / pageSize)}
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
        title="Add New Section"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class *</label>
            <select
              value={formData.classId}
              onChange={e =>
                setFormData({ ...formData, classId: e.target.value })
              }
              className={`w-full border rounded-lg px-3 py-2 ${errors.classId ? 'border-red-500' : ''}`}
            >
              <option value="">Select Class</option>
              {Array.isArray(classesData?.data) &&
                classesData.data.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
            </select>
            {errors.classId && (
              <p className="text-red-500 text-sm mt-1">{errors.classId}</p>
            )}
          </div>
          <Input
            label="Section Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="Section Code"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
            error={errors.code}
            required
          />
          <Input
            label="Capacity"
            type="number"
            value={formData.capacity}
            onChange={e =>
              setFormData({ ...formData, capacity: e.target.value })
            }
            error={errors.capacity}
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
              {createMutation.isPending ? 'Creating...' : 'Create Section'}
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
        title="Edit Section"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class *</label>
            <select
              value={formData.classId}
              onChange={e =>
                setFormData({ ...formData, classId: e.target.value })
              }
              className={`w-full border rounded-lg px-3 py-2 ${errors.classId ? 'border-red-500' : ''}`}
            >
              <option value="">Select Class</option>
              {Array.isArray(classesData?.data) &&
                classesData.data.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
            </select>
            {errors.classId && (
              <p className="text-red-500 text-sm mt-1">{errors.classId}</p>
            )}
          </div>
          <Input
            label="Section Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="Section Code"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
            error={errors.code}
            required
          />
          <Input
            label="Capacity"
            type="number"
            value={formData.capacity}
            onChange={e =>
              setFormData({ ...formData, capacity: e.target.value })
            }
            error={errors.capacity}
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
              {updateMutation.isPending ? 'Updating...' : 'Update Section'}
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

export default Sections
