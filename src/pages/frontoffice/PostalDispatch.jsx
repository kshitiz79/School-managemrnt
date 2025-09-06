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
  Send,
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  User,
  Calendar,
  FileText,
  Download,
  Printer,
  QrCode,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import { Table } from '../../components/ui/Table'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { Dropdown } from '../../components/ui/Dropdown'
import { postalDispatchApi } from '../../lib/api/postalDispatch'

// Validation Schema
const dispatchSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientAddress: z.string().min(1, 'Recipient address is required'),
  recipientCity: z.string().min(1, 'City is required'),
  recipientState: z.string().min(1, 'State is required'),
  recipientPincode: z.string().min(6, 'Valid pincode is required'),
  recipientPhone: z.string().min(10, 'Valid phone number is required'),
  recipientEmail: z
    .string()
    .email('Valid email is required')
    .optional()
    .or(z.literal('')),

  senderName: z.string().min(1, 'Sender name is required'),
  senderDepartment: z.string().optional(),

  itemType: z.enum(
    ['letter', 'document', 'parcel', 'certificate', 'report_card', 'other'],
    {
      required_error: 'Item type is required',
    },
  ),
  itemDescription: z.string().min(1, 'Item description is required'),
  itemWeight: z.string().optional(),
  itemValue: z.string().optional(),

  serviceType: z.enum(
    ['regular', 'registered', 'speed_post', 'courier', 'express'],
    {
      required_error: 'Service type is required',
    },
  ),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: 'Priority is required',
  }),

  dispatchDate: z.string().min(1, 'Dispatch date is required'),
  expectedDelivery: z.string().optional(),

  trackingNumber: z.string().optional(),
  postageAmount: z.string().optional(),

  notes: z.string().optional(),
  status: z
    .enum(['prepared', 'dispatched', 'in_transit', 'delivered', 'returned'], {
      required_error: 'Status is required',
    })
    .default('prepared'),
})

