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
  Home,
  Users,
  Trophy,
  User,
} from 'lucide-react'
import { Table } from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { Dropdown } from '../../components/ui/Dropdown'
import { studentHousesApi } from '../../lib/api/studentHouses'
import { staffApi } from '../../lib/api/staff'
import { studentsApi } from '../../lib/api/students'

// Validation Schema
const houseSchema = z.object({
  name: z.string().min(1, 'House name is required'),
  code: z.string().min(1, 'House code is required'),
  description: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
  motto: z.string().optional(),
  houseTeacherId: z.string().optional(),
  captainId: z.string().optional(),
  viceCaptainId: z.string().optional(),
  maxCapacity: z.number().min(1).optional(),
  isActive: z.boolean().default(true),
})

const StudentHouse = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(houseSchema),
    mode: 'onChange',
    defaultValues: {
      isActive: true,
      color: '#3B82F6',
    },
  })

  const {
    data: housesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'studentHouses',
      { page: currentPage, pageSize, search: searchTerm },
    ],
    queryFn: () =>
      studentHousesApi.getAll({
        page: currentPage,
        pageSize,
        search: searchTerm,
      }),
  })

  const { data: teachersData } = useQuery({
    queryKey: ['staff', 'teachers'],
    queryFn: () => staffApi.getTeachers(),
  })

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'all'],
    queryFn: () => studentsApi.getAll({ all: true }),
  })

  const createMutation = useMutation({
    mutationFn: studentHousesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['studentHouses'])
      setShowCreateDialog(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => studentHousesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['studentHouses'])
      setShowEditDialog(false)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: studentHousesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['studentHouses'])
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: studentHousesApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(['studentHouses'])
      setSelectedItems([])
    },
  })

  const handleEdit = house => {
    setSelectedHouse(house)
    reset({
      name: house.name,
      code: house.code,
      description: house.description || '',
      color: house.color || '#3B82F6',
      motto: house.motto || '',
      houseTeacherId: house.houseTeacherId || '',
      captainId: house.captainId || '',
      viceCaptainId: house.viceCaptainId || '',
      maxCapacity: house.maxCapacity || '',
      isActive: house.isActive,
    })
    setShowEditDialog(true)
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this house?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.length} houses?`,
      )
    ) {
      bulkDeleteMutation.mutate(selectedItems)
    }
  }

  const onSubmit = data => {
    const submitData = {
      ...data,
      maxCapacity: data.maxCapacity ? Number(data.maxCapacity) : null,
    }

    if (selectedHouse) {
      updateMutation.mutate({ id: selectedHouse.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const predefinedColors = [
    '#DC2626',
    '#2563EB',
    '#16A34A',
    '#CA8A04',
    '#9333EA',
    '#C2410C',
    '#0891B2',
    '#65A30D',
    '#E11D48',
    '#7C3AED',
  ]

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedItems.length === housesData?.data?.length}
          onChange={e => {
            if (e.target.checked) {
              setSelectedItems(housesData.data.map(item => item.id))
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
    { key: 'motto', header: 'Motto' },
    {
      key: 'houseTeacher',
      header: 'House Teacher',
      render: item => item.houseTeacher?.name || 'Not Assigned',
    },
    {
      key: 'captain',
      header: 'Captain',
      render: item => item.captain?.name || 'Not Assigned',
    },
    {
      key: 'studentCount',
      header: 'Students',
      render: item => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{item.studentCount || 0}</span>
          {item.maxCapacity && (
            <span className="text-gray-500">/ {item.maxCapacity}</span>
          )}
        </div>
      ),
    },
    {
      key: 'points',
      header: 'Points',
      render: item => (
        <div className="flex items-center gap-1">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-medium">{item.totalPoints || 0}</span>
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
              label: 'House Activities',
              icon: Trophy,
              onClick: () => console.log('View activities for', item.id),
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
  if (error) return <ErrorState message="Failed to load student houses" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Houses</h1>
        <button
          onClick={() => {
            reset()
            setSelectedHouse(null)
            setShowCreateDialog(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add House
        </button>
      </div>

      {/* House Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{housesData?.total || 0}</p>
              <p className="text-sm text-gray-600">Total Houses</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">1,245</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-gray-600">House Teachers</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">48</p>
              <p className="text-sm text-gray-600">House Captains</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search houses..."
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

        {housesData?.data?.length === 0 ? (
          <EmptyState
            title="No houses found"
            description="Get started by creating your first student house"
            action={{
              label: 'Add House',
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <>
            <Table data={housesData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((housesData?.total || 0) / pageSize)}
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
          setSelectedHouse(null)
        }}
        title={selectedHouse ? 'Edit House' : 'Add New House'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  label="House Name *"
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
                  label="House Code *"
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
              name="motto"
              control={control}
              render={({ field }) => (
                <Input
                  label="House Motto"
                  {...field}
                  error={errors.motto?.message}
                />
              )}
            />
            <Controller
              name="maxCapacity"
              control={control}
              render={({ field }) => (
                <Input
                  label="Maximum Capacity"
                  type="number"
                  min="1"
                  {...field}
                  error={errors.maxCapacity?.message}
                />
              )}
            />
          </div>

          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-1">
                  House Color *
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="houseTeacherId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    House Teacher
                  </label>
                  <select
                    {...field}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Teacher</option>
                    {Array.isArray(teachersData?.data) &&
                      teachersData.data.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                  </select>
                  {errors.houseTeacherId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.houseTeacherId.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="captainId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    House Captain
                  </label>
                  <select
                    {...field}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Captain</option>
                    {Array.isArray(studentsData?.data) &&
                      studentsData.data.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name} - {student.class?.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            />
            <Controller
              name="viceCaptainId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vice Captain
                  </label>
                  <select
                    {...field}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Vice Captain</option>
                    {Array.isArray(studentsData?.data) &&
                      studentsData.data.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name} - {student.class?.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            />
          </div>

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

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : selectedHouse
                  ? 'Update House'
                  : 'Create House'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateDialog(false)
                setShowEditDialog(false)
                reset()
                setSelectedHouse(null)
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

export default StudentHouse
