import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Save,
  Camera,
  Upload,
  FileText,
  Eye,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  History,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import { studentsApi } from '../../lib/api/students'
import { classesApi } from '../../lib/api/classes'
import { sectionsApi } from '../../lib/api/sections'
import { studentCategoriesApi } from '../../lib/api/studentCategories'
import { studentHousesApi } from '../../lib/api/studentHouses'

// Validation Schema
const profileUpdateSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Gender is required',
  }),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().min(1, 'Nationality is required'),

  // Contact Information
  mobile: z.string().min(10, 'Valid mobile number is required'),
  email: z
    .string()
    .email('Valid email is required')
    .optional()
    .or(z.literal('')),
  emergencyContact: z.string().min(10, 'Emergency contact is required'),

  // Address
  currentAddress: z.string().min(1, 'Current address is required'),
  permanentAddress: z.string().min(1, 'Permanent address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode is required'),

  // Academic Information
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),

  // Guardian Information
  fatherName: z.string().min(1, 'Father name is required'),
  fatherOccupation: z.string().optional(),
  fatherMobile: z.string().min(10, 'Father mobile is required'),
  fatherEmail: z.string().email().optional().or(z.literal('')),

  motherName: z.string().min(1, 'Mother name is required'),
  motherOccupation: z.string().optional(),
  motherMobile: z.string().min(10, 'Mother mobile is required'),
  motherEmail: z.string().email().optional().or(z.literal('')),

  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianMobile: z.string().optional(),

  // Optional Information
  categoryId: z.string().optional(),
  houseId: z.string().optional(),
  transportRequired: z.boolean().default(false),
  hostelRequired: z.boolean().default(false),
})

