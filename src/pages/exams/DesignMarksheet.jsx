import React, { useState, useRef, useCallback } from 'react'
import {
  Layout,
  Type,
  BarChart3,
  Award,
  FileSignature,
  Palette,
  Save,
  Eye,
  Download,
  Copy,
  Trash2,
  Move,
  RotateCcw,
  Settings,
  Grid,
  Layers,
  Table,
  Hash,
  Percent,
} from 'lucide-react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import Input from '../../components/ui/Input'

const FIELD_TYPES = {
  STUDENT_INFO: 'student_info',
  MARKS_TABLE: 'marks_table',
  GRADE_SUMMARY: 'grade_summary',
  RESULT_STATUS: 'result_status',
  SIGNATURE: 'signature',
  LOGO: 'logo',
  TEXT: 'text',
  WATERMARK: 'watermark',
  CHART: 'chart',
  RANK: 'rank',
  PERCENTAGE: 'percentage',
}

const THEME_PRESETS = {
  academic: {
    name: 'Academic Blue',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderColor: '#d1d5db',
    headerBg: '#1e40af',
    headerText: '#ffffff',
    tableHeaderBg: '#f3f4f6',
    passColor: '#059669',
    failColor: '#dc2626',
  },
  professional: {
    name: 'Professional Gray',
    primaryColor: '#374151',
    secondaryColor: '#6b7280',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    borderColor: '#d1d5db',
    headerBg: '#374151',
    headerText: '#ffffff',
    tableHeaderBg: '#f9fafb',
    passColor: '#059669',
    failColor: '#dc2626',
  },
  vibrant: {
    name: 'Vibrant Green',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    borderColor: '#d1d5db',
    headerBg: '#059669',
    headerText: '#ffffff',
    tableHeaderBg: '#ecfdf5',
    passColor: '#059669',
    failColor: '#dc2626',
  },
  elegant: {
    name: 'Elegant Purple',
    primaryColor: '#7c3aed',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#fefefe',
    textColor: '#374151',
    borderColor: '#e5e7eb',
    headerBg: '#7c3aed',
    headerText: '#ffffff',
    tableHeaderBg: '#faf5ff',
    passColor: '#059669',
    failColor: '#dc2626',
  },
}

const DEFAULT_FIELDS = [
  {
    id: 'school-logo',
    type: FIELD_TYPES.LOGO,
    label: 'School Logo',
    x: 50,
    y: 20,
    width: 80,
    height: 80,
    required: true,
  },
  {
    id: 'school-name',
    type: FIELD_TYPES.TEXT,
    label: 'School Name',
    x: 150,
    y: 30,
    width: 300,
    height: 40,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    required: true,
  },
  {
    id: 'marksheet-title',
    type: FIELD_TYPES.TEXT,
    label: 'MARK SHEET',
    x: 150,
    y: 70,
    width: 300,
    height: 30,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    required: true,
  },
  {
    id: 'student-info',
    type: FIELD_TYPES.STUDENT_INFO,
    label: 'Student Information',
    x: 50,
    y: 120,
    width: 250,
    height: 120,
    required: true,
  },
  {
    id: 'student-photo',
    type: FIELD_TYPES.STUDENT_INFO,
    label: 'Student Photo',
    x: 450,
    y: 120,
    width: 100,
    height: 120,
    required: false,
  },
  {
    id: 'marks-table',
    type: FIELD_TYPES.MARKS_TABLE,
    label: 'Marks Table',
    x: 50,
    y: 260,
    width: 500,
    height: 200,
    required: true,
  },
  {
    id: 'grade-summary',
    type: FIELD_TYPES.GRADE_SUMMARY,
    label: 'Grade Summary',
    x: 50,
    y: 480,
    width: 200,
    height: 100,
    required: true,
  },
  {
    id: 'result-status',
    type: FIELD_TYPES.RESULT_STATUS,
    label: 'Result Status',
    x: 270,
    y: 480,
    width: 150,
    height: 60,
    required: true,
  },
  {
    id: 'percentage',
    type: FIELD_TYPES.PERCENTAGE,
    label: 'Percentage',
    x: 440,
    y: 480,
    width: 110,
    height: 60,
    required: true,
  },
  {
    id: 'rank',
    type: FIELD_TYPES.RANK,
    label: 'Class Rank',
    x: 50,
    y: 600,
    width: 150,
    height: 40,
    required: false,
  },
  {
    id: 'principal-signature',
    type: FIELD_TYPES.SIGNATURE,
    label: 'Principal Signature',
    x: 400,
    y: 650,
    width: 120,
    height: 60,
    required: true,
  },
  {
    id: 'class-teacher-signature',
    type: FIELD_TYPES.SIGNATURE,
    label: 'Class Teacher Signature',
    x: 250,
    y: 650,
    width: 120,
    height: 60,
    required: true,
  },
]

