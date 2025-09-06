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
  X,
} from 'lucide-react'
import { Table } from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { Dropdown } from '../../components/ui/Dropdown'
import { subjectGroupsApi } from '../../lib/api/subjectGroups'
import { subjectsApi } from '../../lib/api/subjects'
import { classesApi } from '../../lib/api/classes'

const SubjectGroups = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    classId: '',
    subjects: [],
    isActive: true,
  })
  const [errors, setErrors] = useState({})
  const [availableSubjects, setAvailableSubjects] = useState([])

  const queryClient = useQueryClient()

  const {
    data: groupsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'subjectGroups',
      { page: currentPage, pageSize, search: searchTerm },
    ],
    queryFn: () =>
      subjectGroupsApi.getAll({
        page: currentPage,
        pageSize,
        search: searchTerm,
      }),
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: () => subjectsApi.getAll({ all: true }),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.getAll({ all: true }),
  })

  const createMutation = useMutation({
    mutationFn: subjectGroupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjectGroups'])
      setShowCreateDialog(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => subjectGroupsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subjectGroups'])
      setShowEditDialog(false)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: subjectGroupsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjectGroups'])
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: subjectGroupsApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjectGroups'])
      setSelectedItems([])
    },
  })

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Group name is required'
    }

    if (!formData.code || formData.code.trim() === '') {
      newErrors.code = 'Group code is required'
    }

    if (!formData.classId || formData.classId.trim() === '') {
      newErrors.classId = 'Class is required'
    }

    if (formData.subjects.length === 0) {
      newErrors.subjects = 'At least one subject is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validateForm()) return

    if (selectedGroup) {
      updateMutation.mutate({ id: selectedGroup.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = group => {
    setSelectedGroup(group)
    setFormData({
      name: group.name,
      code: group.code,
      description: group.description || '',
      classId: group.classId,
      subjects: group.subjects || [],
      isActive: group.isActive,
    })
    setShowEditDialog(true)
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this subject group?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.length} subject groups?`,
      )
    ) {
      bulkDeleteMutation.mutate(selectedItems)
    }
  }

  const handleAddSubject = subjectId => {
    const subject = subjectsData?.data?.find(s => s.id === subjectId)
    if (subject && !formData.subjects.find(s => s.id === subjectId)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subject],
      })
    }
  }

  const handleRemoveSubject = subjectId => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(s => s.id !== subjectId),
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      classId: '',
      subjects: [],
      isActive: true,
    })
    setErrors({})
    setSelectedGroup(null)
  }

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedItems.length === groupsData?.data?.length}
          onChange={e => {
            if (e.target.checked) {
              setSelectedItems(groupsData.data.map(item => item.id))
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
    {
      key: 'subjectCount',
      header: 'Subjects',
      render: item => item.subjects?.length || 0,
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
              label: 'View Subjects',
              icon: BookOpen,
              onClick: () => console.log('View subjects for', item.id),
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
  if (error) return <ErrorState message="Failed to load subject groups" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subject Groups</h1>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Subject Group
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search subject groups..."
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

        {groupsData?.data?.length === 0 ? (
          <EmptyState
            title="No subject groups found"
            description="Get started by creating your first subject group"
            action={{
              label: 'Add Subject Group',
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <>
            <Table data={groupsData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((groupsData?.total || 0) / pageSize)}
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
        title="Add New Subject Group"
        size="lg"
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
            label="Group Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="Group Code"
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

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Subjects *</label>
            <div className="space-y-2">
              <select
                onChange={e => {
                  if (e.target.value) {
                    handleAddSubject(e.target.value)
                    e.target.value = ''
                  }
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Add Subject</option>
                {subjectsData?.data
                  ?.filter(
                    subject => !formData.subjects.find(s => s.id === subject.id)
                  )
                  .map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
              </select>

              {/* Selected Subjects */}
              <div className="flex flex-wrap gap-2">
                {Array.isArray(formData.subjects) &&
                  formData.subjects.map(subject => (
                    <div
                      key={subject.id}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {subject.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subject.id)}
                        className="hover:bg-blue-200 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            {errors.subjects && (
              <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>
            )}
          </div>

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
              {createMutation.isPending ? 'Creating...' : 'Create Group'}
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
        title="Edit Subject Group"
        size="lg"
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
            label="Group Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="Group Code"
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

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Subjects *</label>
            <div className="space-y-2">
              <select
                onChange={e => {
                  if (e.target.value) {
                    handleAddSubject(e.target.value)
                    e.target.value = ''
                  }
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Add Subject</option>
                {subjectsData?.data
                  ?.filter(
                    subject => !formData.subjects.find(s => s.id === subject.id)
                  )
                  .map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
              </select>

              {/* Selected Subjects */}
              <div className="flex flex-wrap gap-2">
                {Array.isArray(formData.subjects) &&
                  formData.subjects.map(subject => (
                    <div
                      key={subject.id}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {subject.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subject.id)}
                        className="hover:bg-blue-200 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            {errors.subjects && (
              <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>
            )}
          </div>

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
              {updateMutation.isPending ? 'Updating...' : 'Update Group'}
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

export default SubjectGroups