const PostalDispatch = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedDispatch, setSelectedDispatch] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dispatchSchema),
    mode: 'onChange',
    defaultValues: {
      dispatchDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'prepared',
      serviceType: 'regular',
    },
  })

  const {
    data: dispatchData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'postalDispatch',
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
      postalDispatchApi.getAll({
        page: currentPage,
        pageSize,
        search: searchTerm,
        status: statusFilter,
        service: serviceFilter,
        date: dateFilter,
      }),
  })

  const createMutation = useMutation({
    mutationFn: postalDispatchApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['postalDispatch'])
      setShowCreateDialog(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => postalDispatchApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['postalDispatch'])
      setShowEditDialog(false)
      reset()
    },
  })

  const handleEdit = dispatch => {
    setSelectedDispatch(dispatch)
    reset({
      recipientName: dispatch.recipientName,
      recipientAddress: dispatch.recipientAddress,
      recipientCity: dispatch.recipientCity,
      recipientState: dispatch.recipientState,
      recipientPincode: dispatch.recipientPincode,
      recipientPhone: dispatch.recipientPhone,
      recipientEmail: dispatch.recipientEmail || '',
      senderName: dispatch.senderName,
      senderDepartment: dispatch.senderDepartment || '',
      itemType: dispatch.itemType,
      itemDescription: dispatch.itemDescription,
      itemWeight: dispatch.itemWeight || '',
      itemValue: dispatch.itemValue || '',
      serviceType: dispatch.serviceType,
      priority: dispatch.priority,
      dispatchDate: dispatch.dispatchDate?.split('T')[0],
      expectedDelivery: dispatch.expectedDelivery?.split('T')[0] || '',
      trackingNumber: dispatch.trackingNumber || '',
      postageAmount: dispatch.postageAmount || '',
      notes: dispatch.notes || '',
      status: dispatch.status,
    })
    setShowEditDialog(true)
  }

  const handleViewDetails = dispatch => {
    setSelectedDispatch(dispatch)
    setShowDetailsDialog(true)
  }

  const onSubmit = data => {
    if (selectedDispatch) {
      updateMutation.mutate({ id: selectedDispatch.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'prepared':
        return 'bg-yellow-100 text-yellow-800'
      case 'dispatched':
        return 'bg-blue-100 text-blue-800'
      case 'in_transit':
        return 'bg-purple-100 text-purple-800'
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
        return Send
      case 'courier':
        return Truck
      case 'express':
        return AlertTriangle
      default:
        return Package
    }
  }

  const columns = [
    {
      key: 'dispatchId',
      header: 'Dispatch ID',
      render: dispatch => (
        <div className="font-mono text-sm">
          {dispatch.dispatchId || `DSP-${dispatch.id}`}
        </div>
      ),
    },
    {
      key: 'recipient',
      header: 'Recipient',
      render: dispatch => (
        <div>
          <div className="font-medium">{dispatch.recipientName}</div>
          <div className="text-sm text-gray-500">{dispatch.recipientCity}</div>
        </div>
      ),
    },
    {
      key: 'item',
      header: 'Item',
      render: dispatch => (
        <div>
          <div className="font-medium capitalize">
            {dispatch.itemType?.replace('_', ' ')}
          </div>
          <div className="text-sm text-gray-500">
            {dispatch.itemDescription}
          </div>
        </div>
      ),
    },
    {
      key: 'service',
      header: 'Service',
      render: dispatch => {
        const Icon = getServiceIcon(dispatch.serviceType)
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-400" />
            <span className="capitalize">
              {dispatch.serviceType?.replace('_', ' ')}
            </span>
          </div>
        )
      },
    },
    {
      key: 'dispatchDate',
      header: 'Dispatch Date',
      render: dispatch => new Date(dispatch.dispatchDate).toLocaleDateString(),
    },
    {
      key: 'trackingNumber',
      header: 'Tracking',
      render: dispatch => (
        <div className="font-mono text-sm">
          {dispatch.trackingNumber || 'N/A'}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: dispatch => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(dispatch.status)}`}
        >
          {dispatch.status?.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: dispatch => (
        <Dropdown
          trigger={<MoreHorizontal className="w-4 h-4" />}
          items={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: () => handleViewDetails(dispatch),
            },
            {
              label: 'Edit',
              icon: Edit,
              onClick: () => handleEdit(dispatch),
            },
            {
              label: 'Print Label',
              icon: Printer,
              onClick: () => console.log('Print label for', dispatch.id),
            },
            {
              label: 'Track',
              icon: MapPin,
              onClick: () => console.log('Track dispatch', dispatch.id),
              disabled: !dispatch.trackingNumber,
            },
          ]}
        />
      ),
    },
  ]

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState message="Failed to load postal dispatch data" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Postal Dispatch</h1>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => {
              reset()
              setSelectedDispatch(null)
              setShowCreateDialog(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Dispatch
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{dispatchData?.total || 0}</p>
              <p className="text-sm text-gray-600">Total Dispatches</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Send className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {dispatchData?.data?.filter(d => d.status === 'dispatched')
                  .length || 0}
              </p>
              <p className="text-sm text-gray-600">Dispatched</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">
                {dispatchData?.data?.filter(d => d.status === 'in_transit')
                  .length || 0}
              </p>
              <p className="text-sm text-gray-600">In Transit</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {dispatchData?.data?.filter(d => d.status === 'delivered')
                  .length || 0}
              </p>
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search dispatches..."
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
              <option value="prepared">Prepared</option>
              <option value="dispatched">Dispatched</option>
              <option value="in_transit">In Transit</option>
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

      {/* Dispatch Table */}
      <div className="bg-white rounded-lg shadow">
        {dispatchData?.data?.length === 0 ? (
          <EmptyState
            title="No dispatches found"
            description="No postal dispatches match your current filters"
            action={{
              label: 'New Dispatch',
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <>
            <Table data={dispatchData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((dispatchData?.total || 0) / pageSize)}
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
          setSelectedDispatch(null)
        }}
        title={selectedDispatch ? 'Edit Dispatch' : 'New Postal Dispatch'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Recipient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Recipient Information
            </h3>
            <Controller
              name="recipientName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Recipient Name *"
                  {...field}
                  error={errors.recipientName?.message}
                />
              )}
            />
            <Controller
              name="recipientAddress"
              control={control}
              render={({ field }) => (
                <Input
                  label="Address *"
                  multiline
                  rows={3}
                  {...field}
                  error={errors.recipientAddress?.message}
                />
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="recipientCity"
                control={control}
                render={({ field }) => (
                  <Input
                    label="City *"
                    {...field}
                    error={errors.recipientCity?.message}
                  />
                )}
              />
              <Controller
                name="recipientState"
                control={control}
                render={({ field }) => (
                  <Input
                    label="State *"
                    {...field}
                    error={errors.recipientState?.message}
                  />
                )}
              />
              <Controller
                name="recipientPincode"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Pincode *"
                    {...field}
                    error={errors.recipientPincode?.message}
                  />
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="recipientPhone"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Phone *"
                    {...field}
                    error={errors.recipientPhone?.message}
                  />
                )}
              />
              <Controller
                name="recipientEmail"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Email"
                    type="email"
                    {...field}
                    error={errors.recipientEmail?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Sender Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Sender Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Controller
                name="senderDepartment"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Department"
                    {...field}
                    error={errors.senderDepartment?.message}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="itemWeight"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Weight (grams)"
                    type="number"
                    {...field}
                    error={errors.itemWeight?.message}
                  />
                )}
              />
              <Controller
                name="itemValue"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Declared Value (₹)"
                    type="number"
                    {...field}
                    error={errors.itemValue?.message}
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
          </div>

          {/* Dispatch Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Dispatch Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="dispatchDate"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Dispatch Date *"
                    type="date"
                    {...field}
                    error={errors.dispatchDate?.message}
                  />
                )}
              />
              <Controller
                name="expectedDelivery"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Expected Delivery"
                    type="date"
                    {...field}
                    error={errors.expectedDelivery?.message}
                  />
                )}
              />
              <Controller
                name="postageAmount"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Postage Amount (₹)"
                    type="number"
                    step="0.01"
                    {...field}
                    error={errors.postageAmount?.message}
                  />
                )}
              />
            </div>
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
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : selectedDispatch
                  ? 'Update Dispatch'
                  : 'Create Dispatch'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateDialog(false)
                setShowEditDialog(false)
                reset()
                setSelectedDispatch(null)
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

export default PostalDispatch
