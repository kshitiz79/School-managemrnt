import React, { useState, useRef, useCallback } from 'react'
import {
  Layout,
  Type,
  Image,
  QrCode,
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
} from 'lucide-react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import Input from '../../components/ui/Input'

const FIELD_TYPES = {
  PHOTO: 'photo',
  TEXT: 'text',
  QR_CODE: 'qr_code',
  SIGNATURE: 'signature',
  LOGO: 'logo',
  WATERMARK: 'watermark',
}

const THEME_PRESETS = {
  classic: {
    name: 'Classic Blue',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderColor: '#d1d5db',
    headerBg: '#1e40af',
    headerText: '#ffffff',
  },
  modern: {
    name: 'Modern Green',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    borderColor: '#d1d5db',
    headerBg: '#059669',
    headerText: '#ffffff',
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
  },
  minimal: {
    name: 'Minimal Gray',
    primaryColor: '#374151',
    secondaryColor: '#6b7280',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    borderColor: '#d1d5db',
    headerBg: '#374151',
    headerText: '#ffffff',
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
    id: 'admit-card-title',
    type: FIELD_TYPES.TEXT,
    label: 'ADMIT CARD',
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
    id: 'student-photo',
    type: FIELD_TYPES.PHOTO,
    label: 'Student Photo',
    x: 450,
    y: 120,
    width: 100,
    height: 120,
    required: true,
  },
  {
    id: 'student-name',
    type: FIELD_TYPES.TEXT,
    label: 'Student Name',
    x: 50,
    y: 120,
    width: 200,
    height: 25,
    fontSize: 14,
    fontWeight: 'normal',
    required: true,
  },
  {
    id: 'roll-number',
    type: FIELD_TYPES.TEXT,
    label: 'Roll Number',
    x: 50,
    y: 150,
    width: 200,
    height: 25,
    fontSize: 14,
    fontWeight: 'normal',
    required: true,
  },
  {
    id: 'class-section',
    type: FIELD_TYPES.TEXT,
    label: 'Class & Section',
    x: 50,
    y: 180,
    width: 200,
    height: 25,
    fontSize: 14,
    fontWeight: 'normal',
    required: true,
  },
  {
    id: 'exam-name',
    type: FIELD_TYPES.TEXT,
    label: 'Examination',
    x: 50,
    y: 210,
    width: 200,
    height: 25,
    fontSize: 14,
    fontWeight: 'normal',
    required: true,
  },
  {
    id: 'qr-code',
    type: FIELD_TYPES.QR_CODE,
    label: 'QR Code',
    x: 450,
    y: 250,
    width: 80,
    height: 80,
    required: false,
  },
  {
    id: 'principal-signature',
    type: FIELD_TYPES.SIGNATURE,
    label: 'Principal Signature',
    x: 400,
    y: 350,
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
      case FIELD_TYPES.PHOTO:
        return (
          <div className="w-full h-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center">
            <Image className="w-6 h-6 text-gray-500" />
          </div>
        )
      case FIELD_TYPES.LOGO:
        return (
          <div className="w-full h-full bg-gray-100 border border-gray-300 flex items-center justify-center rounded">
            <Layout className="w-6 h-6 text-gray-500" />
          </div>
        )
      case FIELD_TYPES.QR_CODE:
        return (
          <div className="w-full h-full bg-white border border-gray-300 flex items-center justify-center">
            <QrCode className="w-8 h-8 text-gray-700" />
          </div>
        )
      case FIELD_TYPES.SIGNATURE:
        return (
          <div className="w-full h-full bg-gray-50 border-b-2 border-gray-400 flex items-center justify-center">
            <FileSignature className="w-6 h-6 text-gray-500" />
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
        height: '842px', // A4 size in pixels at 72 DPI
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
    { type: FIELD_TYPES.PHOTO, icon: Image, label: 'Photo' },
    { type: FIELD_TYPES.QR_CODE, icon: QrCode, label: 'QR Code' },
    { type: FIELD_TYPES.SIGNATURE, icon: FileSignature, label: 'Signature' },
    { type: FIELD_TYPES.LOGO, icon: Layout, label: 'Logo' },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-medium mb-3">Field Toolbox</h3>
      <div className="grid grid-cols-2 gap-2">
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
      <div className="grid grid-cols-2 gap-2">
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
                  style={{ backgroundColor: theme.secondaryColor }}
                />
                <div
                  className="w-3 h-3 rounded border"
                  style={{ backgroundColor: theme.backgroundColor }}
                />
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}

const DesignAdmitCard = () => {
  const [fields, setFields] = useState(DEFAULT_FIELDS)
  const [selectedField, setSelectedField] = useState(null)
  const [currentTheme, setCurrentTheme] = useState(THEME_PRESETS.classic)
  const [showGrid, setShowGrid] = useState(true)
  const [templateName, setTemplateName] = useState('Default Admit Card')
  const [showPreview, setShowPreview] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleFieldUpdate = useCallback((fieldId, updates) => {
    setFields(prev =>
      prev.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    )
  }, [])

  const handleAddField = type => {
    const newField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${type}`,
      x: 100,
      y: 100,
      width: type === FIELD_TYPES.PHOTO ? 100 : 200,
      height: type === FIELD_TYPES.PHOTO ? 120 : 25,
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
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage for demo
    const savedTemplates = JSON.parse(
      localStorage.getItem('admitCardTemplates') || '[]',
    )
    savedTemplates.push(template)
    localStorage.setItem('admitCardTemplates', JSON.stringify(savedTemplates))

    setShowSaveDialog(false)
    alert('Template saved successfully!')
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default template?')) {
      setFields(DEFAULT_FIELDS)
      setSelectedField(null)
      setCurrentTheme(THEME_PRESETS.classic)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Design Admit Card</h1>
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
                  Admit Card Design Canvas
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
              </div>
            </div>
          </div>
        </div>

        {/* Save Template Dialog */}
        <Dialog
          open={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          title="Save Template"
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

export default DesignAdmitCard
