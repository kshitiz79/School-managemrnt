import React, { useState } from 'react'
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
  Eye,
  Package,
  Inbox,
  CheckCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Download,
  Printer,
  AlertTriangle,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import { Table } from '../../components/ui/Table'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { Dropdown } from '../../components/ui/Dropdown'
import { postalReceiveApi } from '../../lib/api/postalReceive'
import { staffApi } from '../../lib/api/staff'

// Validation Schema
const receiveSchema = z.object({
  senderName: z.string().min(1, 'Sender name is required'),
  senderAddress: z.string().optional(),
  senderOrganization: z.string().optional(),

  itemType: z.enum(
    ['letter', 'document', 'parcel', 'certificate', 'report_card', 'other'],
    {
      required_error: 'Item type is required',
    }
  ),
  itemDescription: z.string().min(1, 'Item description is required'),

  serviceType: z.enum(
    ['regular', 'registered', 'speed_post', 'courier', 'express'],
    {
      required_error: 'Service type is required',
    }),

  receivedDate: z.string().min(1, 'Received date is required'),
  receivedTime: z.string().min(1, 'Received time is required'),
  receivedBy: z.string().min(1, 'Received by is required'),

  addressedTo: z.string().min(1, 'Addressed to is required'),
  department: z.string().optional(),

  trackingNumber: z.string().optional(),
  referenceNumber: z.string().optional(),

  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: 'Priority is required',
  }),

  deliveryStatus: z
    .enum(['pending', 'delivered', 'returned'], {
      required_error: 'Delivery status is required',
    })
    .default('pending'),

  deliveredTo: z.string().optional(),
  deliveredDate: z.string().optional(),
  deliveredTime: z.string().optional(),

  notes: z.string().optional(),
})

