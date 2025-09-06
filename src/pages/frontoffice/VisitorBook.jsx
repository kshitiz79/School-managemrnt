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
  Clock,
  User,
  Phone,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Printer,
  Download,
  QrCode,
  Camera,
  FileText,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import { Table } from '../../components/ui/Table'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { Dropdown } from '../../components/ui/Dropdown'
import { visitorBookApi } from '../../lib/api/visitorBook'
import { staffApi } from '../../lib/api/staff'

// Validation Schema
const visitorSchema = z.object({
  visitorName: z.string().min(1, 'Visitor name is required'),
  visitorMobile: z.string().min(10, 'Valid mobile number is required'),
  visitorEmail: z
    .string()
    .email('Valid email is required')
    .optional()
    .or(z.literal('')),
  organization: z.string().optional(),
  purpose: z.string().min(1, 'Purpose of visit is required'),
  personToMeet: z.string().min(1, 'Person to meet is required'),
  department: z.string().optional(),
  visitDate: z.string().min(1, 'Visit date is required'),
  checkInTime: z.string().min(1, 'Check-in time is required'),
  expectedDuration: z.string().optional(),
  vehicleNumber: z.string().optional(),
  idProofType: z.enum(
    ['aadhar', 'pan', 'driving_license', 'passport', 'voter_id', 'other'],
    {
      required_error: 'ID proof type is required',
    },
  ),
  idProofNumber: z.string().min(1, 'ID proof number is required'),
  numberOfVisitors: z
    .number()
    .min(1, 'Number of visitors must be at least 1')
    .default(1),
  notes: z.string().optional(),
  status: z
    .enum(['checked_in', 'checked_out', 'cancelled'], {
      required_error: 'Status is required',
    })
    .default('checked_in'),
})

