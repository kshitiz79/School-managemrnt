import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  User,
  Calendar,
  Clock,
  FileText,
  Save,
  Search,
  Plus,
  X,
  Upload,
  Camera,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { behaviourApi } from '../../lib/api/behaviour'

// Validation Schema
const incidentSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  categoryId: z.string().min(1, 'Category is required'),
  severity: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Severity is required',
  }),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  witnesses: z.array(z.string()).optional(),
  actionTaken: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  parentNotification: z.boolean().default(true),
})

const StudentSelector = ({ onSelect, selectedStudent }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'search', searchTerm],
    queryFn: () => behaviourApi.searchStudents(searchTerm),
    enabled: searchTerm.length > 2,
  })

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Student *
      </label>
      {selectedStudent ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="font-medium">{selectedStudent.name}</div>
              <div className="text-sm text-gray-500">
                {selectedStudent.className} - {selectedStudent.section} | Roll:{' '}
                {selectedStudent.rollNumber}
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelect(null)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search student by name, roll number..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {showSearch && searchTerm.length > 2 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {studentsData?.data?.length > 0 ? (
                studentsData.data.map(student => (
                  <button
                    key={student.id}
                    onClick={() => {
                      onSelect(student)
                      setShowSearch(false)
                      setSearchTerm('')
                    }}
                    className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">
                        {student.className} - {student.section} | Roll:{' '}
                        {student.rollNumber}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-center">
                  No students found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const WitnessSelector = ({ witnesses, onWitnessesChange }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const { data: staffData } = useQuery({
    queryKey: ['staff', 'search', searchTerm],
    queryFn: () => behaviourApi.searchStaff(searchTerm),
    enabled: searchTerm.length > 2,
  })

  const addWitness = witness => {
    if (!witnesses.includes(witness.id)) {
      onWitnessesChange([...witnesses, witness.id])
    }
    setSearchTerm('')
    setShowSearch(false)
  }

  const removeWitness = witnessId => {
    onWitnessesChange(witnesses.filter(id => id !== witnessId))
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Witnesses
      </label>

      {witnesses.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {Array.isArray(witnesses) &&
            witnesses.map(witnessId => (
              <span
                key={witnessId}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                Staff Member {witnessId}
                <button
                  onClick={() => removeWitness(witnessId)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search staff members..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => setShowSearch(true)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      {showSearch && searchTerm.length > 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {staffData?.data?.length > 0 ? (
            staffData.data.map(staff => (
              <button
                key={staff.id}
                onClick={() => addWitness(staff)}
                className="w-full p-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="font-medium text-sm">{staff.name}</div>
                  <div className="text-xs text-gray-500">
                    {staff.department}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-2 text-gray-500 text-center text-sm">
              No staff found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const AssignIncident = () => {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [witnesses, setWitnesses] = useState([])
  const [attachments, setAttachments] = useState([])
  const [showPreview, setShowPreview] = useState(false)

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      severity: 'medium',
      followUpRequired: false,
      parentNotification: true,
    },
  })

  const watchFollowUp = watch('followUpRequired')

  const { data: categoriesData } = useQuery({
    queryKey: ['behaviour', 'categories'],
    queryFn: () => behaviourApi.getCategories(),
  })

  const createIncidentMutation = useMutation({
    mutationFn: behaviourApi.createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries(['behaviour', 'incidents'])
      reset()
      setSelectedStudent(null)
      setWitnesses([])
      setAttachments([])
    },
  })

  const onSubmit = data => {
    const incidentData = {
      ...data,
      studentId: selectedStudent?.id,
      witnesses,
      attachments: Array.isArray(attachments)
        ? attachments.map(att => att.name)
        : [],
      reportedBy: 'current-user', // In real app, get from auth
      reportedAt: new Date().toISOString(),
    }

    createIncidentMutation.mutate(incidentData)
  }

  const getSeverityColor = severity => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'critical':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleFileUpload = event => {
    const files = Array.from(event.target.files)
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = index => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Assign Incident</h1>
        <button
          onClick={() => setShowPreview(true)}
          className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Preview
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Incident Details</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <StudentSelector
                onSelect={setSelectedStudent}
                selectedStudent={selectedStudent}
              />
              {!selectedStudent && (
                <p className="text-red-500 text-sm">Please select a student</p>
              )}

              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category *
                    </label>
                    <select
                      {...field}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        errors.categoryId ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Category</option>
                      {Array.isArray(categoriesData?.data) &&
                        categoriesData.data.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                    {errors.categoryId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="severity"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Severity *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['low', 'medium', 'high', 'critical'].map(severity => (
                        <label
                          key={severity}
                          className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer ${
                            field.value === severity
                              ? getSeverityColor(severity)
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            {...field}
                            value={severity}
                            className="sr-only"
                          />
                          <span className="capitalize font-medium">
                            {severity}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              />

              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Incident Title *"
                    {...field}
                    error={errors.title?.message}
                    placeholder="Brief title of the incident"
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Date *"
                      type="date"
                      {...field}
                      error={errors.date?.message}
                    />
                  )}
                />
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Time *"
                      type="time"
                      {...field}
                      error={errors.time?.message}
                    />
                  )}
                />
              </div>

              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Location *"
                    {...field}
                    error={errors.location?.message}
                    placeholder="Where did the incident occur?"
                  />
                )}
              />

              <WitnessSelector
                witnesses={witnesses}
                onWitnessesChange={setWitnesses}
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Attachments
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Upload files
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Photo
                    </button>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-1">
                      {Array.isArray(attachments) &&
                        attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Description & Action</h2>

          <div className="space-y-4">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Detailed Description *
                  </label>
                  <textarea
                    {...field}
                    rows={4}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                    placeholder="Provide a detailed description of the incident..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="actionTaken"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Immediate Action Taken
                  </label>
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Describe any immediate actions taken..."
                  />
                </div>
              )}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">
            Follow-up & Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Controller
                name="followUpRequired"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">
                      Follow-up required
                    </span>
                  </label>
                )}
              />

              <Controller
                name="parentNotification"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Notify parents</span>
                  </label>
                )}
              />
            </div>

            {watchFollowUp && (
              <Controller
                name="followUpDate"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Follow-up Date"
                    type="date"
                    {...field}
                    className="max-w-xs"
                  />
                )}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              reset()
              setSelectedStudent(null)
              setWitnesses([])
              setAttachments([])
            }}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={createIncidentMutation.isPending || !selectedStudent}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {createIncidentMutation.isPending ? 'Saving...' : 'Save Incident'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AssignIncident
