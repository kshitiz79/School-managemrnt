import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Save,
  Upload,
  Camera,
  FileText,
  Eye,
  X,
  User,
  Users,
  GraduationCap,
  MapPin,
  Phone,
  DollarSign,
  Calendar,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { studentsApi } from '../../lib/api/students'
import { classesApi } from '../../lib/api/classes'
import { sectionsApi } from '../../lib/api/sections'
import { studentCategoriesApi } from '../../lib/api/studentCategories'
import { studentHousesApi } from '../../lib/api/studentHouses'
import { feesApi } from '../../lib/api/fees'

// Validation Schema
const admissionSchema = z.object({
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
  admissionDate: z.string().min(1, 'Admission date is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  previousSchool: z.string().optional(),

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

  // Fee Information
  feeStructureId: z.string().min(1, 'Fee structure is required'),
  discount: z.number().min(0).max(100).default(0),
  scholarshipApplied: z.boolean().default(false),
})

const DocumentUpload = ({ documents, onDocumentAdd, onDocumentRemove }) => {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = e => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => onDocumentAdd(file))
  }

  const handleFileSelect = e => {
    const files = Array.from(e.target.files)
    files.forEach(file => onDocumentAdd(file))
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={e => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600 mb-2">Drag and drop files here or</p>
        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
          Browse Files
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB each)
        </p>
      </div>

      {documents.length > 0 && (
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
                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
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
      )}
    </div>
  )
}

const PhotoCapture = ({ photo, onPhotoChange }) => {
  const [showCamera, setShowCamera] = useState(false)

  const handleFileSelect = e => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => onPhotoChange(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {photo ? (
          <img
            src={photo}
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
          onClick={() => setShowCamera(true)}
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

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
        {photo && (
          <button
            type="button"
            onClick={() => onPhotoChange(null)}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 text-sm"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

const StudentAdmission = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [documents, setDocuments] = useState([])
  const [photo, setPhoto] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(admissionSchema),
    mode: 'onChange',
    defaultValues: {
      gender: 'male',
      nationality: 'Indian',
      transportRequired: false,
      hostelRequired: false,
      scholarshipApplied: false,
      discount: 0,
    },
  })

  const selectedClass = watch('classId')

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

  const { data: feeStructuresData } = useQuery({
    queryKey: ['fees', 'structures', selectedClass],
    queryFn: () => feesApi.getStructuresByClass(selectedClass),
    enabled: !!selectedClass,
  })

  const admissionMutation = useMutation({
    mutationFn: studentsApi.createAdmission,
    onSuccess: () => {
      queryClient.invalidateQueries(['students'])
      // Reset form or redirect
    },
  })

  const handleDocumentAdd = file => {
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB')
      return
    }
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

    // Add photo
    if (photo) {
      formData.append('photo', photo)
    }

    // Add documents
    documents.forEach((doc, index) => {
      formData.append(`documents[${index}]`, doc)
    })

    admissionMutation.mutate(formData)
  }

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Contact & Address', icon: MapPin },
    { number: 3, title: 'Academic Info', icon: GraduationCap },
    { number: 4, title: 'Guardian Info', icon: Users },
    { number: 5, title: 'Documents & Photo', icon: FileText },
    { number: 6, title: 'Fee Structure', icon: DollarSign },
  ]

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 overflow-x-auto">
      {Array.isArray(steps) &&
        steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <div className="ml-2 text-sm font-medium">{step.title}</div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Personal Information</h2>
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
              <label className="block text-sm font-medium mb-1">Gender *</label>
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
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Contact & Address Information</h2>

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

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address Details</h3>
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
              <Input label="City *" {...field} error={errors.city?.message} />
            )}
          />
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Input label="State *" {...field} error={errors.state?.message} />
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
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Academic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="classId"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium mb-1">Class *</label>
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
        <Controller
          name="admissionDate"
          control={control}
          render={({ field }) => (
            <Input
              label="Admission Date *"
              type="date"
              {...field}
              error={errors.admissionDate?.message}
            />
          )}
        />
        <Controller
          name="academicYear"
          control={control}
          render={({ field }) => (
            <Input
              label="Academic Year *"
              {...field}
              error={errors.academicYear?.message}
            />
          )}
        />
        <Controller
          name="previousSchool"
          control={control}
          render={({ field }) => (
            <Input
              label="Previous School"
              {...field}
              error={errors.previousSchool?.message}
            />
          )}
        />
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select {...field} className="w-full border rounded-lg px-3 py-2">
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
              <label className="block text-sm font-medium mb-1">House</label>
              <select {...field} className="w-full border rounded-lg px-3 py-2">
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

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Requirements</h3>
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
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Guardian Information</h2>

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
        <h3 className="text-lg font-medium">Guardian Details (if different)</h3>
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
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Documents & Photo</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Student Photo</h3>
          <PhotoCapture photo={photo} onPhotoChange={setPhoto} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Required Documents</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Birth Certificate</p>
            <p>• Previous School Transfer Certificate</p>
            <p>• Previous School Mark Sheet</p>
            <p>• Aadhar Card Copy</p>
            <p>• Passport Size Photos</p>
            <p>• Caste Certificate (if applicable)</p>
            <p>• Income Certificate (if applicable)</p>
          </div>
        </div>
      </div>

      <DocumentUpload
        documents={documents}
        onDocumentAdd={handleDocumentAdd}
        onDocumentRemove={handleDocumentRemove}
      />
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Fee Structure</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="feeStructureId"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium mb-1">
                Fee Structure *
              </label>
              <select
                {...field}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.feeStructureId ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select Fee Structure</option>
                {feeStructuresData?.data?.map(structure => (
                  <option key={structure.id} value={structure.id}>
                    {structure.name} - ₹{structure.totalAmount}
                  </option>
                ))}
              </select>
              {errors.feeStructureId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.feeStructureId.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="discount"
          control={control}
          render={({ field }) => (
            <Input
              label="Discount (%)"
              type="number"
              min="0"
              max="100"
              {...field}
              onChange={e => field.onChange(Number(e.target.value))}
              error={errors.discount?.message}
            />
          )}
        />
      </div>

      <Controller
        name="scholarshipApplied"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.value}
              onChange={field.onChange}
            />
            Scholarship Applied
          </label>
        )}
      />

      {/* Fee Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Fee Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Fee:</span>
            <span>₹10,000</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-₹500</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-2">
            <span>Total Amount:</span>
            <span>₹9,500</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Admission</h1>
        <button
          onClick={() => setShowPreview(true)}
          className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {renderStepIndicator()}

        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="border px-6 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={admissionMutation.isPending}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {admissionMutation.isPending
                  ? 'Submitting...'
                  : 'Submit Admission'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentAdmission
