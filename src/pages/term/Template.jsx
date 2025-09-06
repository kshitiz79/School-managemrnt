import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  History,
  Settings,
  Save,
  X,
  CheckCircle,
  Clock,
  Star,
  Layout,
  Code,
  Image,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { templateApi } from '../../lib/api/template'

const TemplateCard = ({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  onViewHistory,
}) => {
  const getTypeColor = type => {
    switch (type) {
      case 'report_card':
        return 'text-blue-600 bg-blue-100'
      case 'mark_sheet':
        return 'text-green-600 bg-green-100'
      case 'certificate':
        return 'text-purple-600 bg-purple-100'
      case 'transcript':
        return 'text-orange-600 bg-orange-100'
      case 'progress_report':
        return 'text-pink-600 bg-pink-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'draft':
        return 'text-yellow-600 bg-yellow-100'
      case 'archived':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium">{template.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}
          >
            {template.type.replace('_', ' ').toUpperCase()}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}
          >
            {template.status.toUpperCase()}
          </span>
          {template.isDefault && (
            <Star
              className="w-4 h-4 text-yellow-500"
              title="Default Template"
            />
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Version:</span>
            <span className="font-medium ml-1">{template.version}</span>
          </div>
          <div>
            <span className="text-gray-500">Format:</span>
            <span className="font-medium ml-1">
              {template.format?.toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Classes:</span>
            <span className="font-medium ml-1">
              {template.applicableClasses?.length || 0}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Fields:</span>
            <span className="font-medium ml-1">
              {template.fields?.length || 0}
            </span>
          </div>
        </div>

        <div className="text-sm">
          <span className="text-gray-500">Last Modified:</span>
          <span className="font-medium ml-1">
            {new Date(
              template.updatedAt || template.createdAt,
            ).toLocaleDateString()}
          </span>
        </div>

        {template.layout && (
          <div className="flex items-center gap-2 text-sm">
            <Layout className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {template.layout.orientation} • {template.layout.pageSize}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Created by {template.createdBy}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onPreview(template)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewHistory(template)}
            className="p-1 text-gray-400 hover:text-purple-600"
            title="Version History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(template)}
            className="p-1 text-gray-400 hover:text-green-600"
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
    type: template?.type || 'report_card',
    format: template?.format || 'pdf',
    status: template?.status || 'draft',
    isDefault: template?.isDefault || false,
    applicableClasses: template?.applicableClasses || [],
    layout: template?.layout || {
      orientation: 'portrait',
      pageSize: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
    },
    fields: template?.fields || [],
    styling: template?.styling || {
      fontFamily: 'Arial',
      fontSize: 12,
      primaryColor: '#000000',
      secondaryColor: '#666666',
    },
    content: template?.content || '',
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => templateApi.getClasses(),
  })

  const handleSave = () => {
    onSave(template?.id, formData)
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

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          id: `field-${Date.now()}`,
          name: '',
          label: '',
          type: 'text',
          required: false,
          position: { x: 0, y: 0 },
          size: { width: 100, height: 20 },
        },
      ],
    }))
  }

  const updateField = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      ),
    }))
  }

  const removeField = index => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }))
  }

  const updateLayout = (field, value) => {
    setFormData(prev => ({
      ...prev,
      layout: { ...prev.layout, [field]: value },
    }))
  }

  const updateStyling = (field, value) => {
    setFormData(prev => ({
      ...prev,
      styling: { ...prev.styling, [field]: value },
    }))
  }

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
            placeholder="e.g., CBSE Report Card Template"
          />
          <div>
            <label className="block text-sm font-medium mb-1">
              Template Type *
            </label>
            <select
              value={formData.type}
              onChange={e =>
                setFormData(prev => ({ ...prev, type: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="report_card">Report Card</option>
              <option value="mark_sheet">Mark Sheet</option>
              <option value="certificate">Certificate</option>
              <option value="transcript">Transcript</option>
              <option value="progress_report">Progress Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Format</label>
            <select
              value={formData.format}
              onChange={e =>
                setFormData(prev => ({ ...prev, format: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="pdf">PDF</option>
              <option value="html">HTML</option>
              <option value="docx">Word Document</option>
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
              <option value="archived">Archived</option>
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
            placeholder="Template description and usage notes..."
          />
        </div>

        {/* Applicable Classes */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Applicable Classes
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

        {/* Layout Settings */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Orientation
              </label>
              <select
                value={formData.layout.orientation}
                onChange={e => updateLayout('orientation', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Page Size
              </label>
              <select
                value={formData.layout.pageSize}
                onChange={e => updateLayout('pageSize', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Margins (px)
              </label>
              <input
                type="number"
                value={formData.layout.margins?.top || 20}
                onChange={e =>
                  updateLayout('margins', {
                    ...formData.layout.margins,
                    top: parseInt(e.target.value) || 20,
                    right: parseInt(e.target.value) || 20,
                    bottom: parseInt(e.target.value) || 20,
                    left: parseInt(e.target.value) || 20,
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="20"
              />
            </div>
          </div>
        </div>

        {/* Styling */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Styling
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Font Family
              </label>
              <select
                value={formData.styling.fontFamily}
                onChange={e => updateStyling('fontFamily', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>
            <Input
              label="Font Size"
              type="number"
              value={formData.styling.fontSize}
              onChange={e =>
                updateStyling('fontSize', parseInt(e.target.value) || 12)
              }
              min="8"
              max="24"
              size="sm"
            />
            <div>
              <label className="block text-sm font-medium mb-1">
                Primary Color
              </label>
              <input
                type="color"
                value={formData.styling.primaryColor}
                onChange={e => updateStyling('primaryColor', e.target.value)}
                className="w-full h-10 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Secondary Color
              </label>
              <input
                type="color"
                value={formData.styling.secondaryColor}
                onChange={e => updateStyling('secondaryColor', e.target.value)}
                className="w-full h-10 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Template Fields */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <Code className="w-4 h-4" />
              Template Fields
            </h3>
            <button
              type="button"
              onClick={addField}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </button>
          </div>

          {formData.fields.length === 0 ? (
            <p className="text-gray-500 text-sm">No fields added yet</p>
          ) : (
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {Array.isArray(formData.fields) &&
                formData.fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Input
                        label="Field Name"
                        value={field.name}
                        onChange={e =>
                          updateField(index, 'name', e.target.value)
                        }
                        placeholder="student_name"
                        size="sm"
                      />
                      <Input
                        label="Label"
                        value={field.label}
                        onChange={e =>
                          updateField(index, 'label', e.target.value)
                        }
                        placeholder="Student Name"
                        size="sm"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Type
                        </label>
                        <select
                          value={field.type}
                          onChange={e =>
                            updateField(index, 'type', e.target.value)
                          }
                          className="w-full border rounded px-3 py-1 text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="image">Image</option>
                          <option value="table">Table</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2">
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={e =>
                              updateField(index, 'required', e.target.checked)
                            }
                            className="rounded"
                          />
                          <span className="text-xs">Required</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Template Content */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Template Content (HTML/Text)
          </label>
          <textarea
            value={formData.content}
            onChange={e =>
              setFormData(prev => ({ ...prev, content: e.target.value }))
            }
            rows={8}
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            placeholder="Enter your template content here. Use {{field_name}} for dynamic fields..."
          />
          <div className="text-xs text-gray-500 mt-1">
            Use double curly braces for dynamic fields: {'{student_name}'},{' '}
            {'{class}'}, {'{marks}'}
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={e =>
                setFormData(prev => ({ ...prev, isDefault: e.target.checked }))
              }
              className="rounded"
            />
            <span className="text-sm font-medium">Set as default template</span>
          </label>
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
            disabled={!formData.name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {template ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const TemplatePreviewDialog = ({ template, open, onClose }) => {
  if (!template) return null

  const sampleData = {
    student_name: 'John Doe',
    class: 'Class 10',
    section: 'A',
    roll_number: '001',
    father_name: 'Robert Doe',
    mother_name: 'Jane Doe',
    academic_year: '2024-25',
    term: 'Term 1',
    total_marks: '450',
    obtained_marks: '385',
    percentage: '85.5',
    grade: 'A',
    rank: '5',
  }

  const renderPreview = () => {
    let content = template.content || ''

    // Replace template variables with sample data
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      content = content.replace(regex, value)
    })

    return content
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Preview: ${template.name}`}
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Template Type: {template.type?.replace('_', ' ').toUpperCase()}
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50 flex items-center gap-1">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-white min-h-96">
          {template.format === 'html' ? (
            <div
              dangerouslySetInnerHTML={{ __html: renderPreview() }}
              style={{
                fontFamily: template.styling?.fontFamily || 'Arial',
                fontSize: `${template.styling?.fontSize || 12}px`,
                color: template.styling?.primaryColor || '#000000',
              }}
            />
          ) : (
            <pre
              className="whitespace-pre-wrap"
              style={{
                fontFamily: template.styling?.fontFamily || 'Arial',
                fontSize: `${template.styling?.fontSize || 12}px`,
                color: template.styling?.primaryColor || '#000000',
              }}
            >
              {renderPreview()}
            </pre>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close Preview
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const VersionHistoryDialog = ({ template, open, onClose }) => {
  const { data: versionsData } = useQuery({
    queryKey: ['template-versions', template?.id],
    queryFn: () => templateApi.getTemplateVersions(template?.id),
    enabled: !!template?.id && open,
  })

  if (!template) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Version History: ${template.name}`}
      size="lg"
    >
      <div className="space-y-4">
        {versionsData?.data?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No version history available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versionsData?.data?.map((version, index) => (
              <div key={version.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Version {version.version}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {version.description}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      Modified by {version.modifiedBy} on{' '}
                      {new Date(version.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {index !== 0 && (
                      <button
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Restore"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {version.changes && version.changes.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      Changes:
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {Array.isArray(version.changes) &&
                        version.changes.map((change, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            {change}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const Template = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const queryClient = useQueryClient()

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['templates', 'all'],
    queryFn: () => templateApi.getTemplates(),
  })

  const saveTemplateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      id
        ? templateApi.updateTemplate(id, data)
        : templateApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates'])
      setShowTemplateDialog(false)
      setSelectedTemplate(null)
    },
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: templateApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries(['templates'])
    },
  })

  const duplicateTemplateMutation = useMutation({
    mutationFn: templateApi.duplicateTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries(['templates'])
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
    duplicateTemplateMutation.mutate(template.id)
  }

  const handlePreviewTemplate = template => {
    setSelectedTemplate(template)
    setShowPreviewDialog(true)
  }

  const handleViewHistory = template => {
    setSelectedTemplate(template)
    setShowHistoryDialog(true)
  }

  const handleSaveTemplate = (id, data) => {
    saveTemplateMutation.mutate({ id, data })
  }

  const handleAddTemplate = () => {
    setSelectedTemplate(null)
    setShowTemplateDialog(true)
  }

  const filteredTemplates =
    templatesData?.data?.filter(template => {
      const matchesType = filterType === 'all' || template.type === filterType
      const matchesStatus =
        filterStatus === 'all' || template.status === filterStatus
      return matchesType && matchesStatus
    }) || []

  const getStatistics = () => {
    const templates = templatesData?.data || []
    return {
      total: templates.length,
      active: templates.filter(t => t.status === 'active').length,
      draft: templates.filter(t => t.status === 'draft').length,
      archived: templates.filter(t => t.status === 'archived').length,
    }
  }

  const stats = getStatistics()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exam Templates</h1>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={handleAddTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Templates</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.draft}</p>
              <p className="text-sm text-gray-600">Draft</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold">{stats.archived}</p>
              <p className="text-sm text-gray-600">Archived</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="report_card">Report Card</option>
              <option value="mark_sheet">Mark Sheet</option>
              <option value="certificate">Certificate</option>
              <option value="transcript">Transcript</option>
              <option value="progress_report">Progress Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-500">
              Showing {filteredTemplates.length} of{' '}
              {templatesData?.data?.length || 0} templates
            </div>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Templates Found
            </h3>
            <p className="text-gray-500 mb-4">
              {templatesData?.data?.length === 0
                ? 'Create your first exam template to get started.'
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
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onDuplicate={handleDuplicateTemplate}
                  onPreview={handlePreviewTemplate}
                  onViewHistory={handleViewHistory}
                />
              ))}
          </div>
        )}
      </div>

      {/* Template Dialog */}
      <TemplateDialog
        template={selectedTemplate}
        open={showTemplateDialog}
        onClose={() => {
          setShowTemplateDialog(false)
          setSelectedTemplate(null)
        }}
        onSave={handleSaveTemplate}
      />

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        template={selectedTemplate}
        open={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
      />

      {/* Version History Dialog */}
      <VersionHistoryDialog
        template={selectedTemplate}
        open={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
      />
    </div>
  )
}

export default Template
