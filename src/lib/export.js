// Export utilities for CSV and PDF generation

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  let csvContent = `${headers.join(',')}\n`

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      // Handle values that contain commas or quotes
      if (
        typeof value === 'string' &&
        (value.includes(',') || value.includes('"'))
      ) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    })
    csvContent += `${values.join(',')}\n`
  })

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToPDF = (data, filename) => {
  // This is a simplified PDF export
  // In a real application, you would use a library like jsPDF or PDFKit

  const { title, headers, data: rows } = data

  // Create a simple HTML table for PDF conversion
  const htmlContent = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                row => `
              <tr>
                ${row.map(cell => `<td>${cell || ''}</td>`).join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <p style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
          Generated on ${new Date().toLocaleString()}
        </p>
      </body>
    </html>
  `

  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()

  // Trigger print dialog
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

export const exportToExcel = (data, filename) => {
  // This would require a library like SheetJS (xlsx)
  // For now, we'll export as CSV which can be opened in Excel
  exportToCSV(data, filename.replace('.xlsx', '.csv'))
}