const DraggableField = ({ field, onSelect, isSelected, onUpdate, theme }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'field',
    item: { id: field.id, type: field.type },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const getFieldContent = () => {
    switch (field.type) {
      case FIELD_TYPES.STUDENT_INFO:
        return (
          <div className="w-full h-full p-2 bg-gray-50 border border-gray-300 text-xs">
            <div>Name: Student Name</div>
            <div>Roll No: 001</div>
            <div>Class: X-A</div>
            <div>Father: Father Name</div>
          </div>
        )

      case FIELD_TYPES.MARKS_TABLE:
        return (
          <div className="w-full h-full border border-gray-300">
            <div className="bg-gray-100 p-1 text-xs font-medium border-b">
              Marks Table
            </div>
            <div className="p-2 text-xs">
              <div className="grid grid-cols-4 gap-1 mb-1">
                <div>Subject</div>
                <div>Max</div>
                <div>Obt</div>
                <div>Grade</div>
              </div>
              <div className="grid grid-cols-4 gap-1 text-gray-600">
                <div>Math</div>
                <div>100</div>
                <div>85</div>
                <div>A</div>
              </div>
            </div>
          </div>
        )

      case FIELD_TYPES.GRADE_SUMMARY:
        return (
          <div className="w-full h-full p-2 bg-blue-50 border border-blue-300 text-xs">
            <div className="font-medium mb-1">Grade Summary</div>
            <div>Total: 425/500</div>
            <div>Percentage: 85%</div>
            <div>Grade: A</div>
          </div>
        )

      case FIELD_TYPES.RESULT_STATUS:
        return (
          <div className="w-full h-full p-2 bg-green-50 border border-green-300 text-xs flex items-center justify-center">
            <div className="text-center">
              <div className="font-bold text-green-700">PASS</div>
              <div className="text-green-600">Promoted</div>
            </div>
          </div>
        )

      case FIELD_TYPES.PERCENTAGE:
        return (
          <div className="w-full h-full p-2 bg-yellow-50 border border-yellow-300 text-xs flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">85%</div>
              <div className="text-gray-600">Percentage</div>
            </div>
          </div>
        )

      case FIELD_TYPES.RANK:
        return (
          <div className="w-full h-full p-2 bg-purple-50 border border-purple-300 text-xs flex items-center justify-center">
            <div className="text-center">
              <Award className="w-4 h-4 mx-auto mb-1" />
              <div className="font-bold">Rank: 5</div>
            </div>
          </div>
        )

      case FIELD_TYPES.CHART:
        return (
          <div className="w-full h-full bg-gray-100 border border-gray-300 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gray-500" />
          </div>
        )

      case FIELD_TYPES.SIGNATURE:
        return (
          <div className="w-full h-full bg-gray-50 border-b-2 border-gray-400 flex items-center justify-center">
            <FileSignature className="w-6 h-6 text-gray-500" />
          </div>
        )

      case FIELD_TYPES.LOGO:
        return (
          <div className="w-full h-full bg-gray-100 border border-gray-300 flex items-center justify-center rounded">
            <Layout className="w-6 h-6 text-gray-500" />
          </div>
        )

      case FIELD_TYPES.WATERMARK:
        return (
          <div className="w-full h-full bg-gray-100 opacity-20 flex items-center justify-center">
            <span className="text-gray-500 text-xs">WATERMARK</span>
          </div>
        )

      default:
        return (
          <div
            className="w-full h-full flex items-center px-2"
            style={{
              fontSize: `${field.fontSize || 14}px`,
              fontWeight: field.fontWeight || 'normal',
              textAlign: field.textAlign || 'left',
              color: theme.textColor,
            }}
          >
            {field.label}
          </div>
        )
    }
  }

  return (
    <div
      ref={drag}
      onClick={() => onSelect(field)}
      className={`absolute cursor-move border-2 ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-transparent hover:border-gray-300'
      } ${isDragging ? 'opacity-50' : ''}`}
      style={{
        left: field.x,
        top: field.y,
        width: field.width,
        height: field.height,
        zIndex: field.zIndex || 1,
      }}
    >
      {getFieldContent()}
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          {field.label}
        </div>
      )}
    </div>
  )
}

