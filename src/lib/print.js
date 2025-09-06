// PDF generation utilities using browser print functionality

export const printToPDF = (
  htmlContent,
  filename = 'document.pdf',
  options = {}
) => {
  const {
    title = 'Document',
    orientation = 'portrait',
    paperSize = 'A4',
    margins = '1cm',
    includeBackground = true,
  } = options

  return new Promise((resolve, reject) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600')

      if (!printWindow) {
        reject(new Error('Failed to open print window. Please allow popups.'))
        return
      }

      // Get the content to print
      const content =
        typeof htmlContent === 'string' ? htmlContent : htmlContent.outerHTML

      // Create the print document
      const printDocument = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @page {
              size: ${paperSize} ${orientation};
              margin: ${margins};
            }
            
            * {
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.4;
              color: #000;
              background: ${includeBackground ? 'white' : 'transparent'};
              margin: 0;
              padding: 20px;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            
            .print-header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            
            .print-header .subtitle {
              margin: 5px 0 0 0;
              font-size: 14px;
              color: #666;
            }
            
            .print-content {
              margin-bottom: 30px;
            }
            
            .print-footer {
              position: fixed;
              bottom: 20px;
              left: 20px;
              right: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-lg { font-size: 18px; }
            .text-sm { font-size: 12px; }
            .mb-4 { margin-bottom: 16px; }
            .mt-4 { margin-top: 16px; }
            
            @media print {
              body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .no-print {
                display: none !important;
              }
              
              .page-break {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-content">
            ${content}
          </div>
          <div class="print-footer">
            Generated on ${new Date().toLocaleString()} | School Management System
          </div>
        </body>
        </html>
      `

      // Write the document and print
      printWindow.document.write(printDocument)
      printWindow.document.close()

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
          resolve(true)
        }, 500)
      }

      // Handle print dialog cancel
      printWindow.onbeforeunload = () => {
        resolve(false)
      }
    } catch (error) {
      reject(error)
    }
  })
}

// Generate report card PDF
export const generateReportCard = (student, grades, options = {}) => {
  const {
    academicYear = '2023-24',
    term = 'Final',
    schoolName = 'School Management System',
  } = options

  const totalMarks = grades.reduce((sum, grade) => sum + grade.totalMarks, 0)
  const obtainedMarks = grades.reduce(
    (sum, grade) => sum + grade.marksObtained,
    0
  )
  const percentage = ((obtainedMarks / totalMarks) * 100).toFixed(2)

  const content = `
    <div class="print-header">
      <h1>${schoolName}</h1>
      <div class="subtitle">Academic Report Card - ${academicYear}</div>
    </div>
    
    <div class="student-info mb-4">
      <table>
        <tr>
          <td class="font-bold">Student Name:</td>
          <td>${student.name}</td>
          <td class="font-bold">Roll Number:</td>
          <td>${student.rollNumber}</td>
        </tr>
        <tr>
          <td class="font-bold">Class:</td>
          <td>${student.classId}-${student.section}</td>
          <td class="font-bold">Term:</td>
          <td>${term}</td>
        </tr>
      </table>
    </div>
    
    <div class="grades-table">
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th class="text-center">Max Marks</th>
            <th class="text-center">Marks Obtained</th>
            <th class="text-center">Grade</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${grades
            .map(
              grade => `
            <tr>
              <td>${grade.subjectName}</td>
              <td class="text-center">${grade.totalMarks}</td>
              <td class="text-center">${grade.marksObtained}</td>
              <td class="text-center font-bold">${grade.grade}</td>
              <td>${grade.remarks || '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
        <tfoot>
          <tr class="font-bold">
            <td>Total</td>
            <td class="text-center">${totalMarks}</td>
            <td class="text-center">${obtainedMarks}</td>
            <td class="text-center">${percentage}%</td>
            <td>-</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div class="mt-4">
      <p><strong>Overall Performance:</strong> ${percentage >= 90 ? 'Excellent' : percentage >= 75 ? 'Good' : percentage >= 60 ? 'Satisfactory' : 'Needs Improvement'}</p>
    </div>
  `

  return printToPDF(content, {
    title: `Report Card - ${student.name}`,
    ...options,
  })
}

// Generate fee receipt PDF
export const generateFeeReceipt = (payment, student, options = {}) => {
  const {
    schoolName = 'School Management System',
    receiptNumber = `RCP${Date.now()}`,
  } = options

  const content = `
    <div class="print-header">
      <h1>${schoolName}</h1>
      <div class="subtitle">Fee Payment Receipt</div>
    </div>
    
    <div class="receipt-info mb-4">
      <table>
        <tr>
          <td class="font-bold">Receipt No:</td>
          <td>${receiptNumber}</td>
          <td class="font-bold">Date:</td>
          <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td class="font-bold">Student Name:</td>
          <td>${student.name}</td>
          <td class="font-bold">Roll Number:</td>
          <td>${student.rollNumber}</td>
        </tr>
        <tr>
          <td class="font-bold">Class:</td>
          <td>${student.classId}-${student.section}</td>
          <td class="font-bold">Payment Method:</td>
          <td>${payment.paymentMethod.toUpperCase()}</td>
        </tr>
      </table>
    </div>
    
    <div class="payment-details">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${payment.description || 'Fee Payment'}</td>
            <td class="text-right">₹${payment.amount.toLocaleString()}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="font-bold">
            <td>Total Amount</td>
            <td class="text-right">₹${payment.amount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div class="mt-4 text-center">
      <p class="text-sm">This is a computer generated receipt and does not require signature.</p>
    </div>
  `

  return printToPDF(content, {
    title: `Fee Receipt - ${student.name}`,
    ...options,
  })
}

// Generate attendance report PDF
export const generateAttendanceReport = (attendanceData, options = {}) => {
  const {
    title = 'Attendance Report',
    period = 'Monthly',
    className = '',
  } = options

  const content = `
    <div class="print-header">
      <h1>${title}</h1>
      <div class="subtitle">${period} Report${className ? ` - ${className}` : ''}</div>
    </div>
    
    <div class="attendance-table">
      <table>
        <thead>
          <tr>
            <th>S.No.</th>
            <th>Name</th>
            <th>Roll Number</th>
            <th class="text-center">Present Days</th>
            <th class="text-center">Total Days</th>
            <th class="text-center">Attendance %</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          ${attendanceData
            .map(
              (record, index) => `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td>${record.studentName}</td>
              <td class="text-center">${record.rollNumber}</td>
              <td class="text-center">${record.presentDays}</td>
              <td class="text-center">${record.totalDays}</td>
              <td class="text-center">${record.percentage.toFixed(1)}%</td>
              <td class="text-center">
                <span class="${record.percentage >= 75 ? 'text-green-600' : 'text-red-600'}">
                  ${record.percentage >= 75 ? 'Good' : 'Poor'}
                </span>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `

  return printToPDF(content, {
    title,
    ...options,
  })
}

export default {
  printToPDF,
  generateReportCard,
  generateFeeReceipt,
  generateAttendanceReport,
}
