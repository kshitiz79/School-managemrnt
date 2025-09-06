import React, { useState, useEffect } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from './Button'
import Input from './Input'

const ClassSectionPicker = ({
  value = null,
  onChange,
  placeholder = 'Select class and section...',
  disabled = false,
  error,
  label,
  required = false,
  className,
  // Mock data - in real app, this would come from props or API
  classes = [
    {
      id: 'class-1',
      name: 'Class 1',
      sections: [
        { id: 'class-1-a', name: 'Section A', students: 25 },
        { id: 'class-1-b', name: 'Section B', students: 28 },
      ],
    },
    {
      id: 'class-2',
      name: 'Class 2',
      sections: [
        { id: 'class-2-a', name: 'Section A', students: 30 },
        { id: 'class-2-b', name: 'Section B', students: 27 },
        { id: 'class-2-c', name: 'Section C', students: 29 },
      ],
    },
    {
      id: 'class-3',
      name: 'Class 3',
      sections: [
        { id: 'class-3-a', name: 'Section A', students: 32 },
        { id: 'class-3-b', name: 'Section B', students: 31 },
      ],
    },
    {
      id: 'class-4',
      name: 'Class 4',
      sections: [
        { id: 'class-4-a', name: 'Section A', students: 28 },
        { id: 'class-4-b', name: 'Section B', students: 26 },
        { id: 'class-4-c', name: 'Section C', students: 30 },
      ],
    },
    {
      id: 'class-5',
      name: 'Class 5',
      sections: [
        { id: 'class-5-a', name: 'Section A', students: 29 },
        { id: 'class-5-b', name: 'Section B', students: 31 },
      ],
    },
  ],
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState(null)

  const pickerId = `class-section-picker-${Math.random().toString(36).substr(2, 9)}`
  const errorId = `${pickerId}-error`

  // Filter classes and sections based on search term
  const filteredClasses = classes
    .filter(
      cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.sections.some(section =>
          section.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    .map(cls => ({
      ...cls,
      sections: cls.sections.filter(
        section =>
          cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          section.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))

  // Get display text for selected value
  const getDisplayText = () => {
    if (!value) return placeholder

    for (const cls of classes) {
      for (const section of cls.sections) {
        if (section.id === value) {
          return `${cls.name} - ${section.name}`
        }
      }
    }
    return placeholder
  }

  // Handle selection
  const handleSelect = (classItem, section) => {
    const selectedValue = {
      classId: classItem.id,
      className: classItem.name,
      sectionId: section.id,
      sectionName: section.name,
      students: section.students,
      fullId: section.id,
    }

    onChange?.(selectedValue)
    setIsOpen(false)
    setSearchTerm('')
    setSelectedClass(null)
  }

  // Handle class expansion
  const handleClassClick = classItem => {
    setSelectedClass(selectedClass === classItem.id ? null : classItem.id)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (!event.target.closest(`#${pickerId}`)) {
        setIsOpen(false)
        setSearchTerm('')
        setSelectedClass(null)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, pickerId])

  const dropdownContent = (
    <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search classes or sections..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Options */}
      <div className="max-h-64 overflow-y-auto">
        {filteredClasses.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No classes or sections found
          </div>
        ) : (
          filteredClasses.map(classItem => (
            <div key={classItem.id}>
              {/* Class Header */}
              <button
                type="button"
                onClick={() => handleClassClick(classItem)}
                className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
              >
                <span className="font-medium text-gray-900">
                  {classItem.name}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-gray-400 transition-transform',
                    selectedClass === classItem.id && 'transform rotate-180'
                  )}
                />
              </button>

              {/* Sections */}
              {(selectedClass === classItem.id || searchTerm) && (
                <div className="bg-gray-50">
                  {classItem.sections.map(section => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleSelect(classItem, section)}
                      className={cn(
                        'w-full flex items-center justify-between px-8 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100',
                        value === section.id && 'bg-blue-50 text-blue-700'
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {section.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {section.students} students
                        </span>
                      </div>
                      {value === section.id && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )

  const pickerElement = (
    <div id={pickerId} className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full justify-between text-left font-normal',
          !value && 'text-gray-500',
          error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
      >
        <span className="truncate">{getDisplayText()}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </Button>

      {isOpen && dropdownContent}
    </div>
  )

  if (label || error) {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={pickerId}
            className={cn(
              'block text-sm font-medium text-gray-700',
              disabled && 'text-gray-400'
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {pickerElement}

        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }

  return pickerElement
}

export default ClassSectionPicker
