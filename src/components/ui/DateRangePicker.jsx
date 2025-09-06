import React, { useState, useEffect, useRef } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from './Button'

const DateRangePicker = ({
  value = { start: null, end: null },
  onChange,
  placeholder = 'Select date range...',
  disabled = false,
  error,
  label,
  required = false,
  className,
  minDate,
  maxDate,
  presets = [
    {
      label: 'Today',
      getValue: () => ({ start: new Date(), end: new Date() }),
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return { start: yesterday, end: yesterday }
      },
    },
    {
      label: 'Last 7 days',
      getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 6)
        return { start, end }
      },
    },
    {
      label: 'Last 30 days',
      getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 29)
        return { start, end }
      },
    },
    {
      label: 'This month',
      getValue: () => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return { start, end }
      },
    },
    {
      label: 'Last month',
      getValue: () => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const end = new Date(now.getFullYear(), now.getMonth(), 0)
        return { start, end }
      },
    },
  ],
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingStart, setSelectingStart] = useState(true)
  const [tempRange, setTempRange] = useState(value)
  const containerRef = useRef(null)

  const pickerId = `date-range-picker-${Math.random().toString(36).substr(2, 9)}`
  const errorId = `${pickerId}-error`

  // Format date for display
  const formatDate = date => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Get display text
  const getDisplayText = () => {
    if (!value.start && !value.end) return placeholder
    if (value.start && !value.end) return formatDate(value.start)
    if (!value.start && value.end) return formatDate(value.end)
    if (value.start && value.end) {
      if (value.start.getTime() === value.end.getTime()) {
        return formatDate(value.start)
      }
      return `${formatDate(value.start)} - ${formatDate(value.end)}`
    }
    return placeholder
  }

  // Generate calendar days
  const generateCalendarDays = month => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()

    const firstDay = new Date(year, monthIndex, 1)
    const lastDay = new Date(year, monthIndex + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  // Check if date is in range
  const isInRange = date => {
    if (!tempRange.start || !tempRange.end) return false
    const time = date.getTime()
    const startTime = tempRange.start.getTime()
    const endTime = tempRange.end.getTime()
    return (
      time >= Math.min(startTime, endTime) &&
      time <= Math.max(startTime, endTime)
    )
  }

  // Check if date is selected
  const isSelected = date => {
    const time = date.getTime()
    return (
      (tempRange.start && time === tempRange.start.getTime()) ||
      (tempRange.end && time === tempRange.end.getTime())
    )
  }

  // Handle date click
  const handleDateClick = date => {
    if (disabled) return

    if (selectingStart || !tempRange.start) {
      setTempRange({ start: date, end: null })
      setSelectingStart(false)
    } else {
      const newRange = {
        start: tempRange.start,
        end: date,
      }

      // Ensure start is before end
      if (newRange.start > newRange.end) {
        newRange.start = date
        newRange.end = tempRange.start
      }

      setTempRange(newRange)
      onChange?.(newRange)
      setIsOpen(false)
      setSelectingStart(true)
    }
  }

  // Handle preset click
  const handlePresetClick = preset => {
    const range = preset.getValue()
    setTempRange(range)
    onChange?.(range)
    setIsOpen(false)
    setSelectingStart(true)
  }

  // Handle clear
  const handleClear = e => {
    e.stopPropagation()
    const emptyRange = { start: null, end: null }
    setTempRange(emptyRange)
    onChange?.(emptyRange)
  }

  // Navigate months
  const navigateMonth = direction => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(newMonth.getMonth() + direction)
      return newMonth
    })
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false)
        setSelectingStart(true)
        setTempRange(value) // Reset temp range
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, value])

  // Update temp range when value changes
  useEffect(() => {
    setTempRange(value)
  }, [value])

  const calendarDays = generateCalendarDays(currentMonth)
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const pickerElement = (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full justify-between text-left font-normal',
          !value.start && !value.end && 'text-gray-500',
          error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
          className,
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
      >
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          <span className="truncate">{getDisplayText()}</span>
        </div>
        {(value.start || value.end) && (
          <X
            className="h-4 w-4 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
          />
        )}
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[320px]">
          <div className="flex">
            {/* Presets */}
            <div className="w-40 pr-4 border-r border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Quick Select
              </h4>
              <div className="space-y-1">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="flex-1 pl-4">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => navigateMonth(-1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h4 className="text-sm font-medium">
                  {monthNames[currentMonth.getMonth()]}{' '}
                  {currentMonth.getFullYear()}
                </h4>
                <button
                  type="button"
                  onClick={() => navigateMonth(1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div
                    key={day}
                    className="text-xs text-gray-500 text-center p-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const isCurrentMonth =
                    date.getMonth() === currentMonth.getMonth()
                  const isToday =
                    date.toDateString() === new Date().toDateString()
                  const isSelectedDate = isSelected(date)
                  const isInRangeDate = isInRange(date)

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      disabled={!isCurrentMonth}
                      className={cn(
                        'p-1 text-sm text-center rounded hover:bg-gray-100',
                        !isCurrentMonth && 'text-gray-300 cursor-not-allowed',
                        isCurrentMonth && 'text-gray-900',
                        isToday && 'font-semibold',
                        isSelectedDate &&
                          'bg-blue-600 text-white hover:bg-blue-700',
                        isInRangeDate &&
                          !isSelectedDate &&
                          'bg-blue-100 text-blue-900'
                      )}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>

              {/* Instructions */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                {selectingStart || !tempRange.start
                  ? 'Select start date'
                  : 'Select end date'}
              </div>
            </div>
          </div>
        </div>
      )}
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
              disabled && 'text-gray-400',
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

export default DateRangePicker
