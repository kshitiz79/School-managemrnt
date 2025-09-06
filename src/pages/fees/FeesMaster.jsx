import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Calendar,
  Users,
  Percent,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  Save,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { feesApi } from '../../lib/api/fees'

const FeeGroupCard = ({
  feeGroup,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
}) => {
  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'inactive':
        return 'text-gray-600 bg-gray-100'
      case 'draft':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTotalAmount = () => {
    return (
      feeGroup.feeTypes?.reduce((sum, type) => sum + (type.amount || 0), 0) || 0
    )
  }

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{feeGroup.name}</h3>
          <p className="text-sm text-gray-600">{feeGroup.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feeGroup.status)}`}
          >
            {feeGroup.status.charAt(0).toUpperCase() + feeGroup.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Academic Year:</span>
            <div className="font-medium">{feeGroup.academicYear}</div>
          </div>
          <div>
            <span className="text-gray-500">Classes:</span>
            <div className="font-medium">
              {feeGroup.applicableClasses?.length || 0} classes
            </div>
          </div>
          <div>
            <span className="text-gray-500">Fee Types:</span>
            <div className="font-medium">
              {feeGroup.feeTypes?.length || 0} types
            </div>
          </div>
          <div>
            <span className="text-gray-500">Total Amount:</span>
            <div className="font-medium text-green-600">
              ₹{getTotalAmount().toLocaleString()}
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="text-sm text-gray-600 mb-2">Due Dates:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>First Installment:</span>
              <span className="font-medium">
                {new Date(feeGroup.dueDate1).toLocaleDateString()}
              </span>
            </div>
            {feeGroup.dueDate2 && (
              <div className="flex justify-between">
                <span>Second Installment:</span>
                <span className="font-medium">
                  {new Date(feeGroup.dueDate2).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {feeGroup.concessions?.length > 0 && (
          <div className="border-t pt-3">
            <div className="text-sm text-gray-600 mb-2">
              Concessions Available:
            </div>
            <div className="flex flex-wrap gap-1">
              {feeGroup.concessions.slice(0, 3).map((concession, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {concession.name}
                </span>
              ))}
              {feeGroup.concessions.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{feeGroup.concessions.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Created: {new Date(feeGroup.createdAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(feeGroup)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(feeGroup)}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(feeGroup)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(feeGroup)}
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

const FeeGroupDialog = ({ feeGroup, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: feeGroup?.name || '',
    description: feeGroup?.description || '',
    academicYear: feeGroup?.academicYear || '2024-25',
    status: feeGroup?.status || 'draft',
    applicableClasses: feeGroup?.applicableClasses || [],
    feeTypes: feeGroup?.feeTypes || [],
    dueDate1: feeGroup?.dueDate1 || '',
    dueDate2: feeGroup?.dueDate2 || '',
    dueDate3: feeGroup?.dueDate3 || '',
    installmentType: feeGroup?.installmentType || 'single',
    lateFeeApplicable: feeGroup?.lateFeeApplicable || false,
    lateFeeAmount: feeGroup?.lateFeeAmount || 0,
    lateFeeType: feeGroup?.lateFeeType || 'fixed',
    concessions: feeGroup?.concessions || [],
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => feesApi.getClasses(),
  })

  const { data: feeTypesData } = useQuery({
    queryKey: ['fee-types', 'all'],
    queryFn: () => feesApi.getFeeTypes(),
  })

  const { data: concessionsData } = useQuery({
    queryKey: ['concessions', 'all'],
    queryFn: () => feesApi.getConcessions(),
  })

  const handleSave = () => {
    onSave(feeGroup?.id, formData)
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

  const addFeeType = feeTypeId => {
    const feeType = feeTypesData?.data?.find(ft => ft.id === feeTypeId)
    if (feeType && !formData.feeTypes.find(ft => ft.id === feeTypeId)) {
      setFormData(prev => ({
        ...prev,
        feeTypes: [
          ...prev.feeTypes,
          { ...feeType, amount: feeType.defaultAmount || 0 },
        ],
      }))
    }
  }

  const removeFeeType = feeTypeId => {
    setFormData(prev => ({
      ...prev,
      feeTypes: prev.feeTypes.filter(ft => ft.id !== feeTypeId),
    }))
  }

  const updateFeeTypeAmount = (feeTypeId, amount) => {
    setFormData(prev => ({
      ...prev,
      feeTypes: prev.feeTypes.map(ft =>
        ft.id === feeTypeId ? { ...ft, amount: parseFloat(amount) || 0 } : ft
      ),
    }))
  }

  const toggleConcession = concessionId => {
    setFormData(prev => ({
      ...prev,
      concessions: prev.concessions.includes(concessionId)
        ? prev.concessions.filter(id => id !== concessionId)
        : [...prev.concessions, concessionId],
    }))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={feeGroup ? 'Edit Fee Group' : 'Create Fee Group'}
      size="xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fee Group Name *"
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Annual Fees 2024-25"
          />
          <div>
            <label className="block text-sm font-medium mb-1">
              Academic Year *
            </label>
            <select
              value={formData.academicYear}
              onChange={e =>
                setFormData(prev => ({ ...prev, academicYear: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
              <option value="2023-24">2023-24</option>
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
            placeholder="Fee group description..."
          />
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

        {/* Fee Types */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Fee Types *</label>
            <select
              onChange={e => {
                if (e.target.value) {
                  addFeeType(e.target.value)
                  e.target.value = ''
                }
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">Add Fee Type</option>
              {feeTypesData?.data?.map(feeType => (
                <option key={feeType.id} value={feeType.id}>
                  {feeType.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {Array.isArray(formData.feeTypes) &&
              formData.feeTypes.map(feeType => (
                <div
                  key={feeType.id}
                  className="flex items-center gap-2 p-2 border rounded"
                >
                  <span className="flex-1 text-sm">{feeType.name}</span>
                  <Input
                    type="number"
                    value={feeType.amount}
                    onChange={e =>
                      updateFeeTypeAmount(feeType.id, e.target.value)
                    }
                    placeholder="Amount"
                    className="w-24"
                  />
                  <button
                    onClick={() => removeFeeType(feeType.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Installment Configuration */}
        <div>
          <h3 className="font-medium mb-3">Installment Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Installment Type
              </label>
              <select
                value={formData.installmentType}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    installmentType: e.target.value,
                  }))
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="single">Single Payment</option>
                <option value="two">Two Installments</option>
                <option value="three">Three Installments</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e =>
                  setFormData(prev => ({ ...prev, status: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              label="First Due Date *"
              type="date"
              value={formData.dueDate1}
              onChange={e =>
                setFormData(prev => ({ ...prev, dueDate1: e.target.value }))
              }
            />
            {(formData.installmentType === 'two' ||
              formData.installmentType === 'three') && (
              <Input
                label="Second Due Date"
                type="date"
                value={formData.dueDate2}
                onChange={e =>
                  setFormData(prev => ({ ...prev, dueDate2: e.target.value }))
                }
              />
            )}
            {formData.installmentType === 'three' && (
              <Input
                label="Third Due Date"
                type="date"
                value={formData.dueDate3}
                onChange={e =>
                  setFormData(prev => ({ ...prev, dueDate3: e.target.value }))
                }
              />
            )}
          </div>
        </div>

        {/* Late Fee Configuration */}
        <div>
          <h3 className="font-medium mb-3">Late Fee Configuration</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.lateFeeApplicable}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    lateFeeApplicable: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span className="text-sm font-medium">
                Apply late fee for overdue payments
              </span>
            </label>

            {formData.lateFeeApplicable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Late Fee Type
                  </label>
                  <select
                    value={formData.lateFeeType}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        lateFeeType: e.target.value,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <Input
                  label={`Late Fee ${formData.lateFeeType === 'percentage' ? '(%)' : '(₹)'}`}
                  type="number"
                  value={formData.lateFeeAmount}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      lateFeeAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  min="0"
                />
              </div>
            )}
          </div>
        </div>

        {/* Available Concessions */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Available Concessions
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {concessionsData?.data?.map(concession => (
              <label key={concession.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.concessions.includes(concession.id)}
                  onChange={() => toggleConcession(concession.id)}
                  className="rounded"
                />
                <span className="text-sm">{concession.name}</span>
              </label>
            ))}
          </div>
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
              !formData.name.trim() ||
              formData.applicableClasses.length === 0 ||
              formData.feeTypes.length === 0
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {feeGroup ? 'Update' : 'Create'} Fee Group
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const FeeTypesTab = () => {
  const [selectedFeeType, setSelectedFeeType] = useState(null)
  const [showFeeTypeDialog, setShowFeeTypeDialog] = useState(false)

  const { data: feeTypesData, isLoading } = useQuery({
    queryKey: ['fee-types', 'all'],
    queryFn: () => feesApi.getFeeTypes(),
  })

  const queryClient = useQueryClient()

  const saveFeeTypeMutation = useMutation({
    mutationFn: ({ id, data }) =>
      id ? feesApi.updateFeeType(id, data) : feesApi.createFeeType(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-types'])
      setShowFeeTypeDialog(false)
      setSelectedFeeType(null)
    },
  })

  const deleteFeeTypeMutation = useMutation({
    mutationFn: feesApi.deleteFeeType,
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-types'])
    },
  })

  const handleSaveFeeType = (id, data) => {
    saveFeeTypeMutation.mutate({ id, data })
  }

  const handleDeleteFeeType = feeType => {
    if (confirm(`Are you sure you want to delete "${feeType.name}"?`)) {
      deleteFeeTypeMutation.mutate(feeType.id)
    }
  }

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Fee Types</h3>
        <button
          onClick={() => {
            setSelectedFeeType(null)
            setShowFeeTypeDialog(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Fee Type
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-left py-3 px-4">Default Amount</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-center py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {feeTypesData?.data?.map(feeType => (
              <tr key={feeType.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium">{feeType.name}</div>
                  <div className="text-sm text-gray-500">
                    {feeType.description}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {feeType.category}
                  </span>
                </td>
                <td className="py-3 px-4">
                  ₹{feeType.defaultAmount?.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      feeType.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {feeType.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedFeeType(feeType)
                        setShowFeeTypeDialog(true)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFeeType(feeType)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fee Type Dialog would go here */}
    </div>
  )
}

const ConcessionsTab = () => {
  const [selectedConcession, setSelectedConcession] = useState(null)
  const [showConcessionDialog, setShowConcessionDialog] = useState(false)

  const { data: concessionsData, isLoading } = useQuery({
    queryKey: ['concessions', 'all'],
    queryFn: () => feesApi.getConcessions(),
  })

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Fee Concessions</h3>
        <button
          onClick={() => {
            setSelectedConcession(null)
            setShowConcessionDialog(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Concession
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {concessionsData?.data?.map(concession => (
          <div key={concession.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{concession.name}</h4>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  concession.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {concession.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {concession.description}
            </p>
            <div className="text-sm">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">{concession.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Value:</span>
                <span className="font-medium">
                  {concession.type === 'percentage'
                    ? `${concession.value}%`
                    : `₹${concession.value}`}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setSelectedConcession(concession)
                  setShowConcessionDialog(true)
                }}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const FeesMaster = () => {
  const [activeTab, setActiveTab] = useState('groups')
  const [selectedFeeGroup, setSelectedFeeGroup] = useState(null)
  const [showFeeGroupDialog, setShowFeeGroupDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const queryClient = useQueryClient()

  const { data: feeGroupsData, isLoading } = useQuery({
    queryKey: ['fee-groups', 'all'],
    queryFn: () => feesApi.getFeeGroups(),
  })

  const saveFeeGroupMutation = useMutation({
    mutationFn: ({ id, data }) =>
      id ? feesApi.updateFeeGroup(id, data) : feesApi.createFeeGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-groups'])
      setShowFeeGroupDialog(false)
      setSelectedFeeGroup(null)
    },
  })

  const deleteFeeGroupMutation = useMutation({
    mutationFn: feesApi.deleteFeeGroup,
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-groups'])
    },
  })

  const duplicateFeeGroupMutation = useMutation({
    mutationFn: feesApi.duplicateFeeGroup,
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-groups'])
    },
  })

  const handleEditFeeGroup = feeGroup => {
    setSelectedFeeGroup(feeGroup)
    setShowFeeGroupDialog(true)
  }

  const handleDeleteFeeGroup = feeGroup => {
    if (confirm(`Are you sure you want to delete "${feeGroup.name}"?`)) {
      deleteFeeGroupMutation.mutate(feeGroup.id)
    }
  }

  const handleDuplicateFeeGroup = feeGroup => {
    duplicateFeeGroupMutation.mutate(feeGroup.id)
  }

  const handleViewDetails = feeGroup => {
    setSelectedFeeGroup(feeGroup)
    setShowDetailsDialog(true)
  }

  const handleSaveFeeGroup = (id, data) => {
    saveFeeGroupMutation.mutate({ id, data })
  }

  const handleAddFeeGroup = () => {
    setSelectedFeeGroup(null)
    setShowFeeGroupDialog(true)
  }

  const filteredFeeGroups =
    feeGroupsData?.data?.filter(feeGroup => {
      const matchesStatus =
        filterStatus === 'all' || feeGroup.status === filterStatus
      const matchesSearch =
        feeGroup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feeGroup.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesStatus && matchesSearch
    }) || []

  const tabs = [
    { id: 'groups', label: 'Fee Groups', icon: DollarSign },
    { id: 'types', label: 'Fee Types', icon: Settings },
    { id: 'concessions', label: 'Concessions', icon: Percent },
  ]

  if (isLoading && activeTab === 'groups') return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fees Master</h1>
        {activeTab === 'groups' && (
          <button
            onClick={handleAddFeeGroup}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Fee Group
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {Array.isArray(tabs) &&
              tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'groups' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search fee groups..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg w-full"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
                <div className="text-sm text-gray-500 flex items-center">
                  Showing {filteredFeeGroups.length} of{' '}
                  {feeGroupsData?.data?.length || 0} fee groups
                </div>
              </div>
            </div>

            {/* Fee Groups List */}
            <div className="space-y-4">
              {filteredFeeGroups.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Fee Groups Found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {feeGroupsData?.data?.length === 0
                      ? 'Create your first fee group to get started.'
                      : 'No fee groups match your current filters.'}
                  </p>
                  {feeGroupsData?.data?.length === 0 && (
                    <button
                      onClick={handleAddFeeGroup}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Create Fee Group
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Array.isArray(filteredFeeGroups) &&
                    filteredFeeGroups.map(feeGroup => (
                      <FeeGroupCard
                        key={feeGroup.id}
                        feeGroup={feeGroup}
                        onEdit={handleEditFeeGroup}
                        onDelete={handleDeleteFeeGroup}
                        onDuplicate={handleDuplicateFeeGroup}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'types' && <FeeTypesTab />}
        {activeTab === 'concessions' && <ConcessionsTab />}
      </div>

      {/* Fee Group Dialog */}
      <FeeGroupDialog
        feeGroup={selectedFeeGroup}
        open={showFeeGroupDialog}
        onClose={() => setShowFeeGroupDialog(false)}
        onSave={handleSaveFeeGroup}
      />
    </div>
  )
}

export default FeesMaster