const PhotoUpload = ({ currentPhoto, onPhotoChange }) => {
  const [preview, setPreview] = useState(currentPhoto)
  const [showCamera, setShowCamera] = useState(false)

  const handleFileSelect = e => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = e => {
        setPreview(e.target.result)
        onPhotoChange(file)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="Student"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
            <User className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <button
          type="button"
          className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
          onClick={() => document.getElementById('photo-upload').click()}
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2">
        <label className="bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700 text-sm">
          Upload Photo
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
        {preview && (
          <button
            type="button"
            onClick={() => {
              setPreview(null)
              onPhotoChange(null)
            }}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 text-sm"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

const DocumentManager = ({ documents, onDocumentAdd, onDocumentRemove }) => {
  const [showPreview, setShowPreview] = useState(false)
  const [previewDocument, setPreviewDocument] = useState(null)

  const handleFileSelect = e => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`)
        return
      }
      onDocumentAdd(file)
    })
  }

  const handlePreview = doc => {
    setPreviewDocument(doc)
    setShowPreview(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documents</h3>
        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 text-sm flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Add Document
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(documents) &&
            documents.map((doc, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {doc.size
                        ? `${(doc.size / 1024 / 1024).toFixed(2)} MB`
                        : 'Unknown size'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreview(doc)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDocumentRemove(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No documents uploaded</p>
        </div>
      )}

      {/* Document Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Document Preview"
        size="lg"
      >
        {previewDocument && (
          <div className="text-center">
            <p className="mb-4">Document: {previewDocument.name}</p>
            {previewDocument.type?.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(previewDocument)}
                alt="Document preview"
                className="max-w-full max-h-96 mx-auto"
              />
            ) : (
              <div className="py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  Preview not available for this file type
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  File: {previewDocument.name}
                </p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}

const ChangeHistory = ({ studentId }) => {
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['student', 'history', studentId],
    queryFn: () => studentsApi.getUpdateHistory(studentId),
    enabled: !!studentId,
  })

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <History className="w-5 h-5" />
        Change History
      </h3>

      {historyData?.data?.length > 0 ? (
        <div className="space-y-3">
          {Array.isArray(historyData.data) &&
            historyData.data.map((change, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{change.field} Updated</p>
                    <p className="text-sm text-gray-600">
                      By {change.updatedBy} on{' '}
                      {new Date(change.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      change.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : change.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {change.status}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">From:</span>
                      <p className="font-mono bg-gray-100 p-2 rounded mt-1">
                        {change.oldValue || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">To:</span>
                      <p className="font-mono bg-gray-100 p-2 rounded mt-1">
                        {change.newValue}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No change history available</p>
        </div>
      )}
    </div>
  )
}

const StudentProfileUpdate = ({ studentId: propStudentId }) => {
  const [studentId, setStudentId] = useState(propStudentId || '')
  const [currentTab, setCurrentTab] = useState('personal')
  const [photo, setPhoto] = useState(null)
  const [documents, setDocuments] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    mode: 'onChange',
  })

  const selectedClass = watch('classId')

  // Queries
  const { data: studentData, isLoading: studentLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentsApi.getById(studentId),
    enabled: !!studentId,
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.getAll({ all: true }),
  })

  const { data: sectionsData } = useQuery({
    queryKey: ['sections', 'by-class', selectedClass],
    queryFn: () => sectionsApi.getByClass(selectedClass),
    enabled: !!selectedClass,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['studentCategories', 'all'],
    queryFn: () => studentCategoriesApi.getAll({ all: true }),
  })

  const { data: housesData } = useQuery({
    queryKey: ['studentHouses', 'all'],
    queryFn: () => studentHousesApi.getAll({ all: true }),
  })

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => studentsApi.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['student', studentId])
      alert('Profile updated successfully!')
    },
  })

  // Initialize form with student data
  React.useEffect(() => {
    if (studentData?.data) {
      const student = studentData.data
      reset({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        dateOfBirth: student.dateOfBirth
          ? student.dateOfBirth.split('T')[0]
          : '',
        gender: student.gender || 'male',
        bloodGroup: student.bloodGroup || '',
        religion: student.religion || '',
        nationality: student.nationality || 'Indian',
        mobile: student.mobile || '',
        email: student.email || '',
        emergencyContact: student.emergencyContact || '',
        currentAddress: student.currentAddress || '',
        permanentAddress: student.permanentAddress || '',
        city: student.city || '',
        state: student.state || '',
        pincode: student.pincode || '',
        classId: student.classId || '',
        sectionId: student.sectionId || '',
        rollNumber: student.rollNumber || '',
        fatherName: student.fatherName || '',
        fatherOccupation: student.fatherOccupation || '',
        fatherMobile: student.fatherMobile || '',
        fatherEmail: student.fatherEmail || '',
        motherName: student.motherName || '',
        motherOccupation: student.motherOccupation || '',
        motherMobile: student.motherMobile || '',
        motherEmail: student.motherEmail || '',
        guardianName: student.guardianName || '',
        guardianRelation: student.guardianRelation || '',
        guardianMobile: student.guardianMobile || '',
        categoryId: student.categoryId || '',
        houseId: student.houseId || '',
        transportRequired: student.transportRequired || false,
        hostelRequired: student.hostelRequired || false,
      })

      setPhoto(student.photo)
      setDocuments(student.documents || [])
    }
  }, [studentData, reset])

  const handleDocumentAdd = file => {
    setDocuments(prev => [...prev, file])
  }

  const handleDocumentRemove = index => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = data => {
    const formData = new FormData()

    // Add form data
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })

    // Add photo if changed
    if (photo && typeof photo !== 'string') {
      formData.append('photo', photo)
    }

    // Add documents
    documents.forEach((doc, index) => {
      if (doc instanceof File) {
        formData.append(`documents[${index}]`, doc)
      }
    })

    updateMutation.mutate({ id: studentId, data: formData })
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'contact', label: 'Contact & Address', icon: MapPin },
    { id: 'academic', label: 'Academic Info', icon: GraduationCap },
    { id: 'guardian', label: 'Guardian Info', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
  ]

  if (!studentId) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Select Student</h2>
          <Input
            label="Student ID"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            placeholder="Enter student ID"
          />
          <button
            onClick={() => setStudentId(studentId)}
            disabled={!studentId}
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Load Student Profile
          </button>
        </div>
      </div>
    )
  }

  if (studentLoading) return <LoadingSkeleton />
  if (!studentData) return <ErrorState message="Student not found" />

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Update Student Profile</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            View History
          </button>
          {isDirty && (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
        </div>
      </div>

      {/* Student Info Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            {studentData.data.photo ? (
              <img
                src={studentData.data.photo}
                alt="Student"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{studentData.data.name}</h2>
            <p className="text-gray-600">
              Roll No: {studentData.data.rollNumber} |
              {studentData.data.class?.name} - {studentData.data.section?.name}
            </p>
            <div className="flex gap-2 mt-2">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  studentData.data.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {studentData.data.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {Array.isArray(tabs) &&
              tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    currentTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Personal Information Tab */}
          {currentTab === 'personal' && (
            <div className="space-y-6">
              <div className="flex justify-center mb-8">
                <PhotoUpload currentPhoto={photo} onPhotoChange={setPhoto} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="First Name *"
                      {...field}
                      error={errors.firstName?.message}
                    />
                  )}
                />
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Last Name *"
                      {...field}
                      error={errors.lastName?.message}
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
                  name="bloodGroup"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Blood Group"
                      {...field}
                      error={errors.bloodGroup?.message}
                    />
                  )}
                />
                <Controller
                  name="religion"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Religion"
                      {...field}
                      error={errors.religion?.message}
                    />
                  )}
                />
                <Controller
                  name="nationality"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Nationality *"
                      {...field}
                      error={errors.nationality?.message}
                    />
                  )}
                />
              </div>
            </div>
          )}

          {/* Contact & Address Tab */}
          {currentTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="mobile"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Mobile Number *"
                      {...field}
                      error={errors.mobile?.message}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Email"
                      type="email"
                      {...field}
                      error={errors.email?.message}
                    />
                  )}
                />
                <Controller
                  name="emergencyContact"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Emergency Contact *"
                      {...field}
                      error={errors.emergencyContact?.message}
                    />
                  )}
                />
              </div>

              <h3 className="text-lg font-medium">Address Information</h3>
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
              <Controller
                name="permanentAddress"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Permanent Address *"
                    multiline
                    rows={3}
                    {...field}
                    error={errors.permanentAddress?.message}
                  />
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="City *"
                      {...field}
                      error={errors.city?.message}
                    />
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
          )}

          {/* Academic Information Tab */}
          {currentTab === 'academic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Class *
                      </label>
                      <select
                        {...field}
                        onChange={e => {
                          field.onChange(e)
                          setValue('sectionId', '')
                        }}
                        className={`w-full border rounded-lg px-3 py-2 ${
                          errors.classId ? 'border-red-500' : ''
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
                      {errors.classId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.classId.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="sectionId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Section *
                      </label>
                      <select
                        {...field}
                        disabled={!selectedClass}
                        className={`w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 ${
                          errors.sectionId ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="">Select Section</option>
                        {Array.isArray(sectionsData?.data) &&
                          sectionsData.data.map(section => (
                            <option key={section.id} value={section.id}>
                              {section.name}
                            </option>
                          ))}
                      </select>
                      {errors.sectionId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.sectionId.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="rollNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Roll Number *"
                      {...field}
                      error={errors.rollNumber?.message}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Category
                      </label>
                      <select
                        {...field}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="">Select Category</option>
                        {Array.isArray(categoriesData?.data) &&
                          categoriesData.data.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                />
                <Controller
                  name="houseId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        House
                      </label>
                      <select
                        {...field}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="">Select House</option>
                        {housesData?.data?.map(house => (
                          <option key={house.id} value={house.id}>
                            {house.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                />
              </div>

              <div className="flex gap-6">
                <Controller
                  name="transportRequired"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      Transport Required
                    </label>
                  )}
                />
                <Controller
                  name="hostelRequired"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      Hostel Required
                    </label>
                  )}
                />
              </div>
            </div>
          )}

          {/* Guardian Information Tab */}
          {currentTab === 'guardian' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Father Details</h3>
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
                        label="Father Email"
                        type="email"
                        {...field}
                        error={errors.fatherEmail?.message}
                      />
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Mother Details</h3>
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Guardian Details (if different)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Controller
                    name="guardianName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Guardian Name"
                        {...field}
                        error={errors.guardianName?.message}
                      />
                    )}
                  />
                  <Controller
                    name="guardianRelation"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Relation"
                        {...field}
                        error={errors.guardianRelation?.message}
                      />
                    )}
                  />
                  <Controller
                    name="guardianMobile"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Guardian Mobile"
                        {...field}
                        error={errors.guardianMobile?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {currentTab === 'documents' && (
            <DocumentManager
              documents={documents}
              onDocumentAdd={handleDocumentAdd}
              onDocumentRemove={handleDocumentRemove}
            />
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t mt-8">
            <div className="flex items-center gap-2">
              {isDirty && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">You have unsaved changes</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => reset()}
                disabled={!isDirty}
                className="border px-6 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending || !isDirty}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Change History Dialog */}
      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        title="Profile Change History"
        size="lg"
      >
        <ChangeHistory studentId={studentId} />
      </Dialog>
    </div>
  )
}

export default StudentProfileUpdate
