import { useState } from 'react'
import { Download, FileText, File } from 'lucide-react'
import { cn } from '../../lib/utils'

const ExportButton = ({ data, filename = 'export', className }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const exportToCSV = () => {
    setIsExporting(true)

    try {
      if (!data || data.length === 0) {
        alert('No data to export')
        return
      }

      // Get headers from the first object
      const headers = Object.keys(data[0])

      // Create CSV content
      const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
          headers
            .map(header => {
              const value = row[header]
              // Handle values that might contain commas or quotes
              if (
                typeof value === 'string' &&
                (value.includes(',') || value.includes('"'))
              ) {
                return `"${value.replace(/"/g, '""')}"`
              }
              return value || ''
            })
            .join(',')
        ),
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Error exporting data')
    } finally {
      setIsExporting(false)
      setShowOptions(false)
    }
  }

  const exportToPDF = () => {
    setIsExporting(true)

    try {
      // Simple PDF export using HTML and print
      const printWindow = window.open('', '_blank')

      if (!data || data.length === 0) {
        alert('No data to export')
        return
      }

      const headers = Object.keys(data[0])

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            h1 { color: #333; margin-bottom: 20px; }
            .export-info { margin-bottom: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>${filename.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h1>
          <div class="export-info">
            Exported on: ${new Date().toLocaleString()}<br>
            Total Records: ${data.length}
          </div>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  row => `
                <tr>
                  ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error exporting data')
    } finally {
      setIsExporting(false)
      setShowOptions(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        className={cn(
          'inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export'}
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            <button
              onClick={exportToCSV}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <File className="h-4 w-4 mr-2" />
              Export as PDF
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showOptions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  )
}

export default ExportButton
