import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Send,
  Eye,
  Check,
  X,
  Clock,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  AlertTriangle,
  Download,
  MessageSquare,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import { Table } from '../../components/ui/Table'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { onlineAdmissionApi } from '../../lib/api/onlineAdmission'
import { classesApi } from '../../lib/api/classes'

// Public Form Schema
const publicAdmissionSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Gender is required',
  }),
  classAppliedFor: z.string().min(1, 'Class is required'),

  fatherName: z.string().min(1, 'Father name is required'),
  fatherMobile: z.string().min(10, 'Valid mobile number is required'),
  fatherEmail: z.string().email('Valid email is required'),
  fatherOccupation: z.string().optional(),

  motherName: z.string().min(1, 'Mother name is required'),
  motherMobile: z.string().min(10, 'Valid mobile number is required'),
  motherEmail: z.string().email().optional().or(z.literal('')),
  motherOccupation: z.string().optional(),

  currentAddress: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode is required'),

  previousSchool: z.string().optional(),
  previousClass: z.string().optional(),

  additionalInfo: z.string().optional(),
})

// Public Admission Form Component
const PublicAdmissionForm = ({ onSubmit, isSubmitting }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(publicAdmissionSchema),
    mode: 'onChange',
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'public'],
    queryFn: () => classesApi.getPublicClasses(),
  })

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Online Admission Form
        </h1>
        <p className="text-gray-600">
          Please fill in all the required information carefully
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Student Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Student Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="studentName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Student Name *"
                  {...field}
                  error={errors.studentName?.message}
                />
              )}
            />
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <Input
                  label="Date of Birth *"
                  type="date"
                  {...field}
                  error={errors.dateOfBirth?.message}
                />
              )}
            />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gender *
                  </label>
                  <select
                    {...field}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      errors.gender ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="classAppliedFor"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Class Applied For *
                  </label>
                  <select
                    {...field}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      errors.classAppliedFor ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select Class</option>
                    {Array.isArray(classesData?.data) &&
                      classesData.data.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                  </select>
                  {errors.classAppliedFor && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.classAppliedFor.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* Father Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Father Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="fatherName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Father Name *"
                  {...field}
                  error={errors.fatherName?.message}
                />
              )}
            />
            <Controller
              name="fatherMobile"
              control={control}
              render={({ field }) => (
                <Input
                  label="Father Mobile *"
                  {...field}
                  error={errors.fatherMobile?.message}
                />
              )}
            />
            <Controller
              name="fatherEmail"
              control={control}
              render={({ field }) => (
                <Input
                  label="Father Email *"
                  type="email"
                  {...field}
                  error={errors.fatherEmail?.message}
                />
              )}
            />
            <Controller
              name="fatherOccupation"
              control={control}
              render={({ field }) => (
                <Input
                  label="Father Occupation"
                  {...field}
                  error={errors.fatherOccupation?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Mother Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Mother Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="motherName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Mother Name *"
                  {...field}
                  error={errors.motherName?.message}
                />
              )}
            />
            <Controller
              name="motherMobile"
              control={control}
              render={({ field }) => (
                <Input
                  label="Mother Mobile *"
                  {...field}
                  error={errors.motherMobile?.message}
                />
              )}
            />
            <Controller
              name="motherEmail"
              control={control}
              render={({ field }) => (
                <Input
                  label="Mother Email"
                  type="email"
                  {...field}
                  error={errors.motherEmail?.message}
                />
              )}
            />
            <Controller
              name="motherOccupation"
              control={control}
              render={({ field }) => (
                <Input
                  label="Mother Occupation"
                  {...field}
                  error={errors.motherOccupation?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Address Information
          </h2>
          <Controller
            name="currentAddress"
            control={control}
            render={({ field }) => (
              <Input
                label="Current Address *"
                multiline
                rows={3}
                {...field}
                error={errors.currentAddress?.message}
              />
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input label="City *" {...field} error={errors.city?.message} />
              )}
            />
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Input
                  label="State *"
                  {...field}
                  error={errors.state?.message}
                />
              )}
            />
            <Controller
              name="pincode"
              control={control}
              render={({ field }) => (
                <Input
                  label="Pincode *"
                  {...field}
                  error={errors.pincode?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Previous School Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Previous School Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="previousSchool"
              control={control}
              render={({ field }) => (
                <Input
                  label="Previous School Name"
                  {...field}
                  error={errors.previousSchool?.message}
                />
              )}
            />
            <Controller
              name="previousClass"
              control={control}
              render={({ field }) => (
                <Input
                  label="Previous Class"
                  {...field}
                  error={errors.previousClass?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Additional Information
          </h2>
          <Controller
            name="additionalInfo"
            control={control}
            render={({ field }) => (
              <Input
                label="Additional Information (Optional)"
                multiline
                rows={4}
                placeholder="Any additional information you would like to share..."
                {...field}
                error={errors.additionalInfo?.message}
              />
            )}
          />
        </div>

        {/* Terms and Conditions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Terms and Conditions</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• All information provided must be accurate and complete</li>
            <li>• Documents will be verified during the admission process</li>
            <li>• Admission is subject to availability and school policies</li>
            <li>• The school reserves the right to reject any application</li>
          </ul>
          <label className="flex items-center gap-2 mt-4">
            <input type="checkbox" required className="rounded" />
            <span className="text-sm">I agree to the terms and conditions</span>
          </label>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Admin Review Queue Component
const AdminReviewQueue = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const queryClient = useQueryClient()

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: [
      'onlineAdmissions',
      { page: currentPage, pageSize, status: statusFilter },
    ],
    queryFn: () =>
      onlineAdmissionApi.getApplications({
        page: currentPage,
        pageSize,
        status: statusFilter,
      }),
  })

  const approveMutation = useMutation({
    mutationFn: onlineAdmissionApi.approveApplication,
    onSuccess: () => {
      queryClient.invalidateQueries(['onlineAdmissions'])
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      onlineAdmissionApi.rejectApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['onlineAdmissions'])
      setShowRejectDialog(false)
      setRejectReason('')
    },
  })

  const handleApprove = application => {
    if (window.confirm('Are you sure you want to approve this application?')) {
      approveMutation.mutate(application.id)
    }
  }

  const handleReject = application => {
    setSelectedApplication(application)
    setShowRejectDialog(true)
  }

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    rejectMutation.mutate({
      id: selectedApplication.id,
      reason: rejectReason,
    })
  }

  const getStatusColor = status => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    { key: 'applicationId', header: 'App ID', sortable: true },
    { key: 'studentName', header: 'Student Name', sortable: true },
    {
      key: 'classAppliedFor',
      header: 'Class',
      render: app => app.class?.name || app.classAppliedFor,
    },
    { key: 'fatherName', header: 'Father Name' },
    { key: 'fatherMobile', header: 'Mobile' },
    {
      key: 'submittedAt',
      header: 'Submitted',
      render: app => new Date(app.submittedAt).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      render: app => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}
        >
          {app.status.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: app => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedApplication(app)
              setShowDetailsDialog(true)
            }}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {app.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(app)}
                className="text-green-600 hover:text-green-800"
                title="Approve"
                disabled={approveMutation.isPending}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(app)}
                className="text-red-600 hover:text-red-800"
                title="Reject"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Online Admission Applications</h2>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-gray-600">Under Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Check className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <X className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow">
        {applicationsData?.data?.length === 0 ? (
          <EmptyState
            title="No applications found"
            description="No online admission applications match your current filters"
          />
        ) : (
          <>
            <Table data={applicationsData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(
                  (applicationsData?.total || 0) / pageSize,
                )}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Application Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        title="Application Details"
        size="lg"
      >
        {selectedApplication && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Student Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span>{selectedApplication.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span>
                      {new Date(
                        selectedApplication.dateOfBirth,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="capitalize">
                      {selectedApplication.gender}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class Applied:</span>
                    <span>
                      {selectedApplication.class?.name ||
                        selectedApplication.classAppliedFor}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Father:</span>
                    <span>{selectedApplication.fatherName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Father Mobile:</span>
                    <span>{selectedApplication.fatherMobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Father Email:</span>
                    <span>{selectedApplication.fatherEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mother:</span>
                    <span>{selectedApplication.motherName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Address</h3>
              <p className="text-sm text-gray-700">
                {selectedApplication.currentAddress}
              </p>
              <p className="text-sm text-gray-700">
                {selectedApplication.city}, {selectedApplication.state} -{' '}
                {selectedApplication.pincode}
              </p>
            </div>

            {selectedApplication.additionalInfo && (
              <div>
                <h3 className="font-medium mb-3">Additional Information</h3>
                <p className="text-sm text-gray-700">
                  {selectedApplication.additionalInfo}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              {selectedApplication.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedApplication)
                      setShowDetailsDialog(false)
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsDialog(false)
                      handleReject(selectedApplication)
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        title="Reject Application"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Reject Application</span>
          </div>
          <p className="text-gray-600">
            Please provide a reason for rejecting this application. This will be
            communicated to the applicant.
          </p>
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full border rounded-lg px-3 py-2 h-24 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowRejectDialog(false)}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectSubmit}
              disabled={rejectMutation.isPending}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject Application'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

const OnlineAdmission = () => {
  const [viewMode, setViewMode] = useState('public') // 'public' or 'admin'
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const submitApplicationMutation = useMutation({
    mutationFn: onlineAdmissionApi.submitApplication,
    onSuccess: () => {
      setShowSuccessMessage(true)
    },
  })

  const handlePublicSubmit = data => {
    submitApplicationMutation.mutate(data)
  }

  if (showSuccessMessage) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Application Submitted Successfully!
          </h2>
          <p className="text-green-700 mb-4">
            Thank you for your application. We have received your information
            and will review it shortly.
          </p>
          <p className="text-green-600 text-sm mb-6">
            You will receive an email confirmation with your application ID and
            further instructions.
          </p>
          <button
            onClick={() => {
              setShowSuccessMessage(false)
              setViewMode('public')
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle (for demo purposes) */}
      <div className="flex justify-center">
        <div className="flex border rounded-lg">
          <button
            onClick={() => setViewMode('public')}
            className={`px-4 py-2 text-sm ${
              viewMode === 'public'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Public Form
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className={`px-4 py-2 text-sm ${
              viewMode === 'admin'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Admin Review
          </button>
        </div>
      </div>

      {viewMode === 'public' ? (
        <PublicAdmissionForm
          onSubmit={handlePublicSubmit}
          isSubmitting={submitApplicationMutation.isPending}
        />
      ) : (
        <AdminReviewQueue />
      )}
    </div>
  )
}

export default OnlineAdmission
