import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  Users,
  Send,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  Save,
  RefreshCw,
  Smartphone,
  AtSign,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { feesApi } from '../../lib/api/fees'

const ReminderTemplateCard = ({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  onUse,
}) => {
  const getChannelIcon = channel => {
    switch (channel) {
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-green-600" />
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600" />
      case 'whatsapp':
        return <Smartphone className="w-5 h-5 text-green-500" />
      default:
        return <Mail className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'inactive':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {getChannelIcon(template.channel)}
          <div>
            <h3 className="text-lg font-semibold">{template.name}</h3>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(template.status)}`}
          >
            {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Channel:</span>
          <div className="font-medium capitalize">{template.channel}</div>
        </div>
        <div>
          <span className="text-gray-500">Category:</span>
          <div className="font-medium capitalize">
            {template.category.replace('_', ' ')}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Usage Count:</span>
          <div className="font-medium">{template.usageCount || 0} times</div>
        </div>
        <div>
          <span className="text-gray-500">Last Used:</span>
          <div className="font-medium">
            {template.lastUsed
              ? new Date(template.lastUsed).toLocaleDateString()
              : 'Never'}
          </div>
        </div>
      </div>

      <div className="border-t pt-3 mb-4">
        <div className="text-sm text-gray-600 mb-2">Template Preview:</div>
        <div className="text-sm bg-gray-50 p-3 rounded max-h-20 overflow-hidden">
          {template.content.substring(0, 150)}
          {template.content.length > 150 && '...'}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Created: {new Date(template.createdAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPreview(template)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUse(template)}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Use Template"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(template)}
            className="p-1 text-gray-400 hover:text-purple-600"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(template)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(template)}
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

const TemplateDialog = ({ template, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    channel: template?.channel || 'sms',
    category: template?.category || 'due_reminder',
    subject: template?.subject || '',
    content: template?.content || '',
    variables: template?.variables || [],
    status: template?.status || 'active',
    autoSend: template?.autoSend || false,
    sendConditions: template?.sendConditions || {
      daysBefore: 3,
      minimumAmount: 0,
      overdueOnly: false,
    },
  })

  const handleSave = () => {
    onSave(template?.id, formData)
    onClose()
  }

  const addVariable = () => {
    setFormData(prev => ({
      ...prev,
      variables: [
        ...prev.variables,
        { name: '', description: '', example: '' },
      ],
    }))
  }

  const updateVariable = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.map((variable, i) =>
        i === index ? { ...variable, [field]: value } : variable
      ),
    }))
  }

  const removeVariable = index => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }))
  }

  const insertVariable = variableName => {
    const textarea = document.getElementById('template-content')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.content
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)
    const newContent = `${before}{${variableName}}${after}`

    setFormData(prev => ({ ...prev, content: newContent }))

    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd =
        start + variableName.length + 2
      textarea.focus()
    }, 0)
  }

  const defaultVariables = [
    {
      name: 'studentName',
      description: 'Student full name',
      example: 'John Doe',
    },
    { name: 'rollNumber', description: 'Student roll number', example: '001' },
    { name: 'className', description: 'Class and section', example: 'X-A' },
    {
      name: 'fatherName',
      description: "Father's name",
      example: 'Mr. John Doe Sr.',
    },
    { name: 'dueAmount', description: 'Total due amount', example: '₹15,000' },
    { name: 'dueDate', description: 'Due date', example: '15-Apr-2024' },
    {
      name: 'schoolName',
      description: 'School name',
      example: 'Greenwood High School',
    },
    {
      name: 'contactNumber',
      description: 'Contact number',
      example: '+91 98765 43210',
    },
  ]

  const templateCategories = [
    { value: 'due_reminder', label: 'Due Reminder' },
    { value: 'overdue_notice', label: 'Overdue Notice' },
    { value: 'payment_confirmation', label: 'Payment Confirmation' },
    { value: 'discount_notification', label: 'Discount Notification' },
    { value: 'general_notice', label: 'General Notice' },
  ]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={template ? 'Edit Template' : 'Create Template'}
      size="xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Template Name *"
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Due Fee Reminder SMS"
          />
          <div>
            <label className="block text-sm font-medium mb-1">Channel *</label>
            <select
              value={formData.channel}
              onChange={e =>
                setFormData(prev => ({ ...prev, channel: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={e =>
                setFormData(prev => ({ ...prev, category: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              {Array.isArray(templateCategories) &&
                templateCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
            rows={2}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Template description..."
          />
        </div>

        {/* Subject (for email) */}
        {formData.channel === 'email' && (
          <Input
            label="Subject *"
            value={formData.subject}
            onChange={e =>
              setFormData(prev => ({ ...prev, subject: e.target.value }))
            }
            placeholder="Email subject line"
          />
        )}

        {/* Template Content */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">
              Template Content *
            </label>
            <div className="text-sm text-gray-500">
              Character count: {formData.content.length}
              {formData.channel === 'sms' && formData.content.length > 160 && (
                <span className="text-red-500 ml-2">
                  (SMS limit: 160 chars)
                </span>
              )}
            </div>
          </div>
          <textarea
            id="template-content"
            value={formData.content}
            onChange={e =>
              setFormData(prev => ({ ...prev, content: e.target.value }))
            }
            rows={formData.channel === 'email' ? 8 : 4}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Enter your template content here. Use {variableName} for dynamic content."
          />
        </div>

        {/* Variable Insertion */}
        <div>
          <h3 className="font-medium mb-3">Available Variables</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.isArray(defaultVariables) &&
              defaultVariables.map(variable => (
                <button
                  key={variable.name}
                  onClick={() => insertVariable(variable.name)}
                  className="text-left p-2 border rounded hover:bg-gray-50 text-sm"
                  title={`${variable.description} - Example: ${variable.example}`}
                >
                  <div className="font-mono text-blue-600">{`{${variable.name}}`}</div>
                  <div className="text-xs text-gray-500">
                    {variable.description}
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Auto-send Configuration */}
        <div>
          <h3 className="font-medium mb-3">Auto-send Configuration</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.autoSend}
                onChange={e =>
                  setFormData(prev => ({ ...prev, autoSend: e.target.checked }))
                }
                className="rounded"
              />
              <span className="text-sm font-medium">
                Enable automatic sending
              </span>
            </label>

            {formData.autoSend && (
              <div className="ml-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Days Before Due Date"
                    type="number"
                    value={formData.sendConditions.daysBefore}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        sendConditions: {
                          ...prev.sendConditions,
                          daysBefore: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    min="0"
                  />
                  <Input
                    label="Minimum Amount (₹)"
                    type="number"
                    value={formData.sendConditions.minimumAmount}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        sendConditions: {
                          ...prev.sendConditions,
                          minimumAmount: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    min="0"
                  />
                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.sendConditions.overdueOnly}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            sendConditions: {
                              ...prev.sendConditions,
                              overdueOnly: e.target.checked,
                            },
                          }))
                        }
                        className="rounded"
                      />
                      <span className="text-sm">Overdue only</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
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
            disabled={!formData.name.trim() || !formData.content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {template ? 'Update' : 'Create'} Template
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const SendReminderDialog = ({ template, open, onClose, onSend }) => {
  const [selectedStudents, setSelectedStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterOverdue, setFilterOverdue] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', 'due-fees', searchTerm, filterClass, filterOverdue],
    queryFn: () =>
      feesApi.getStudentsWithDueFees({
        searchTerm,
        classId: filterClass,
        overdueOnly: filterOverdue,
      }),
    enabled: open,
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => feesApi.getClasses(),
  })

  const handleSend = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student')
      return
    }

    setIsSending(true)
    try {
      await onSend({
        templateId: template.id,
        studentIds: selectedStudents,
        scheduleTime: isScheduled ? scheduleTime : null,
      })
      onClose()
      setSelectedStudents([])
    } catch (error) {
      console.error('Send error:', error)
      alert('Error sending reminders. Please try again.')
    } finally {
      setIsSending(false)
    }
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

  if (!template) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Send ${template.name}`}
      size="xl"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Template Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Channel:</span>
              <span className="font-medium ml-2 capitalize">
                {template.channel}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Category:</span>
              <span className="font-medium ml-2 capitalize">
                {template.category.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <label className="flex items-center gap-2 px-3 py-2">
            <input
              type="checkbox"
              checked={filterOverdue}
              onChange={e => setFilterOverdue(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Overdue only</span>
          </label>
        </div>

        {/* Student Selection */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Select Students</h3>
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
                    <th className="text-right py-3 px-4">Due Amount</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(studentsData?.data) &&
                    studentsData.data.map(student => (
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
                        <td className="py-3 px-4 text-right font-medium">
                          ₹{student.totalDue?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              student.isOverdue
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {student.isOverdue ? 'Overdue' : 'Due'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Schedule Options */}
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isScheduled}
              onChange={e => setIsScheduled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">Schedule for later</span>
          </label>

          {isScheduled && (
            <div className="ml-6">
              <Input
                label="Schedule Date & Time"
                type="datetime-local"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
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
            onClick={handleSend}
            disabled={selectedStudents.length === 0 || isSending}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isScheduled ? (
              <Calendar className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isSending ? 'Sending...' : isScheduled ? 'Schedule' : 'Send Now'} (
            {selectedStudents.length})
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const FeesReminder = () => {
  const [activeTab, setActiveTab] = useState('templates')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [filterChannel, setFilterChannel] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const queryClient = useQueryClient()

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['reminder-templates', 'all'],
    queryFn: () => feesApi.getReminderTemplates(),
  })

  const { data: reminderHistoryData } = useQuery({
    queryKey: ['reminder-history', 'recent'],
    queryFn: () => feesApi.getReminderHistory(),
    enabled: activeTab === 'history',
  })

  const saveTemplateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      id
        ? feesApi.updateReminderTemplate(id, data)
        : feesApi.createReminderTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reminder-templates'])
      setShowTemplateDialog(false)
      setSelectedTemplate(null)
    },
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: feesApi.deleteReminderTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries(['reminder-templates'])
    },
  })

  const sendReminderMutation = useMutation({
    mutationFn: feesApi.sendReminders,
    onSuccess: () => {
      queryClient.invalidateQueries(['reminder-history'])
      setShowSendDialog(false)
    },
  })

  const handleEditTemplate = template => {
    setSelectedTemplate(template)
    setShowTemplateDialog(true)
  }

  const handleDeleteTemplate = template => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      deleteTemplateMutation.mutate(template.id)
    }
  }

  const handleDuplicateTemplate = template => {
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
      id: undefined,
    }
    setSelectedTemplate(duplicatedTemplate)
    setShowTemplateDialog(true)
  }

  const handlePreviewTemplate = template => {
    setSelectedTemplate(template)
    setShowPreviewDialog(true)
  }

  const handleUseTemplate = template => {
    setSelectedTemplate(template)
    setShowSendDialog(true)
  }

  const handleSaveTemplate = (id, data) => {
    saveTemplateMutation.mutate({ id, data })
  }

  const handleSendReminder = reminderData => {
    sendReminderMutation.mutate(reminderData)
  }

  const handleAddTemplate = () => {
    setSelectedTemplate(null)
    setShowTemplateDialog(true)
  }

  const filteredTemplates =
    templatesData?.data?.filter(template => {
      const matchesChannel =
        filterChannel === 'all' || template.channel === filterChannel
      const matchesCategory =
        filterCategory === 'all' || template.category === filterCategory
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesChannel && matchesCategory && matchesSearch
    }) || []

  const tabs = [
    { id: 'templates', label: 'Templates', icon: Mail },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'scheduler', label: 'Scheduler', icon: Calendar },
  ]

  if (isLoading && activeTab === 'templates') return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fees Reminder System</h1>
        {activeTab === 'templates' && (
          <button
            onClick={handleAddTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
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
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full"
                />
              </div>
              <select
                value={filterChannel}
                onChange={e => setFilterChannel(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All Channels</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All Categories</option>
                <option value="due_reminder">Due Reminder</option>
                <option value="overdue_notice">Overdue Notice</option>
                <option value="payment_confirmation">
                  Payment Confirmation
                </option>
                <option value="discount_notification">
                  Discount Notification
                </option>
              </select>
              <div className="text-sm text-gray-500 flex items-center">
                Showing {filteredTemplates.length} of{' '}
                {templatesData?.data?.length || 0} templates
              </div>
            </div>
          </div>

          {/* Templates List */}
          <div className="space-y-4">
            {filteredTemplates.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Templates Found
                </h3>
                <p className="text-gray-500 mb-4">
                  {templatesData?.data?.length === 0
                    ? 'Create your first reminder template to get started.'
                    : 'No templates match your current filters.'}
                </p>
                {templatesData?.data?.length === 0 && (
                  <button
                    onClick={handleAddTemplate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Template
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.isArray(filteredTemplates) &&
                  filteredTemplates.map(template => (
                    <ReminderTemplateCard
                      key={template.id}
                      template={template}
                      onEdit={handleEditTemplate}
                      onDelete={handleDeleteTemplate}
                      onDuplicate={handleDuplicateTemplate}
                      onPreview={handlePreviewTemplate}
                      onUse={handleUseTemplate}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <TemplateDialog
        template={selectedTemplate}
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        onSave={handleSaveTemplate}
      />

      <SendReminderDialog
        template={selectedTemplate}
        open={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        onSend={handleSendReminder}
      />
    </div>
  )
}

export default FeesReminder