const DesignCanvas = ({
  fields,
  onFieldUpdate,
  selectedField,
  onFieldSelect,
  theme,
  showGrid,
}) => {
  const [, drop] = useDrop({
    accept: 'field',
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset()
      const field = fields.find(f => f.id === item.id)
      if (field && delta) {
        onFieldUpdate(field.id, {
          x: Math.max(0, field.x + delta.x),
          y: Math.max(0, field.y + delta.y),
        })
      }
    },
  })

  return (
    <div
      ref={drop}
      className="relative bg-white border-2 border-gray-300 mx-auto"
      style={{
        width: '595px',
        height: '842px', // A4 size
        backgroundColor: theme.backgroundColor,
        backgroundImage: showGrid
          ? 'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)'
          : 'none',
        backgroundSize: showGrid ? '20px 20px' : 'auto',
      }}
    >
      {Array.isArray(fields) &&
        fields.map(field => (
          <DraggableField
            key={field.id}
            field={field}
            onSelect={onFieldSelect}
            isSelected={selectedField?.id === field.id}
            onUpdate={onFieldUpdate}
            theme={theme}
          />
        ))}
    </div>
  )
}

const FieldToolbox = ({ onAddField }) => {
  const fieldTypes = [
    { type: FIELD_TYPES.TEXT, icon: Type, label: 'Text Field' },
    { type: FIELD_TYPES.STUDENT_INFO, icon: Layout, label: 'Student Info' },
    { type: FIELD_TYPES.MARKS_TABLE, icon: Table, label: 'Marks Table' },
    {
      type: FIELD_TYPES.GRADE_SUMMARY,
      icon: BarChart3,
      label: 'Grade Summary',
    },
    { type: FIELD_TYPES.RESULT_STATUS, icon: Award, label: 'Result Status' },
    { type: FIELD_TYPES.PERCENTAGE, icon: Percent, label: 'Percentage' },
    { type: FIELD_TYPES.RANK, icon: Hash, label: 'Rank' },
    { type: FIELD_TYPES.SIGNATURE, icon: FileSignature, label: 'Signature' },
    { type: FIELD_TYPES.LOGO, icon: Layout, label: 'Logo' },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-medium mb-3">Field Toolbox</h3>
      <div className="grid grid-cols-1 gap-2">
        {Array.isArray(fieldTypes) &&
          fieldTypes.map(fieldType => {
            const Icon = fieldType.icon
            return (
              <button
                key={fieldType.type}
                onClick={() => onAddField(fieldType.type)}
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 text-sm"
              >
                <Icon className="w-4 h-4" />
                {fieldType.label}
              </button>
            )
          })}
      </div>
    </div>
  )
}

