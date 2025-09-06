import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
} from 'lucide-react'
import { Table } from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { Dropdown } from '../../components/ui/Dropdown'
import { subjectsApi } from '../../lib/api/subjects'

const Subjects = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    type: 'core',
    maxMarks: '',
    passMarks: '',
    isActive: true,
  })
  const [errors, setErrors] = useState({})

  const queryClient = useQueryClient()

  const {
    data: subjectsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['subjects', { page: currentPage, pageSize, search: searchTerm }],
    queryFn: () =>
      subjectsApi.getAll({ page: currentPage, pageSize, search: searchTerm }),
  })

  const createMutation = useMutation({
    mutationFn: subjectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects'])
      setShowCreateDialog(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => subjectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects'])
      setShowEditDialog(false)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: subjectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects'])
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: subjectsApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects'])
      setSelectedItems([])
    },
  })

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Subject name is required'
    }

    if (!formData.code || formData.code.trim() === '') {
      newErrors.code = 'Subject code is required'
    }

    if (formData.maxMarks && isNaN(Number(formData.maxMarks))) {
      newErrors.maxMarks = 'Max marks must be a number'
    }

    if (formData.passMarks && isNaN(Number(formData.passMarks))) {
      newErrors.passMarks = 'Pass marks must be a number'
    }

    if (
      formData.maxMarks &&
      formData.passMarks &&
      parseInt(formData.passMarks) > parseInt(formData.maxMarks)
    ) {
      newErrors.passMarks = 'Pass marks cannot be greater than max marks'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validateForm()) return

    const submitData = {
      ...formData,
      maxMarks: formData.maxMarks ? parseInt(formData.maxMarks) : null,
      passMarks: formData.passMarks ? parseInt(formData.passMarks) : null,
    }

    if (selectedSubject) {
      updateMutation.mutate({ id: selectedSubject.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = subject => {
    setSelectedSubject(subject)
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      type: subject.type || 'core',
      maxMarks: subject.maxMarks?.toString() || '',
      passMarks: subject.passMarks?.toString() || '',
      isActive: subject.isActive,
    })
    setShowEditDialog(true)
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.length} subjects?`,
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
      type: 'core',
      maxMarks: '',
      passMarks: '',
      isActive: true,
    })
    setErrors({})
    setSelectedSubject(null)
  }

  const subjectTypes = [
    { value: 'core', label: 'Core Subject' },
    { value: 'elective', label: 'Elective' },
    { value: 'optional', label: 'Optional' },
    { value: 'extracurricular', label: 'Extra-curricular' },
  ]

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedItems.length === subjectsData?.data?.length}
          onChange={e => {
            if (e.target.checked) {
              setSelectedItems(
                Array.isArray(subjectsData?.data)
                  ? subjectsData.data.map(item => item.id)
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
      key: 'type',
      header: 'Type',
      render: item => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            item.type === 'core'
              ? 'bg-blue-100 text-blue-800'
              : item.type === 'elective'
                ? 'bg-green-100 text-green-800'
                : item.type === 'optional'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-purple-100 text-purple-800'
          }`}
        >
          {subjectTypes.find(t => t.value === item.type)?.label || item.type}
        </span>
      ),
    },
    { key: 'maxMarks', header: 'Max Marks' },
    { key: 'passMarks', header: 'Pass Marks' },
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
              label: 'View Details',
              icon: BookOpen,
              onClick: () => console.log('View details for', item.id),
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
  if (error) return <ErrorState message="Failed to load subjects" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search subjects..."
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

        {subjectsData?.data?.length === 0 ? (
          <EmptyState
            title="No subjects found"
            description="Get started by creating your first subject"
            action={{
              label: 'Add Subject',
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <>
            <Table data={subjectsData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((subjectsData?.total || 0) / pageSize)}
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
        title="Add New Subject"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="Subject Code"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
            error={errors.code}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1">
              Subject Type
            </label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              {Array.isArray(subjectTypes) &&
                subjectTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Marks"
              type="number"
              value={formData.maxMarks}
              onChange={e =>
                setFormData({ ...formData, maxMarks: e.target.value })
              }
              error={errors.maxMarks}
            />
            <Input
              label="Pass Marks"
              type="number"
              value={formData.passMarks}
              onChange={e =>
                setFormData({ ...formData, passMarks: e.target.value })
              }
              error={errors.passMarks}
            />
          </div>
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
              {createMutation.isPending ? 'Creating...' : 'Create Subject'}
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
        title="Edit Subject"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="Subject Code"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
            error={errors.code}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1">
              Subject Type
            </label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              {Array.isArray(subjectTypes) &&
                subjectTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Marks"
              type="number"
              value={formData.maxMarks}
              onChange={e =>
                setFormData({ ...formData, maxMarks: e.target.value })
              }
              error={errors.maxMarks}
            />
            <Input
              label="Pass Marks"
              type="number"
              value={formData.passMarks}
              onChange={e =>
                setFormData({ ...formData, passMarks: e.target.value })
              }
              error={errors.passMarks}
            />
          </div>
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
              {updateMutation.isPending ? 'Updating...' : 'Update Subject'}
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

export default Subjects
