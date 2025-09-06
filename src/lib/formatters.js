// Currency formatter
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (amount === null || amount === undefined) return '₹0'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Date formatters
export const formatDate = (date, format = 'short', locale = 'en-IN') => {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return ''

  const formats = {
    short: { dateStyle: 'short' },
    medium: { dateStyle: 'medium' },
    long: { dateStyle: 'long' },
    full: { dateStyle: 'full' },
    numeric: { year: 'numeric', month: '2-digit', day: '2-digit' },
    monthYear: { year: 'numeric', month: 'long' },
    dayMonth: { day: 'numeric', month: 'short' },
    time: { timeStyle: 'short' },
    datetime: { dateStyle: 'short', timeStyle: 'short' },
  }

  return new Intl.DateTimeFormat(
    locale,
    formats[format] || formats.short,
  ).format(dateObj)
}

export const formatRelativeTime = (date, locale = 'en-IN') => {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now - dateObj) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`

  return formatDate(dateObj, 'short', locale)
}

export const formatDateRange = (startDate, endDate, locale = 'en-IN') => {
  if (!startDate || !endDate) return ''

  const start = formatDate(startDate, 'short', locale)
  const end = formatDate(endDate, 'short', locale)

  return `${start} - ${end}`
}

// Name formatters
export const formatName = (firstName, lastName, middleName = '') => {
  const parts = [firstName, middleName, lastName].filter(Boolean)
  return parts.join(' ')
}

export const formatInitials = name => {
  if (!name) return ''

  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3)
}

export const formatDisplayName = (name, maxLength = 20) => {
  if (!name) return ''

  if (name.length <= maxLength) return name

  const parts = name.split(' ')
  if (parts.length === 1) {
    return `${name.slice(0, maxLength - 3)}...`
  }

  const firstName = parts[0]
  const lastName = parts[parts.length - 1]

  if (firstName.length + lastName.length + 1 <= maxLength) {
    return `${firstName} ${lastName}`
  }

  return `${firstName.slice(0, maxLength - lastName.length - 4)}... ${lastName}`
}

// Number formatters
export const formatNumber = (number, locale = 'en-IN') => {
  if (number === null || number === undefined) return '0'

  return new Intl.NumberFormat(locale).format(number)
}

export const formatPercentage = (value, decimals = 1, locale = 'en-IN') => {
  if (value === null || value === undefined) return '0%'

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

export const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Phone number formatter
export const formatPhoneNumber = (phoneNumber, countryCode = '+91') => {
  if (!phoneNumber) return ''

  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '')

  // Indian phone number format
  if (cleaned.length === 10) {
    return `${countryCode} ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }

  return phoneNumber
}

// Address formatter
export const formatAddress = address => {
  if (!address) return ''

  const parts = [
    address.street,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ].filter(Boolean)

  return parts.join(', ')
}

// Grade formatter
export const formatGrade = (marks, totalMarks) => {
  if (
    marks === null ||
    marks === undefined ||
    totalMarks === null ||
    totalMarks === undefined
  ) {
    return 'N/A'
  }

  const percentage = (marks / totalMarks) * 100

  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C+'
  if (percentage >= 40) return 'C'
  if (percentage >= 35) return 'D'
  return 'F'
}

// Academic year formatter
export const formatAcademicYear = startYear => {
  return `${startYear}-${(startYear + 1).toString().slice(-2)}`
}

// Class section formatter
export const formatClassSection = (className, section) => {
  return `${className}${section ? `-${section}` : ''}`
}

// Duration formatter
export const formatDuration = minutes => {
  if (!minutes) return '0 min'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours} hr`

  return `${hours} hr ${mins} min`
}

// Status formatter
export const formatStatus = status => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatDateRange,
  formatName,
  formatInitials,
  formatDisplayName,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatPhoneNumber,
  formatAddress,
  formatGrade,
  formatAcademicYear,
  formatClassSection,
  formatDuration,
  formatStatus,
}