const PostalReceive = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false)

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(receiveSchema),
    mode: 'onChange',
    defaultValues: {
      receivedDate: new Date().toISOString().split('T')[0],
      receivedTime: new Date().toTimeString().slice(0, 5),
      priority: 'medium',
      deliveryStatus: 'pending',
      serviceType: 'regular',
    }
  })

  const deliveryStatus = watch('deliveryStatus')

  const {
    data: receiveData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'postalReceive',
      {
        page: currentPage,
        pageSize,
        search: searchTerm,
        status: statusFilter,
        service: serviceFilter,
        date: dateFilter,
      },
    ],
    queryFn: () =>
      postalReceiveApi.getAll({
        page: currentPage,
        pageSize,
        search: searchTerm,
        status: statusFilter,
        service: serviceFilter,
        date: dateFilter,
      }),
  })

  const { data: staffData } = useQuery({
    queryKey: ['staff', 'all'],
    queryFn: () => staffApi.getAll({ all: true }),
  })

  const createMutation = useMutation({
    mutationFn: postalReceiveApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['postalReceive'])
      setShowCreateDialog(false)
      reset()
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => postalReceiveApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['postalReceive'])
      setShowEditDialog(false)
      reset()
    }
  })

  const deliverMutation = useMutation({
    mutationFn: ({ id, deliveredTo }) =>
      postalReceiveApi.markAsDelivered(id, deliveredTo),
    onSuccess: () => {
      queryClient.invalidateQueries(['postalReceive'])
      setShowDeliveryDialog(false)
    }
  })

  const handleEdit = item => {
    setSelectedItem(item)
    reset({
      senderName: item.senderName,
      senderAddress: item.senderAddress || '',
      senderOrganization: item.senderOrganization || '',
      itemType: item.itemType,
      itemDescription: item.itemDescription,
      serviceType: item.serviceType,
      receivedDate: item.receivedDate?.split('T')[0],
      receivedTime: item.receivedTime,
      receivedBy: item.receivedBy,
      addressedTo: item.addressedTo,
      department: item.department || '',
      trackingNumber: item.trackingNumber || '',
      referenceNumber: item.referenceNumber || '',
      priority: item.priority,
      deliveryStatus: item.deliveryStatus,
      deliveredTo: item.deliveredTo || '',
      deliveredDate: item.deliveredDate?.split('T')[0] || '',
      deliveredTime: item.deliveredTime || '',
      notes: item.notes || '',
    })
    setShowEditDialog(true)
  };

  const handleViewDetails = item => {
    setSelectedItem(item)
    setShowDetailsDialog(true)
  };

  const handleMarkDelivered = item => {
    setSelectedItem(item)
    setShowDeliveryDialog(true)
  };

  const onSubmit = data => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'returned':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getServiceIcon = service => {
    switch (service) {
      case 'regular':
        return Package
      case 'registered':
        return FileText
      case 'speed_post':
        return Inbox
      case 'courier':
        return Package
      case 'express':
        return AlertTriangle
      default:
        return Package
    }
  }

  const columns = [
    {
      key: 'receiveId',
      header: 'Receive ID',
      render: item => (
        <div className="font-mono text-sm">
          {item.receiveId || `RCV-${item.id}`}
        </div>
      ),
    },
    {
      key: 'sender',
      header: 'Sender',
      render: item => (
        <div>
          <div className="font-medium">{item.senderName}</div>
          <div className="text-sm text-gray-500">
            {item.senderOrganization || 'Individual'}
          </div>
        </div>
      ),
    },
    {
      key: 'item',
      header: 'Item',
      render: item => (
        <div>
          <div className="font-medium capitalize">
            {item.itemType?.replace('_', ' ')}
          </div>
          <div className="text-sm text-gray-500">{item.itemDescription}</div>
        </div>
      ),
    },
    {
      key: 'service',
      header: 'Service',
      render: item => {
        const Icon = getServiceIcon(item.serviceType)
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-400" />
            <span className="capitalize">
              {item.serviceType?.replace('_', ' ')}
            </span>
          </div>
        )
      }
    },
    {
      key: 'addressedTo',
      header: 'Addressed To',
      render: item => (
        <div>
          <div className="font-medium">{item.addressedTo}</div>
          <div className="text-sm text-gray-500">
            {item.department || 'General'}
          </div>
        </div>
      ),
    },
    {
      key: 'receivedDate',
      header: 'Received',
      render: item => (
        <div>
          <div>{new Date(item.receivedDate).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">{item.receivedTime}</div>
        </div>
      ),
    },
    {
      key: 'deliveryStatus',
      header: 'Status',
      render: item => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.deliveryStatus)}`}
        >
          {item.deliveryStatus?.toUpperCase()}
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
              label: 'View Details',
              icon: Eye,
              onClick: () => handleViewDetails(item),
            },
            {
              label: 'Edit',
              icon: Edit,
              onClick: () => handleEdit(item),
            },
            {
              label: 'Mark Delivered',
              icon: CheckCircle,
              onClick: () => handleMarkDelivered(item),
              disabled: item.deliveryStatus === 'delivered',
            },
            {
              label: 'Print Receipt',
              icon: Printer,
              onClick: () => console.log('Print receipt for', item.id),
            }
          ]}
        />
      ),
    }
  ]

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState message="Failed to load postal receive data" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Postal Receive</h1>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => {
              reset()
              setSelectedItem(null)
              setShowCreateDialog(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Record Receipt
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Inbox className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{receiveData?.total || 0}</p>
              <p className="text-sm text-gray-600">Total Received</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">
                {receiveData?.data?.filter(d => d.deliveryStatus === 'pending')
                  .length || 0}
              </p>
              <p className="text-sm text-gray-600">Pending Delivery</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {receiveData?.data?.filter(
                  d => d.deliveryStatus === 'delivered'
                ).length || 0}
              </p>
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">
                {receiveData?.data?.filter(
                  d =>
                    new Date(d.receivedDate).toDateString() ===
                    new Date().toDateString(),
                ).length || 0}
              </p>
              <p className="text-sm text-gray-600">Today's Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search postal items..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          <div>
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Services</option>
              <option value="regular">Regular</option>
              <option value="registered">Registered</option>
              <option value="speed_post">Speed Post</option>
              <option value="courier">Courier</option>
              <option value="express">Express</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Receive Table */}
      <div className="bg-white rounded-lg shadow">
        {receiveData?.data?.length === 0 ? (
          <EmptyState
            title="No postal items found"
            description="No received postal items match your current filters"
            action={{
              label: 'Record Receipt',
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <>
            <Table data={receiveData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((receiveData?.total || 0) / pageSize)}
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
          setSelectedItem(null)
        }}
        title={selectedItem ? 'Edit Postal Item' : 'Record New Postal Receipt'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Sender Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Sender Information
            </h3>
            <Controller
              name="senderName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Sender Name *"
                  {...field}
                  error={errors.senderName?.message}
                />
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="senderOrganization"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Organization"
                    {...field}
                    error={errors.senderOrganization?.message}
                  />
                )}
              />
              <Controller
                name="senderAddress"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Address"
                    {...field}
                    error={errors.senderAddress?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Item Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Item Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="itemType"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Item Type *
                    </label>
                    <select
                      {...field}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        errors.itemType ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Type</option>
                      <option value="letter">Letter</option>
                      <option value="document">Document</option>
                      <option value="parcel">Parcel</option>
                      <option value="certificate">Certificate</option>
                      <option value="report_card">Report Card</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.itemType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.itemType.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="serviceType"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Service Type *
                    </label>
                    <select
                      {...field}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        errors.serviceType ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="regular">Regular</option>
                      <option value="registered">Registered</option>
                      <option value="speed_post">Speed Post</option>
                      <option value="courier">Courier</option>
                      <option value="express">Express</option>
                    </select>
                    {errors.serviceType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.serviceType.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
            <Controller
              name="itemDescription"
              control={control}
              render={({ field }) => (
                <Input
                  label="Item Description *"
                  {...field}
                  error={errors.itemDescription?.message}
                />
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="trackingNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Tracking Number"
                    {...field}
                    error={errors.trackingNumber?.message}
                  />
                )}
              />
              <Controller
                name="referenceNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Reference Number"
                    {...field}
                    error={errors.referenceNumber?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Receipt Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Receipt Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="receivedDate"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Received Date *"
                    type="date"
                    {...field}
                    error={errors.receivedDate?.message}
                  />
                )}
              />
              <Controller
                name="receivedTime"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Received Time *"
                    type="time"
                    {...field}
                    error={errors.receivedTime?.message}
                  />
                )}
              />
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Priority *
                    </label>
                    <select
                      {...field}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        errors.priority ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    {errors.priority && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.priority.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
            <Controller
              name="receivedBy"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Received By *
                  </label>
                  <select
                    {...field}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      errors.receivedBy ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select Staff</option>
                    {staffData?.data?.map(staff => (
                      <option key={staff.id} value={staff.name}>
                        {staff.name} - {staff.designation}
                      </option>
                    ))}
                  </select>
                  {errors.receivedBy && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.receivedBy.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Addressee Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Addressee Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="addressedTo"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Addressed To *
                    </label>
                    <select
                      {...field}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        errors.addressedTo ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Person</option>
                      {staffData?.data?.map(staff => (
                        <option key={staff.id} value={staff.name}>
                          {staff.name} - {staff.designation}
                        </option>
                      ))}
                    </select>
                    {errors.addressedTo && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.addressedTo.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Department"
                    {...field}
                    error={errors.department?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Delivery Information */}
          {deliveryStatus === 'delivered' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">
                Delivery Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name="deliveredTo"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Delivered To"
                      {...field}
                      error={errors.deliveredTo?.message}
                    />
                  )}
                />
                <Controller
                  name="deliveredDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Delivered Date"
                      type="date"
                      {...field}
                      error={errors.deliveredDate?.message}
                    />
                  )}
                />
                <Controller
                  name="deliveredTime"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Delivered Time"
                      type="time"
                      {...field}
                      error={errors.deliveredTime?.message}
                    />
                  )}
                />
              </div>
            </div>
          )}

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Input
                label="Notes"
                multiline
                rows={3}
                {...field}
                error={errors.notes?.message}
              />
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
                : selectedItem
                  ? 'Update Item'
                  : 'Record Receipt'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateDialog(false)
                setShowEditDialog(false)
                reset()
                setSelectedItem(null)
              }}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delivery Dialog */}
      <Dialog
        open={showDeliveryDialog}
        onClose={() => setShowDeliveryDialog(false)}
        title="Mark as Delivered"
      >
        <div className="space-y-4">
          <p>Mark this item as delivered to the addressee?</p>
          <div>
            <label className="block text-sm font-medium mb-1">
              Delivered To
            </label>
            <select className="w-full border rounded-lg px-3 py-2">
              <option value="">Select Person</option>
              {staffData?.data?.map(staff => (
                <option key={staff.id} value={staff.name}>
                  {staff.name} - {staff.designation}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={() =>
                deliverMutation.mutate({
                  id: selectedItem?.id,
                  deliveredTo: 'Selected Person',
                })
              }
              disabled={deliverMutation.isPending}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {deliverMutation.isPending ? 'Marking...' : 'Mark Delivered'}
            </button>
            <button
              onClick={() => setShowDeliveryDialog(false)}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
};

export default PostalReceive