const PropertyPanel = ({ field, onUpdate, onDelete, theme }) => {
  if (!field) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-3">Properties</h3>
        <p className="text-gray-500 text-sm">
          Select a field to edit properties
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Properties</h3>
        <button
          onClick={() => onDelete(field.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <Input
          label="Label"
          value={field.label}
          onChange={e => onUpdate(field.id, { label: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="X Position"
            type="number"
            value={field.x}
            onChange={e =>
              onUpdate(field.id, { x: parseInt(e.target.value) || 0 })
            }
          />
          <Input
            label="Y Position"
            type="number"
            value={field.y}
            onChange={e =>
              onUpdate(field.id, { y: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Width"
            type="number"
            value={field.width}
            onChange={e =>
              onUpdate(field.id, { width: parseInt(e.target.value) || 0 })
            }
          />
          <Input
            label="Height"
            type="number"
            value={field.height}
            onChange={e =>
              onUpdate(field.id, { height: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        {field.type === FIELD_TYPES.TEXT && (
          <>
            <Input
              label="Font Size"
              type="number"
              value={field.fontSize || 14}
              onChange={e =>
                onUpdate(field.id, { fontSize: parseInt(e.target.value) || 14 })
              }
            />

            <div>
              <label className="block text-sm font-medium mb-1">
                Font Weight
              </label>
              <select
                value={field.fontWeight || 'normal'}
                onChange={e =>
                  onUpdate(field.id, { fontWeight: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Light</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Text Align
              </label>
              <select
                value={field.textAlign || 'left'}
                onChange={e =>
                  onUpdate(field.id, { textAlign: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}

        {field.type === FIELD_TYPES.MARKS_TABLE && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Table Style
              </label>
              <select
                value={field.tableStyle || 'bordered'}
                onChange={e =>
                  onUpdate(field.id, { tableStyle: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="bordered">Bordered</option>
                <option value="striped">Striped</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.showGrades || true}
                onChange={e =>
                  onUpdate(field.id, { showGrades: e.target.checked })
                }
                className="rounded"
              />
              <label className="text-sm">Show Grades</label>
            </div>
          </>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={field.required || false}
            onChange={e => onUpdate(field.id, { required: e.target.checked })}
            className="rounded"
          />
          <label className="text-sm">Required Field</label>
        </div>
      </div>
    </div>
  )
}

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-medium mb-3">Theme Presets</h3>
      <div className="grid grid-cols-1 gap-2">
        {Array.isArray(Object.entries(THEME_PRESETS)) &&
          Object.entries(THEME_PRESETS).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => onThemeChange(theme)}
              className={`p-3 border rounded-lg text-left hover:shadow-md transition-shadow ${
                currentTheme.name === theme.name
                  ? 'border-blue-500 bg-blue-50'
                  : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <span className="text-sm font-medium">{theme.name}</span>
              </div>
              <div className="flex gap-1">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: theme.passColor }}
                />
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: theme.failColor }}
                />
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}

const DesignMarksheet = () => {
  const [fields, setFields] = useState(DEFAULT_FIELDS)
  const [selectedField, setSelectedField] = useState(null)
  const [currentTheme, setCurrentTheme] = useState(THEME_PRESETS.academic)
  const [showGrid, setShowGrid] = useState(true)
  const [templateName, setTemplateName] = useState('Default Marksheet')
  const [showPreview, setShowPreview] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleFieldUpdate = useCallback((fieldId, updates) => {
    setFields(prev =>
      prev.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field,
      )
    )
  }, [])

  const handleAddField = type => {
    const newField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${type}`,
      x: 100,
      y: 100,
      width: type === FIELD_TYPES.MARKS_TABLE ? 500 : 200,
      height:
        type === FIELD_TYPES.MARKS_TABLE
          ? 200
          : type === FIELD_TYPES.STUDENT_INFO
            ? 120
            : 25,
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'left',
      required: false,
    }
    setFields(prev => [...prev, newField])
  }

  const handleDeleteField = fieldId => {
    setFields(prev => prev.filter(field => field.id !== fieldId))
    setSelectedField(null)
  }

  const handleSaveTemplate = () => {
    const template = {
      name: templateName,
      fields,
      theme: currentTheme,
      type: 'marksheet',
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage for demo
    const savedTemplates = JSON.parse(
      localStorage.getItem('marksheetTemplates') || '[]'
    )
    savedTemplates.push(template)
    localStorage.setItem('marksheetTemplates', JSON.stringify(savedTemplates))

    setShowSaveDialog(false)
    alert('Marksheet template saved successfully!')
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default template?')) {
      setFields(DEFAULT_FIELDS)
      setSelectedField(null)
      setCurrentTheme(THEME_PRESETS.academic)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Design Marksheet</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
                showGrid
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              <Grid className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handlePreview}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Template
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Tools */}
          <div className="col-span-3 space-y-4">
            <FieldToolbox onAddField={handleAddField} />
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
            />
            <PropertyPanel
              field={selectedField}
              onUpdate={handleFieldUpdate}
              onDelete={handleDeleteField}
              theme={currentTheme}
            />
          </div>

          {/* Center - Design Canvas */}
          <div className="col-span-6">
            <div className="bg-gray-100 p-6 rounded-lg">
              <div className="mb-4 text-center">
                <h3 className="font-medium text-gray-700">
                  Marksheet Design Canvas
                </h3>
                <p className="text-sm text-gray-500">
                  Drag fields to reposition them
                </p>
              </div>
              <DesignCanvas
                fields={fields}
                onFieldUpdate={handleFieldUpdate}
                selectedField={selectedField}
                onFieldSelect={setSelectedField}
                theme={currentTheme}
                showGrid={showGrid}
              />
            </div>
          </div>

          {/* Right Sidebar - Layers & Settings */}
          <div className="col-span-3 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Layers
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.isArray(fields) &&
                  fields.map((field, index) => (
                    <div
                      key={field.id}
                      onClick={() => setSelectedField(field)}
                      className={`p-2 border rounded cursor-pointer text-sm ${
                        selectedField?.id === field.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{field.label}</span>
                        {field.required && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {field.type} • {field.x},{field.y}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium mb-3">Template Info</h3>
              <Input
                label="Template Name"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
              />
              <div className="mt-3 text-sm text-gray-600">
                <div>Fields: {fields.length}</div>
                <div>Theme: {currentTheme.name}</div>
                <div>Size: A4 (595×842px)</div>
                <div>Type: Marksheet</div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Template Dialog */}
        <Dialog
          open={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          title="Save Marksheet Template"
        >
          <div className="space-y-4">
            <Input
              label="Template Name"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              placeholder="Enter template name..."
            />
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium mb-2">Template Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Fields: {fields.length}</div>
                <div>Theme: {currentTheme.name}</div>
                <div>
                  Required Fields: {fields.filter(f => f.required).length}
                </div>
                <div>Type: Marksheet Template</div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Template
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    </DndProvider>
  )
}

export default DesignMarksheet