const VisitorSlip = ({ visitor, onClose }) => {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={!!visitor} onClose={onClose} title="Visitor Pass" size="md">
      <div className="space-y-6" id="visitor-slip">
        {/* Header */}
        <div className="text-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">VISITOR PASS</h2>
          <p className="text-gray-600">School Management System</p>
        </div>

        {/* Visitor Photo Placeholder */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
            {visitor?.photo ? (
              <img
                src={visitor.photo}
                alt="Visitor"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
        </div>

        {/* Visitor Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Name:</p>
            <p className="text-gray-900">{visitor?.visitorName}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Mobile:</p>
            <p className="text-gray-900">{visitor?.visitorMobile}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Organization:</p>
            <p className="text-gray-900">{visitor?.organization || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Purpose:</p>
            <p className="text-gray-900">{visitor?.purpose}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Person to Meet:</p>
            <p className="text-gray-900">{visitor?.personToMeet}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Department:</p>
            <p className="text-gray-900">{visitor?.department || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Check-in Time:</p>
            <p className="text-gray-900">
              {new Date(
                `${visitor?.visitDate}T${visitor?.checkInTime}`,
              ).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Pass ID:</p>
            <p className="text-gray-900 font-mono">
              {visitor?.passId || visitor?.id}
            </p>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
            <QrCode className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="font-medium text-yellow-800 mb-1">Instructions:</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Please wear this pass visibly at all times</li>
            <li>• Return this pass when leaving the premises</li>
            <li>• Follow all safety and security protocols</li>
            <li>• Contact reception for any assistance</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t pt-4">
          <p>This pass is valid only for the date and time mentioned above</p>
          <p>Generated on: {new Date().toLocaleString()}</p>
        </div>

        <div className="flex justify-center gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Pass
          </button>
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const VisitorBook = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const [showVisitorSlip, setShowVisitorSlip] = useState(false)

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(visitorSchema),
    mode: 'onChange',
    defaultValues: {
      visitDate: new Date().toISOString().split('T')[0],
      checkInTime: new Date().toTimeString().slice(0, 5),
      numberOfVisitors: 1,
      status: 'checked_in',
    },
  })

  const {
    data: visitorsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'visitors',
      {
        page: currentPage,
        pageSize,
        search: searchTerm,
        status: statusFilter,
        date: dateFilter,
      },
    ],
    queryFn: () =>
      visitorBookApi.getAll({
        page: currentPage,
        pageSize,
        search: searchTerm,
        status: statusFilter,
        date: dateFilter,
      }),
  })

  const { data: staffData } = useQuery({
    queryKey: ['staff', 'all'],
    queryFn: () => staffApi.getAll({ all: true }),
  })

  const createMutation = useMutation({
    mutationFn: visitorBookApi.create,
    onSuccess: data => {
      queryClient.invalidateQueries(['visitors'])
      setShowCreateDialog(false)
      reset()
      // Show visitor slip
      setSelectedVisitor(data.data)
      setShowVisitorSlip(true)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => visitorBookApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['visitors'])
      setShowEditDialog(false)
      reset()
    },
  })

  const checkOutMutation = useMutation({
    mutationFn: visitorBookApi.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries(['visitors'])
    },
  })

  const handleEdit = visitor => {
    setSelectedVisitor(visitor)
    reset({
      visitorName: visitor.visitorName,
      visitorMobile: visitor.visitorMobile,
      visitorEmail: visitor.visitorEmail || '',
      organization: visitor.organization || '',
      purpose: visitor.purpose,
      personToMeet: visitor.personToMeet,
      department: visitor.department || '',
      visitDate: visitor.visitDate?.split('T')[0],
      checkInTime: visitor.checkInTime,
      expectedDuration: visitor.expectedDuration || '',
      vehicleNumber: visitor.vehicleNumber || '',
      idProofType: visitor.idProofType,
      idProofNumber: visitor.idProofNumber,
      numberOfVisitors: visitor.numberOfVisitors || 1,
      notes: visitor.notes || '',
      status: visitor.status,
    })
    setShowEditDialog(true)
  }

  const handleCheckOut = visitorId => {
    if (window.confirm('Are you sure you want to check out this visitor?')) {
      checkOutMutation.mutate(visitorId)
    }
  }

  const handlePrintSlip = visitor => {
    setSelectedVisitor(visitor)
    setShowVisitorSlip(true)
  }

  const onSubmit = data => {
    if (selectedVisitor) {
      updateMutation.mutate({ id: selectedVisitor.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'checked_in':
        return 'bg-green-100 text-green-800'
      case 'checked_out':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    {
      key: 'visitorName',
      header: 'Visitor Name',
      sortable: true,
    },
    {
      key: 'visitorMobile',
      header: 'Mobile',
    },
    {
      key: 'organization',
      header: 'Organization',
      render: visitor => visitor.organization || 'Individual',
    },
    {
      key: 'purpose',
      header: 'Purpose',
    },
    {
      key: 'personToMeet',
      header: 'Person to Meet',
    },
    {
      key: 'checkInTime',
      header: 'Check-in Time',
      render: visitor => (
        <div>
          <div>{new Date(visitor.visitDate).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">{visitor.checkInTime}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: visitor => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(visitor.status)}`}
        >
          {visitor.status?.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: visitor => (
        <Dropdown
          trigger={<MoreHorizontal className="w-4 h-4" />}
          items={[
            {
              label: 'Print Pass',
              icon: Printer,
              onClick: () => handlePrintSlip(visitor),
            },
            {
              label: 'Edit',
              icon: Edit,
              onClick: () => handleEdit(visitor),
              disabled: visitor.status === 'checked_out',
            },
            {
              label: 'Check Out',
              icon: XCircle,
              onClick: () => handleCheckOut(visitor.id),
              disabled: visitor.status !== 'checked_in',
            },
          ]}
        />
      ),
    },
  ]

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState message="Failed to load visitor data" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Visitor Book</h1>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => {
              reset()
              setSelectedVisitor(null)
              setShowCreateDialog(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Visitor
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{visitorsData?.total || 0}</p>
              <p className="text-sm text-gray-600">Total Visitors</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {visitorsData?.data?.filter(v => v.status === 'checked_in')
                  .length || 0}
              </p>
              <p className="text-sm text-gray-600">Currently In</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold">
                {visitorsData?.data?.filter(v => v.status === 'checked_out')
                  .length || 0}
              </p>
              <p className="text-sm text-gray-600">Checked Out</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">
                {visitorsData?.data?.filter(
                  v =>
                    v.status === 'checked_in' &&
                    new Date(v.visitDate).toDateString() ===
                      new Date().toDateString()
                ).length || 0}
              </p>
              <p className="text-sm text-gray-600">Today's Visitors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search visitors..."
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
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
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

      {/* Visitors Table */}
      <div className="bg-white rounded-lg shadow">
        {visitorsData?.data?.length === 0 ? (
          <EmptyState
            title="No visitors found"
            description="No visitors match your current filters"
            action={{
              label: 'Add Visitor',
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <>
            <Table data={visitorsData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((visitorsData?.total || 0) / pageSize)}
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
          setSelectedVisitor(null)
        }}
        title={selectedVisitor ? 'Edit Visitor' : 'Add New Visitor'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Visitor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Visitor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="visitorName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Visitor Name *"
                    {...field}
                    error={errors.visitorName?.message}
                  />
                )}
              />
              <Controller
                name="visitorMobile"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Mobile Number *"
                    {...field}
                    error={errors.visitorMobile?.message}
                  />
                )}
              />
              <Controller
                name="visitorEmail"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Email"
                    type="email"
                    {...field}
                    error={errors.visitorEmail?.message}
                  />
                )}
              />
              <Controller
                name="organization"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Organization"
                    {...field}
                    error={errors.organization?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Visit Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Visit Details</h3>
            <Controller
              name="purpose"
              control={control}
              render={({ field }) => (
                <Input
                  label="Purpose of Visit *"
                  {...field}
                  error={errors.purpose?.message}
                />
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="personToMeet"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Person to Meet *
                    </label>
                    <select
                      {...field}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        errors.personToMeet ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Person</option>
                      {staffData?.data?.map(staff => (
                        <option key={staff.id} value={staff.name}>
                          {staff.name} - {staff.designation}
                        </option>
                      ))}
                    </select>
                    {errors.personToMeet && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.personToMeet.message}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="visitDate"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Visit Date *"
                    type="date"
                    {...field}
                    error={errors.visitDate?.message}
                  />
                )}
              />
              <Controller
                name="checkInTime"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Check-in Time *"
                    type="time"
                    {...field}
                    error={errors.checkInTime?.message}
                  />
                )}
              />
              <Controller
                name="expectedDuration"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Expected Duration (hours)"
                    type="number"
                    step="0.5"
                    {...field}
                    error={errors.expectedDuration?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* ID Proof & Additional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              ID Proof & Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="idProofType"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ID Proof Type *
                    </label>
                    <select
                      {...field}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        errors.idProofType ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select ID Proof</option>
                      <option value="aadhar">Aadhar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="driving_license">Driving License</option>
                      <option value="passport">Passport</option>
                      <option value="voter_id">Voter ID</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.idProofType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.idProofType.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="idProofNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    label="ID Proof Number *"
                    {...field}
                    error={errors.idProofNumber?.message}
                  />
                )}
              />
              <Controller
                name="numberOfVisitors"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Number of Visitors *"
                    type="number"
                    min="1"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    error={errors.numberOfVisitors?.message}
                  />
                )}
              />
              <Controller
                name="vehicleNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Vehicle Number"
                    {...field}
                    error={errors.vehicleNumber?.message}
                  />
                )}
              />
            </div>
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
                : selectedVisitor
                  ? 'Update Visitor'
                  : 'Add Visitor'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateDialog(false)
                setShowEditDialog(false)
                reset()
                setSelectedVisitor(null)
              }}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Dialog>

      {/* Visitor Slip */}
      <VisitorSlip
        visitor={showVisitorSlip ? selectedVisitor : null}
        onClose={() => {
          setShowVisitorSlip(false)
          setSelectedVisitor(null)
        }}
      />
    </div>
  )
}

export default VisitorBook
