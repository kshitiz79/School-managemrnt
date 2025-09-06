import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Percent,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  Save,
  Award,
  UserCheck,
  GraduationCap,
  Heart,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { feesApi } from '../../lib/api/fees'

const DiscountCard = ({
  discount,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onApplyToStudents,
}) => {
  const getDiscountTypeIcon = type => {
    switch (type) {
      case 'sibling':
        return <Users className="w-5 h-5 text-blue-600" />
      case 'merit':
        return <Award className="w-5 h-5 text-yellow-600" />
      case 'staff':
        return <UserCheck className="w-5 h-5 text-green-600" />
      case 'scholarship':
        return <GraduationCap className="w-5 h-5 text-purple-600" />
      case 'financial_aid':
        return <Heart className="w-5 h-5 text-red-600" />
      default:
        return <Percent className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'inactive':
        return 'text-gray-600 bg-gray-100'
      case 'expired':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getDiscountValue = () => {
    if (discount.discountType === 'percentage') {
      return `${discount.value}%`
    } else {
      return `₹${discount.value.toLocaleString()}`
    }
  }

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {getDiscountTypeIcon(discount.category)}
          <div>
            <h3 className="text-lg font-semibold">{discount.name}</h3>
            <p className="text-sm text-gray-600">{discount.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(discount.status)}`}
          >
            {discount.status.charAt(0).toUpperCase() + discount.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Discount Value:</span>
          <div className="font-medium text-lg text-green-600">
            {getDiscountValue()}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Category:</span>
          <div className="font-medium capitalize">
            {discount.category.replace('_', ' ')}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Applicable Classes:</span>
          <div className="font-medium">
            {discount.applicableClasses?.length || 0} classes
          </div>
        </div>
        <div>
          <span className="text-gray-500">Students Applied:</span>
          <div className="font-medium">
            {discount.studentsCount || 0} students
          </div>
        </div>
      </div>

      {discount.conditions && discount.conditions.length > 0 && (
        <div className="border-t pt-3 mb-4">
          <div className="text-sm text-gray-600 mb-2">Conditions:</div>
          <div className="space-y-1">
            {discount.conditions.slice(0, 2).map((condition, index) => (
              <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                {condition.description}
              </div>
            ))}
            {discount.conditions.length > 2 && (
              <div className="text-sm text-gray-500">
                +{discount.conditions.length - 2} more conditions
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t pt-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Valid From:</span>
            <div className="font-medium">
              {new Date(discount.validFrom).toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Valid Until:</span>
            <div className="font-medium">
              {discount.validUntil
                ? new Date(discount.validUntil).toLocaleDateString()
                : 'No expiry'}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Max Usage:</span>
            <div className="font-medium">
              {discount.maxUsage || 'Unlimited'}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Used:</span>
            <div className="font-medium">{discount.usageCount || 0} times</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Created: {new Date(discount.createdAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(discount)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onApplyToStudents(discount)}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Apply to Students"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(discount)}
            className="p-1 text-gray-400 hover:text-purple-600"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(discount)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(discount)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const DiscountDialog = ({ discount, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: discount?.name || '',
    description: discount?.description || '',
    category: discount?.category || 'general',
    discountType: discount?.discountType || 'percentage',
    value: discount?.value || 0,
    applicableClasses: discount?.applicableClasses || [],
    applicableFeeTypes: discount?.applicableFeeTypes || [],
    validFrom: discount?.validFrom || new Date().toISOString().split('T')[0],
    validUntil: discount?.validUntil || '',
    maxUsage: discount?.maxUsage || '',
    status: discount?.status || 'active',
    conditions: discount?.conditions || [],
    autoApply: discount?.autoApply || false,
    stackable: discount?.stackable || false,
    priority: discount?.priority || 1,
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => feesApi.getClasses(),
  })

  const { data: feeTypesData } = useQuery({
    queryKey: ['fee-types', 'all'],
    queryFn: () => feesApi.getFeeTypes(),
  })

  const handleSave = () => {
    onSave(discount?.id, formData)
    onClose()
  }

  const toggleClass = classId => {
    setFormData(prev => ({
      ...prev,
      applicableClasses: prev.applicableClasses.includes(classId)
        ? prev.applicableClasses.filter(id => id !== classId)
        : [...prev.applicableClasses, classId],
    }))
  }

  const toggleFeeType = feeTypeId => {
    setFormData(prev => ({
      ...prev,
      applicableFeeTypes: prev.applicableFeeTypes.includes(feeTypeId)
        ? prev.applicableFeeTypes.filter(id => id !== feeTypeId)
        : [...prev.applicableFeeTypes, feeTypeId],
    }))
  }

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { type: 'minimum_amount', value: '', description: '' },
      ],
    }))
  }

  const updateCondition = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition
      ),
    }))
  }

  const removeCondition = index => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }))
  }

  const discountCategories = [
    { value: 'general', label: 'General Discount' },
    { value: 'sibling', label: 'Sibling Discount' },
    { value: 'merit', label: 'Merit Scholarship' },
    { value: 'staff', label: 'Staff Discount' },
    { value: 'scholarship', label: 'Scholarship' },
    { value: 'financial_aid', label: 'Financial Aid' },
    { value: 'early_payment', label: 'Early Payment' },
    { value: 'bulk_payment', label: 'Bulk Payment' },
  ]

  const conditionTypes = [
    { value: 'minimum_amount', label: 'Minimum Amount' },
    { value: 'grade_requirement', label: 'Grade Requirement' },
    { value: 'attendance_requirement', label: 'Attendance Requirement' },
    { value: 'sibling_count', label: 'Number of Siblings' },
    { value: 'payment_date', label: 'Payment Before Date' },
  ]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={discount ? 'Edit Discount' : 'Create Discount'}
      size="xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Discount Name *"
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Sibling Discount 2024"
          />
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={e =>
                setFormData(prev => ({ ...prev, category: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              {Array.isArray(discountCategories) &&
                discountCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={e =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Discount description..."
          />
        </div>

        {/* Discount Configuration */}
        <div>
          <h3 className="font-medium mb-3">Discount Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Discount Type *
              </label>
              <select
                value={formData.discountType}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    discountType: e.target.value,
                  }))
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <Input
              label={`Discount Value * ${formData.discountType === 'percentage' ? '(%)' : '(₹)'}`}
              type="number"
              value={formData.value}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  value: parseFloat(e.target.value) || 0,
                }))
              }
              min="0"
              max={formData.discountType === 'percentage' ? 100 : undefined}
            />
            <Input
              label="Priority (1-10)"
              type="number"
              value={formData.priority}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  priority: parseInt(e.target.value) || 1,
                }))
              }
              min="1"
              max="10"
            />
          </div>
        </div>

        {/* Validity Period */}
        <div>
          <h3 className="font-medium mb-3">Validity Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Valid From *"
              type="date"
              value={formData.validFrom}
              onChange={e =>
                setFormData(prev => ({ ...prev, validFrom: e.target.value }))
              }
            />
            <Input
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={e =>
                setFormData(prev => ({ ...prev, validUntil: e.target.value }))
              }
            />
            <Input
              label="Max Usage (Optional)"
              type="number"
              value={formData.maxUsage}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  maxUsage: parseInt(e.target.value) || '',
                }))
              }
              placeholder="Unlimited"
            />
          </div>
        </div>

        {/* Applicable Classes */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Applicable Classes *
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
            {Array.isArray(classesData?.data) &&
              classesData.data.map(cls => (
                <label key={cls.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.applicableClasses.includes(cls.id)}
                    onChange={() => toggleClass(cls.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{cls.name}</span>
                </label>
              ))}
          </div>
        </div>

        {/* Applicable Fee Types */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Applicable Fee Types
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {feeTypesData?.data?.map(feeType => (
              <label key={feeType.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.applicableFeeTypes.includes(feeType.id)}
                  onChange={() => toggleFeeType(feeType.id)}
                  className="rounded"
                />
                <span className="text-sm">{feeType.name}</span>
              </label>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Leave empty to apply to all fee types
          </div>
        </div>

        {/* Conditions */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Conditions</h3>
            <button
              onClick={addCondition}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Condition
            </button>
          </div>
          <div className="space-y-3">
            {Array.isArray(formData.conditions) &&
              formData.conditions.map((condition, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded"
                >
                  <select
                    value={condition.type}
                    onChange={e =>
                      updateCondition(index, 'type', e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {Array.isArray(conditionTypes) &&
                      conditionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                  </select>
                  <input
                    type="text"
                    value={condition.value}
                    onChange={e =>
                      updateCondition(index, 'value', e.target.value)
                    }
                    placeholder="Value"
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="text"
                    value={condition.description}
                    onChange={e =>
                      updateCondition(index, 'description', e.target.value)
                    }
                    placeholder="Description"
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => removeCondition(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <h3 className="font-medium mb-3">Advanced Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.autoApply}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    autoApply: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span className="text-sm">
                Auto-apply when conditions are met
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.stackable}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    stackable: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span className="text-sm">
                Can be combined with other discounts
              </span>
            </label>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={e =>
              setFormData(prev => ({ ...prev, status: e.target.value }))
            }
            className="w-full border rounded-lg px-3 py-2 max-w-xs"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={
              !formData.name.trim() || formData.applicableClasses.length === 0
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {discount ? 'Update' : 'Create'} Discount
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const ApplyDiscountDialog = ({ discount, open, onClose, onApply }) => {
  const [selectedStudents, setSelectedStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('')

  const { data: studentsData, isLoading } = useQuery({
    queryKey: [
      'students',
      'eligible-for-discount',
      discount?.id,
      searchTerm,
      filterClass,
    ],
    queryFn: () =>
      feesApi.getEligibleStudents(discount?.id, {
        searchTerm,
        classId: filterClass,
      }),
    enabled: !!discount && open,
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => feesApi.getClasses(),
  })

  const handleApply = () => {
    onApply(discount.id, selectedStudents)
    onClose()
    setSelectedStudents([])
  }

  const toggleStudent = studentId => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const toggleAll = () => {
    const allStudentIds = studentsData?.data?.map(s => s.id) || []
    setSelectedStudents(prev =>
      prev.length === allStudentIds.length ? [] : allStudentIds
    )
  }

  if (!discount) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Apply ${discount.name}`}
      size="xl"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Discount Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium ml-2">
                {discount.discountType === 'percentage'
                  ? `${discount.value}%`
                  : `₹${discount.value}`}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Category:</span>
              <span className="font-medium ml-2 capitalize">
                {discount.category.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Classes</option>
            {Array.isArray(classesData?.data) &&
              classesData.data.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
          </select>
        </div>

        {/* Student Selection */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Eligible Students</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedStudents.length} of {studentsData?.data?.length || 0}{' '}
                selected
              </span>
              <button
                onClick={toggleAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectedStudents.length === studentsData?.data?.length
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedStudents.length ===
                            studentsData?.data?.length &&
                          studentsData?.data?.length > 0
                        }
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Class</th>
                    <th className="text-right py-3 px-4">Current Due</th>
                    <th className="text-right py-3 px-4">Discount Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(studentsData?.data) &&
                    studentsData.data.map(student => {
                      const discountAmount =
                        discount.discountType === 'percentage'
                          ? (student.totalDue * discount.value) / 100
                          : discount.value

                      return (
                        <tr
                          key={student.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => toggleStudent(student.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-gray-500">
                              Roll: {student.rollNumber}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {student.className} - {student.section}
                          </td>
                          <td className="py-3 px-4 text-right">
                            ₹{student.totalDue?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-green-600 font-medium">
                            ₹
                            {Math.min(
                              discountAmount,
                              student.totalDue,
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={selectedStudents.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Apply to {selectedStudents.length} Students
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const FeesDiscount = () => {
  const [selectedDiscount, setSelectedDiscount] = useState(null)
  const [showDiscountDialog, setShowDiscountDialog] = useState(false)
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const queryClient = useQueryClient()

  const { data: discountsData, isLoading } = useQuery({
    queryKey: ['discounts', 'all'],
    queryFn: () => feesApi.getDiscounts(),
  })

  const saveDiscountMutation = useMutation({
    mutationFn: ({ id, data }) =>
      id ? feesApi.updateDiscount(id, data) : feesApi.createDiscount(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discounts'])
      setShowDiscountDialog(false)
      setSelectedDiscount(null)
    },
  })

  const deleteDiscountMutation = useMutation({
    mutationFn: feesApi.deleteDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries(['discounts'])
    },
  })

  const applyDiscountMutation = useMutation({
    mutationFn: ({ discountId, studentIds }) =>
      feesApi.applyDiscountToStudents(discountId, studentIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['discounts'])
      setShowApplyDialog(false)
    },
  })

  const handleEditDiscount = discount => {
    setSelectedDiscount(discount)
    setShowDiscountDialog(true)
  }

  const handleDeleteDiscount = discount => {
    if (confirm(`Are you sure you want to delete "${discount.name}"?`)) {
      deleteDiscountMutation.mutate(discount.id)
    }
  }

  const handleDuplicateDiscount = discount => {
    const duplicatedDiscount = {
      ...discount,
      name: `${discount.name} (Copy)`,
      id: undefined,
    }
    setSelectedDiscount(duplicatedDiscount)
    setShowDiscountDialog(true)
  }

  const handleViewDetails = discount => {
    setSelectedDiscount(discount)
    setShowDetailsDialog(true)
  }

  const handleApplyToStudents = discount => {
    setSelectedDiscount(discount)
    setShowApplyDialog(true)
  }

  const handleSaveDiscount = (id, data) => {
    saveDiscountMutation.mutate({ id, data })
  }

  const handleApplyDiscount = (discountId, studentIds) => {
    applyDiscountMutation.mutate({ discountId, studentIds })
  }

  const handleAddDiscount = () => {
    setSelectedDiscount(null)
    setShowDiscountDialog(true)
  }

  const filteredDiscounts =
    discountsData?.data?.filter(discount => {
      const matchesCategory =
        filterCategory === 'all' || discount.category === filterCategory
      const matchesStatus =
        filterStatus === 'all' || discount.status === filterStatus
      const matchesSearch =
        discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discount.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesStatus && matchesSearch
    }) || []

  const getStatistics = () => {
    const discounts = discountsData?.data || []
    const totalSavings = Array.isArray(discounts)
      ? discounts.reduce((sum, discount) => {
          return sum + (discount.totalSavings || 0)
        }, 0)
      : 0

    return {
      total: discounts.length,
      active: discounts.filter(d => d.status === 'active').length,
      totalSavings,
      studentsHelped: Array.isArray(discounts)
        ? discounts.reduce(
            (sum, discount) => sum + (discount.studentsCount || 0),
            0,
          )
        : 0,
    }
  }

  const stats = getStatistics()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fees Discount Management</h1>
        <button
          onClick={handleAddDiscount}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Discount
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Percent className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Discounts</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-gray-600">Active Discounts</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                ₹{stats.totalSavings.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Savings</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats.studentsHelped}</p>
              <p className="text-sm text-gray-600">Students Helped</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search discounts..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="sibling">Sibling</option>
            <option value="merit">Merit</option>
            <option value="staff">Staff</option>
            <option value="scholarship">Scholarship</option>
            <option value="financial_aid">Financial Aid</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <div className="text-sm text-gray-500 flex items-center">
            Showing {filteredDiscounts.length} of{' '}
            {discountsData?.data?.length || 0} discounts
          </div>
        </div>
      </div>

      {/* Discounts List */}
      <div className="space-y-4">
        {filteredDiscounts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Percent className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Discounts Found
            </h3>
            <p className="text-gray-500 mb-4">
              {discountsData?.data?.length === 0
                ? 'Create your first discount to get started.'
                : 'No discounts match your current filters.'}
            </p>
            {discountsData?.data?.length === 0 && (
              <button
                onClick={handleAddDiscount}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Discount
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.isArray(filteredDiscounts) &&
              filteredDiscounts.map(discount => (
                <DiscountCard
                  key={discount.id}
                  discount={discount}
                  onEdit={handleEditDiscount}
                  onDelete={handleDeleteDiscount}
                  onDuplicate={handleDuplicateDiscount}
                  onViewDetails={handleViewDetails}
                  onApplyToStudents={handleApplyToStudents}
                />
              ))}
          </div>
        )}
      </div>

      {/* Discount Dialog */}
      <DiscountDialog
        discount={selectedDiscount}
        open={showDiscountDialog}
        onClose={() => setShowDiscountDialog(false)}
        onSave={handleSaveDiscount}
      />

      {/* Apply Discount Dialog */}
      <ApplyDiscountDialog
        discount={selectedDiscount}
        open={showApplyDialog}
        onClose={() => setShowApplyDialog(false)}
        onApply={handleApplyDiscount}
      />
    </div>
  )
}

export default FeesDiscount
