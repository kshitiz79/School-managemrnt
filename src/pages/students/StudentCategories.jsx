import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
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
import { studentCategoriesApi } from '../../lib/api/studentCategories'

// Validation Schema
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  code: z.string().min(1, 'Category code is required'),
  description: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
  feeDiscount: z.number().min(0).max(100).default(0),
  scholarshipEligible: z.boolean().default(false),
  reservationQuota: z.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
})

const StudentCategories = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
    defaultValues: {
      feeDiscount: 0,
      scholarshipEligible: false,
      reservationQuota: 0,
      isActive: true,
      color: '#3B82F6',
    },
  })

  const {
    data: categoriesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'studentCategories',
      { page: currentPage, pageSize, search: searchTerm },
    ],
    queryFn: () =>
      studentCategoriesApi.getAll({
        page: currentPage,
        pageSize,
        search: searchTerm,
      }),
  })

  const createMutation = useMutation({
    mutationFn: studentCategoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['studentCategories'])
      setShowCreateDialog(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => studentCategoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['studentCategories'])
      setShowEditDialog(false)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: studentCategoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['studentCategories'])
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: studentCategoriesApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(['studentCategories'])
      setSelectedItems([])
    },
  })

  const handleEdit = category => {
    setSelectedCategory(category)
    reset({
      name: category.name,
      code: category.code,
      description: category.description || '',
      color: category.color || '#3B82F6',
      feeDiscount: category.feeDiscount || 0,
      scholarshipEligible: category.scholarshipEligible || false,
      reservationQuota: category.reservationQuota || 0,
      isActive: category.isActive,
    })
    setShowEditDialog(true)
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.length} categories?`,
      )
    ) {
      bulkDeleteMutation.mutate(selectedItems)
    }
  }

  const onSubmit = data => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const predefinedColors = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#6366F1',
  ]

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedItems.length === categoriesData?.data?.length}
          onChange={e => {
            if (e.target.checked) {
              setSelectedItems(categoriesData.data.map(item => item.id))
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
    {
      key: 'color',
      header: 'Color',
      render: item => (
        <div
          className="w-6 h-6 rounded-full border-2 border-gray-300"
          style={{ backgroundColor: item.color }}
        />
      ),
    },
    { key: 'code', header: 'Code', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'feeDiscount',
      header: 'Fee Discount',
      render: item => `${item.feeDiscount || 0}%`,
    },
    {
      key: 'reservationQuota',
      header: 'Reservation',
      render: item => `${item.reservationQuota || 0}%`,
    },
    {
      key: 'scholarshipEligible',
      header: 'Scholarship',
      render: item => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            item.scholarshipEligible
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {item.scholarshipEligible ? 'Eligible' : 'Not Eligible'}
        </span>
      ),
    },
    {
      key: 'studentCount',
      header: 'Students',
      render: item => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{item.studentCount || 0}</span>
        </div>
      ),
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
  if (error) return <ErrorState message="Failed to load student categories" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Categories</h1>
        <button
          onClick={() => {
            reset()
            setSelectedCategory(null)
            setShowCreateDialog(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search categories..."
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

        {categoriesData?.data?.length === 0 ? (
          <EmptyState
            title="No categories found"
            description="Get started by creating your first student category"
            action={{
              label: 'Add Category',
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <>
            <Table data={categoriesData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((categoriesData?.total || 0) / pageSize)}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || showEditDialog}
        onClose={() => {
          setShowCreateDialog(false)
          setShowEditDialog(false)
          reset()
          setSelectedCategory(null)
        }}
        title={selectedCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  label="Category Name *"
                  {...field}
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Input
                  label="Category Code *"
                  {...field}
                  error={errors.code?.message}
                />
              )}
            />
          </div>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input
                label="Description"
                multiline
                rows={3}
                {...field}
                error={errors.description?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Color *
                  </label>
                  <div className="flex gap-2 mb-2">
                    {Array.isArray(predefinedColors) &&
                      predefinedColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => field.onChange(color)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            field.value === color
                              ? 'border-gray-800'
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                  </div>
                  <input
                    type="color"
                    {...field}
                    className="w-full h-10 border rounded-lg"
                  />
                  {errors.color && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.color.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="feeDiscount"
              control={control}
              render={({ field }) => (
                <Input
                  label="Fee Discount (%)"
                  type="number"
                  min="0"
                  max="100"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                  error={errors.feeDiscount?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="reservationQuota"
              control={control}
              render={({ field }) => (
                <Input
                  label="Reservation Quota (%)"
                  type="number"
                  min="0"
                  max="100"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                  error={errors.reservationQuota?.message}
                />
              )}
            />
          </div>

          <div className="space-y-3">
            <Controller
              name="scholarshipEligible"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span>Eligible for Scholarship</span>
                </label>
              )}
            />
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span>Active</span>
                </label>
              )}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : selectedCategory
                  ? 'Update Category'
                  : 'Create Category'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateDialog(false)
                setShowEditDialog(false)
                reset()
                setSelectedCategory(null)
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

export default StudentCategories
