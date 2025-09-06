import mockData from '../mockData'

// Mock API for fees and finance management
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const feesApi = {
  // Fee Groups Management
  async getFeeGroups() {
    await delay(500)

    const feeGroups = [
      {
        id: 'fee-group-1',
        name: 'Annual Fees 2024-25',
        description: 'Complete annual fee structure for academic year 2024-25',
        academicYear: '2024-25',
        status: 'active',
        applicableClasses: ['class-9', 'class-10', 'class-11', 'class-12'],
        feeTypes: [
          { id: 'tuition', name: 'Tuition Fee', amount: 15000 },
          { id: 'development', name: 'Development Fee', amount: 5000 },
          { id: 'library', name: 'Library Fee', amount: 1000 },
          { id: 'sports', name: 'Sports Fee', amount: 2000 },
          { id: 'transport', name: 'Transport Fee', amount: 8000 },
        ],
        dueDate1: '2024-04-15',
        dueDate2: '2024-08-15',
        dueDate3: '2024-12-15',
        installmentType: 'three',
        lateFeeApplicable: true,
        lateFeeAmount: 100,
        lateFeeType: 'fixed',
        concessions: ['sibling-discount', 'merit-scholarship'],
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'fee-group-2',
        name: 'Quarterly Fees 2024-25',
        description: 'Quarterly fee structure for regular payments',
        academicYear: '2024-25',
        status: 'active',
        applicableClasses: [
          'class-1',
          'class-2',
          'class-3',
          'class-4',
          'class-5',
        ],
        feeTypes: [
          { id: 'tuition', name: 'Tuition Fee', amount: 8000 },
          { id: 'activity', name: 'Activity Fee', amount: 1500 },
          { id: 'maintenance', name: 'Maintenance Fee', amount: 1000 },
        ],
        dueDate1: '2024-04-10',
        installmentType: 'single',
        lateFeeApplicable: true,
        lateFeeAmount: 5,
        lateFeeType: 'percentage',
        concessions: ['staff-discount'],
        createdAt: '2024-01-20T10:00:00Z',
      },
      {
        id: 'fee-group-3',
        name: 'Hostel Fees 2024-25',
        description: 'Hostel accommodation and mess fees',
        academicYear: '2024-25',
        status: 'active',
        applicableClasses: ['class-9', 'class-10', 'class-11', 'class-12'],
        feeTypes: [
          { id: 'accommodation', name: 'Accommodation Fee', amount: 25000 },
          { id: 'mess', name: 'Mess Fee', amount: 18000 },
          { id: 'security', name: 'Security Deposit', amount: 5000 },
        ],
        dueDate1: '2024-04-01',
        dueDate2: '2024-10-01',
        installmentType: 'two',
        lateFeeApplicable: true,
        lateFeeAmount: 200,
        lateFeeType: 'fixed',
        concessions: [],
        createdAt: '2024-02-01T10:00:00Z',
      },
    ]

    return {
      success: true,
      data: feeGroups,
    }
  },

  async createFeeGroup(feeGroupData) {
    await delay(600)

    const newFeeGroup = {
      id: `fee-group-${Date.now()}`,
      ...feeGroupData,
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: newFeeGroup,
      message: 'Fee group created successfully',
    }
  },

  async updateFeeGroup(id, feeGroupData) {
    await delay(500)

    return {
      success: true,
      data: {
        id,
        ...feeGroupData,
        updatedAt: new Date().toISOString(),
      },
      message: 'Fee group updated successfully',
    }
  },

  async deleteFeeGroup(id) {
    await delay(300)

    return {
      success: true,
      message: 'Fee group deleted successfully',
    }
  },

  async duplicateFeeGroup(id) {
    await delay(400)

    return {
      success: true,
      message: 'Fee group duplicated successfully',
    }
  },

  // Fee Types Management
  async getFeeTypes() {
    await delay(300)

    const feeTypes = [
      {
        id: 'tuition',
        name: 'Tuition Fee',
        description: 'Monthly tuition charges',
        category: 'Academic',
        defaultAmount: 10000,
        status: 'active',
      },
      {
        id: 'development',
        name: 'Development Fee',
        description: 'Infrastructure development charges',
        category: 'Infrastructure',
        defaultAmount: 5000,
        status: 'active',
      },
      {
        id: 'library',
        name: 'Library Fee',
        description: 'Library usage and book charges',
        category: 'Academic',
        defaultAmount: 1000,
        status: 'active',
      },
      {
        id: 'sports',
        name: 'Sports Fee',
        description: 'Sports activities and equipment',
        category: 'Activities',
        defaultAmount: 2000,
        status: 'active',
      },
      {
        id: 'transport',
        name: 'Transport Fee',
        description: 'School bus transportation',
        category: 'Transport',
        defaultAmount: 8000,
        status: 'active',
      },
      {
        id: 'examination',
        name: 'Examination Fee',
        description: 'Exam registration and processing',
        category: 'Academic',
        defaultAmount: 1500,
        status: 'active',
      },
      {
        id: 'activity',
        name: 'Activity Fee',
        description: 'Co-curricular activities',
        category: 'Activities',
        defaultAmount: 1500,
        status: 'active',
      },
      {
        id: 'maintenance',
        name: 'Maintenance Fee',
        description: 'Building and facility maintenance',
        category: 'Infrastructure',
        defaultAmount: 1000,
        status: 'active',
      },
    ]

    return {
      success: true,
      data: feeTypes,
    }
  },

  async createFeeType(feeTypeData) {
    await delay(400)

    return {
      success: true,
      data: { id: `fee-type-${Date.now()}`, ...feeTypeData },
      message: 'Fee type created successfully',
    }
  },

  async updateFeeType(id, feeTypeData) {
    await delay(400)

    return {
      success: true,
      data: { id, ...feeTypeData },
      message: 'Fee type updated successfully',
    }
  },

  async deleteFeeType(id) {
    await delay(300)

    return {
      success: true,
      message: 'Fee type deleted successfully',
    }
  },

  // Concessions Management
  async getConcessions() {
    await delay(300)

    const concessions = [
      {
        id: 'sibling-discount',
        name: 'Sibling Discount',
        description: '10% discount for siblings',
        type: 'percentage',
        value: 10,
        status: 'active',
      },
      {
        id: 'merit-scholarship',
        name: 'Merit Scholarship',
        description: 'Scholarship for academic excellence',
        type: 'percentage',
        value: 25,
        status: 'active',
      },
      {
        id: 'staff-discount',
        name: 'Staff Discount',
        description: 'Discount for staff children',
        type: 'percentage',
        value: 50,
        status: 'active',
      },
      {
        id: 'financial-aid',
        name: 'Financial Aid',
        description: 'Need-based financial assistance',
        type: 'fixed',
        value: 5000,
        status: 'active',
      },
      {
        id: 'sports-quota',
        name: 'Sports Quota',
        description: 'Discount for sports achievements',
        type: 'percentage',
        value: 20,
        status: 'active',
      },
    ]

    return {
      success: true,
      data: concessions,
    }
  },

  // Student Fee Management
  async searchStudents(searchTerm) {
    await delay(400)

    const students = mockData.students
      .map(student => ({
        ...student,
        totalDue: Math.floor(Math.random() * 50000) + 10000,
        pendingInstallments: Math.floor(Math.random() * 5) + 1,
        admissionNumber: `ADM${student.rollNumber}`,
        fatherName: `Father of ${student.name}`,
        contactNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      }))
      .filter(
        student =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.admissionNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )

    return {
      success: true,
      data: students.slice(0, 10), // Limit search results
    }
  },

  async getStudentFeeDetails(studentId) {
    await delay(500)

    // Generate mock fee details for the student
    const feeDetails = [
      {
        id: 'fee-1',
        studentId,
        feeTypeName: 'Tuition Fee',
        installmentName: 'First Installment',
        amount: 15000,
        lateFee: 0,
        dueAmount: 15000,
        dueDate: '2024-04-15',
        isOverdue: new Date('2024-04-15') < new Date(),
        status: 'pending',
      },
      {
        id: 'fee-2',
        studentId,
        feeTypeName: 'Development Fee',
        installmentName: 'Annual',
        amount: 5000,
        lateFee: 100,
        dueAmount: 5100,
        dueDate: '2024-03-15',
        isOverdue: true,
        status: 'pending',
      },
      {
        id: 'fee-3',
        studentId,
        feeTypeName: 'Library Fee',
        installmentName: 'Annual',
        amount: 1000,
        lateFee: 0,
        dueAmount: 1000,
        dueDate: '2024-05-15',
        isOverdue: false,
        status: 'pending',
      },
      {
        id: 'fee-4',
        studentId,
        feeTypeName: 'Sports Fee',
        installmentName: 'Annual',
        amount: 2000,
        lateFee: 50,
        dueAmount: 2050,
        dueDate: '2024-04-01',
        isOverdue: true,
        status: 'pending',
      },
      {
        id: 'fee-5',
        studentId,
        feeTypeName: 'Transport Fee',
        installmentName: 'First Quarter',
        amount: 2000,
        lateFee: 0,
        dueAmount: 2000,
        dueDate: '2024-06-15',
        isOverdue: false,
        status: 'pending',
      },
    ]

    return {
      success: true,
      data: feeDetails,
    }
  },

  async processPayment(paymentData) {
    await delay(800)

    // Simulate payment processing
    const receiptNumber = `RCP${Date.now()}`

    return {
      success: true,
      data: {
        receiptNumber,
        ...paymentData,
        status: 'completed',
        processedAt: new Date().toISOString(),
      },
      message: 'Payment processed successfully',
    }
  },

  // Payment Search
  async searchPayments(filters) {
    await delay(600)

    // Generate mock payment data
    const payments = []
    const students = mockData.students.slice(0, 20)

    for (let i = 0; i < 50; i++) {
      const student = students[Math.floor(Math.random() * students.length)]
      const paymentModes = ['cash', 'card', 'upi', 'cheque', 'bank_transfer']
      const statuses = ['completed', 'pending', 'failed']
      const feeTypes = [
        {
          name: 'Tuition Fee',
          amount: Math.floor(Math.random() * 10000) + 5000,
        },
        {
          name: 'Development Fee',
          amount: Math.floor(Math.random() * 3000) + 2000,
        },
        { name: 'Library Fee', amount: Math.floor(Math.random() * 800) + 500 },
      ]

      const selectedFeeTypes = feeTypes.slice(
        0,
        Math.floor(Math.random() * 3) + 1,
      )
      const totalAmount = selectedFeeTypes.reduce(
        (sum, fee) => sum + fee.amount,
        0,
      )
      const discountAmount =
        Math.random() < 0.3 ? Math.floor(totalAmount * 0.1) : 0

      payments.push({
        id: `payment-${i + 1}`,
        receiptNumber: `RCP${Date.now() + i}`,
        studentName: student.name,
        rollNumber: student.rollNumber,
        className: student.className,
        section: student.section,
        admissionNumber: `ADM${student.rollNumber}`,
        paymentDate: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        paymentMode:
          paymentModes[Math.floor(Math.random() * paymentModes.length)],
        amount: totalAmount - discountAmount,
        discountAmount,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        feeGroupName: 'Annual Fees 2024-25',
        feeTypes: selectedFeeTypes,
        collectedBy: 'Admin User',
        remarks: Math.random() < 0.3 ? 'Partial payment' : '',
        paymentDetails: {
          transactionId: Math.random() < 0.5 ? `TXN${Date.now() + i}` : null,
          chequeNumber: Math.random() < 0.2 ? `CHQ${Date.now() + i}` : null,
          bankName: Math.random() < 0.3 ? 'State Bank of India' : null,
        },
      })
    }

    // Apply filters
    let filteredPayments = payments

    if (filters.searchTerm) {
      filteredPayments = filteredPayments.filter(
        payment =>
          payment.studentName
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          payment.rollNumber
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          payment.receiptNumber
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())
      )
    }

    if (filters.classId) {
      filteredPayments = filteredPayments.filter(
        payment => payment.classId === filters.classId,
      )
    }

    if (filters.paymentMode) {
      filteredPayments = filteredPayments.filter(
        payment => payment.paymentMode === filters.paymentMode,
      )
    }

    if (filters.status) {
      filteredPayments = filteredPayments.filter(
        payment => payment.status === filters.status,
      )
    }

    if (filters.dateFrom) {
      filteredPayments = filteredPayments.filter(
        payment => new Date(payment.paymentDate) >= new Date(filters.dateFrom)
      )
    }

    if (filters.dateTo) {
      filteredPayments = filteredPayments.filter(
        payment => new Date(payment.paymentDate) <= new Date(filters.dateTo)
      )
    }

    // Sort
    filteredPayments.sort((a, b) => {
      const aValue = a[filters.sortBy]
      const bValue = b[filters.sortBy]

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return {
      success: true,
      data: filteredPayments,
    }
  },

  // Due Fees Search
  async searchDueFees(filters) {
    await delay(700)

    // Generate mock due fees data
    const studentsWithDues = mockData.students.slice(0, 30).map(student => {
      const dueFees = []
      const feeTypes = [
        { name: 'Tuition Fee', installment: 'First Installment' },
        { name: 'Development Fee', installment: 'Annual' },
        { name: 'Library Fee', installment: 'Annual' },
        { name: 'Sports Fee', installment: 'Annual' },
        { name: 'Transport Fee', installment: 'First Quarter' },
      ]

      // Generate 1-5 due fees per student
      const numDueFees = Math.floor(Math.random() * 5) + 1
      for (let i = 0; i < numDueFees; i++) {
        const feeType = feeTypes[Math.floor(Math.random() * feeTypes.length)]
        const amount = Math.floor(Math.random() * 15000) + 2000
        const dueDate = new Date(
          Date.now() + (Math.random() - 0.5) * 60 * 24 * 60 * 60 * 1000,
        )
        const isOverdue = dueDate < new Date()
        const isDueToday = Math.abs(dueDate - new Date()) < 24 * 60 * 60 * 1000
        const lateFee = isOverdue ? Math.floor(amount * 0.05) : 0

        dueFees.push({
          id: `due-${student.id}-${i}`,
          feeTypeName: feeType.name,
          installmentName: feeType.installment,
          amount,
          lateFee,
          dueAmount: amount + lateFee,
          dueDate: dueDate.toISOString().split('T')[0],
          isOverdue,
          isDueToday,
        })
      }

      return {
        ...student,
        admissionNumber: `ADM${student.rollNumber}`,
        fatherName: `Father of ${student.name}`,
        contactNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        dueFees,
        lastPaymentDate:
          Math.random() < 0.8
            ? new Date(
                Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000,
              ).toISOString()
            : null,
        paymentHistory: [
          {
            date: new Date(
              Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            receiptNumber: `RCP${Date.now()}`,
            feeType: 'Tuition Fee',
            amount: Math.floor(Math.random() * 10000) + 5000,
            mode: 'cash',
          },
        ],
        updatedAt: new Date().toISOString(),
      }
    })

    // Apply filters
    let filteredStudents = studentsWithDues

    if (filters.searchTerm) {
      filteredStudents = filteredStudents.filter(
        student =>
          student.name
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          student.rollNumber
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          student.admissionNumber
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())
      )
    }

    if (filters.classId) {
      filteredStudents = filteredStudents.filter(
        student => student.classId === filters.classId,
      )
    }

    if (filters.overdueFilter === 'overdue') {
      filteredStudents = filteredStudents.filter(student =>
        student.dueFees.some(fee => fee.isOverdue)
      )
    } else if (filters.overdueFilter === 'due_today') {
      filteredStudents = filteredStudents.filter(student =>
        student.dueFees.some(fee => fee.isDueToday)
      )
    } else if (filters.overdueFilter === 'upcoming') {
      filteredStudents = filteredStudents.filter(student =>
        student.dueFees.some(fee => !fee.isOverdue && !fee.isDueToday)
      )
    }

    // Sort
    filteredStudents.sort((a, b) => {
      let aValue, bValue

      switch (filters.sortBy) {
        case 'totalDue':
          aValue = a.dueFees.reduce((sum, fee) => sum + fee.dueAmount, 0)
          bValue = b.dueFees.reduce((sum, fee) => sum + fee.dueAmount, 0)
          break
        case 'overdueAmount':
          aValue = a.dueFees.reduce(
            (sum, fee) => sum + (fee.isOverdue ? fee.dueAmount : 0),
            0,
          )
          bValue = b.dueFees.reduce(
            (sum, fee) => sum + (fee.isOverdue ? fee.dueAmount : 0),
            0,
          )
          break
        case 'studentName':
          aValue = a.name
          bValue = b.name
          break
        case 'className':
          aValue = a.className
          bValue = b.className
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return {
      success: true,
      data: filteredStudents,
    }
  },

  // Reminder System
  async sendFeeReminder(studentId) {
    await delay(500)

    return {
      success: true,
      message: 'Fee reminder sent successfully',
    }
  },

  async sendBulkReminders(reminderData) {
    await delay(1000)

    return {
      success: true,
      message: `Bulk reminders sent to ${reminderData.studentIds.length} students`,
    }
  },

  // Utility functions
  async getClasses() {
    await delay(200)

    return {
      success: true,
      data: mockData.classes,
    }
  },

  async getActiveFeeGroups() {
    await delay(300)

    const feeGroups = [
      {
        id: 'fee-group-1',
        name: 'Annual Fees 2024-25',
        status: 'active',
      },
      {
        id: 'fee-group-2',
        name: 'Quarterly Fees 2024-25',
        status: 'active',
      },
      {
        id: 'fee-group-3',
        name: 'Hostel Fees 2024-25',
        status: 'active',
      },
    ]

    return {
      success: true,
      data: feeGroups,
    }
  },

  // Bank Reconciliation
  async getBankTransactions(filters) {
    await delay(600)

    // Generate mock bank transaction data
    const transactions = []
    for (let i = 0; i < 100; i++) {
      const amount = Math.floor(Math.random() * 50000) + 1000
      const isReconciled = Math.random() < 0.7

      transactions.push({
        id: `bank-txn-${i + 1}`,
        transactionId: `TXN${Date.now() + i}`,
        date: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        amount,
        description: `Fee payment - ${Math.random() < 0.5 ? 'Online' : 'Offline'}`,
        bankReference: `REF${Date.now() + i}`,
        isReconciled,
        reconciledWith: isReconciled ? `RCP${Date.now() + i}` : null,
        reconciledDate: isReconciled ? new Date().toISOString() : null,
        status: isReconciled ? 'reconciled' : 'pending',
      })
    }

    return {
      success: true,
      data: transactions,
    }
  },

  async reconcileTransaction(transactionId, receiptNumber) {
    await delay(400)

    return {
      success: true,
      message: 'Transaction reconciled successfully',
    }
  },

  // Discount Management
  async getDiscounts() {
    await delay(500)

    const discounts = [
      {
        id: 'discount-1',
        name: 'Sibling Discount 2024',
        description: '10% discount for families with multiple children',
        category: 'sibling',
        discountType: 'percentage',
        value: 10,
        applicableClasses: [
          'class-1',
          'class-2',
          'class-3',
          'class-4',
          'class-5',
        ],
        applicableFeeTypes: ['tuition', 'development'],
        validFrom: '2024-04-01',
        validUntil: '2025-03-31',
        maxUsage: null,
        usageCount: 45,
        studentsCount: 45,
        totalSavings: 125000,
        status: 'active',
        conditions: [
          {
            type: 'sibling_count',
            value: '2',
            description: 'Minimum 2 siblings enrolled',
          },
        ],
        autoApply: true,
        stackable: false,
        priority: 1,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'discount-2',
        name: 'Merit Scholarship',
        description: 'Scholarship for students with 90%+ marks',
        category: 'merit',
        discountType: 'percentage',
        value: 25,
        applicableClasses: ['class-9', 'class-10', 'class-11', 'class-12'],
        applicableFeeTypes: ['tuition'],
        validFrom: '2024-04-01',
        validUntil: '2025-03-31',
        maxUsage: 50,
        usageCount: 12,
        studentsCount: 12,
        totalSavings: 180000,
        status: 'active',
        conditions: [
          {
            type: 'grade_requirement',
            value: '90',
            description: 'Minimum 90% in previous exam',
          },
        ],
        autoApply: false,
        stackable: true,
        priority: 2,
        createdAt: '2024-02-01T10:00:00Z',
      },
      {
        id: 'discount-3',
        name: 'Staff Discount',
        description: '50% discount for staff children',
        category: 'staff',
        discountType: 'percentage',
        value: 50,
        applicableClasses: [
          'class-1',
          'class-2',
          'class-3',
          'class-4',
          'class-5',
          'class-6',
          'class-7',
          'class-8',
          'class-9',
          'class-10',
        ],
        applicableFeeTypes: [],
        validFrom: '2024-04-01',
        validUntil: '2025-03-31',
        maxUsage: null,
        usageCount: 8,
        studentsCount: 8,
        totalSavings: 240000,
        status: 'active',
        conditions: [],
        autoApply: true,
        stackable: false,
        priority: 1,
        createdAt: '2024-01-10T10:00:00Z',
      },
    ]

    return {
      success: true,
      data: discounts,
    }
  },

  async createDiscount(discountData) {
    await delay(600)

    return {
      success: true,
      data: { id: `discount-${Date.now()}`, ...discountData },
      message: 'Discount created successfully',
    }
  },

  async updateDiscount(id, discountData) {
    await delay(500)

    return {
      success: true,
      data: { id, ...discountData },
      message: 'Discount updated successfully',
    }
  },

  async deleteDiscount(id) {
    await delay(300)

    return {
      success: true,
      message: 'Discount deleted successfully',
    }
  },

  async getEligibleStudents(discountId, filters) {
    await delay(600)

    const students = mockData.students
      .map(student => ({
        ...student,
        totalDue: Math.floor(Math.random() * 30000) + 5000,
        admissionNumber: `ADM${student.rollNumber}`,
        fatherName: `Father of ${student.name}`,
        contactNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      }))
      .filter(student => {
        const matchesSearch =
          !filters.searchTerm ||
          student.name
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          student.rollNumber
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())
        const matchesClass =
          !filters.classId || student.classId === filters.classId
        return matchesSearch && matchesClass
      })

    return {
      success: true,
      data: students.slice(0, 20),
    }
  },

  async applyDiscountToStudents(discountId, studentIds) {
    await delay(800)

    return {
      success: true,
      message: `Discount applied to ${studentIds.length} students successfully`,
    }
  },

  // Carry Forward Management
  async getCarryForwardStudents(filters) {
    await delay(700)

    const students = mockData.students.slice(0, 25).map(student => {
      const carryForwardItems = []
      const numItems = Math.floor(Math.random() * 4) + 1

      for (let i = 0; i < numItems; i++) {
        const feeTypes = [
          'Tuition Fee',
          'Development Fee',
          'Library Fee',
          'Sports Fee',
        ]
        const feeType = feeTypes[Math.floor(Math.random() * feeTypes.length)]
        const amount = Math.floor(Math.random() * 15000) + 2000

        carryForwardItems.push({
          id: `cf-item-${i}`,
          feeType,
          description: `${feeType} - Previous Year`,
          amount,
          dueDate: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
          )
            .toISOString()
            .split('T')[0],
        })
      }

      const adjustedAmount =
        Math.random() < 0.3 ? Math.floor(Math.random() * 5000) : 0
      const status =
        Math.random() < 0.7
          ? 'pending'
          : Math.random() < 0.9
            ? 'processed'
            : 'adjusted'

      return {
        ...student,
        previousClass: `Class ${Math.floor(Math.random() * 10) + 1}`,
        previousAcademicYear: '2023-24',
        currentAcademicYear: '2024-25',
        carryForwardItems,
        adjustedAmount,
        status,
        remarks:
          Math.random() < 0.3 ? 'Partial waiver approved by principal' : '',
        adjustmentHistory:
          adjustedAmount > 0
            ? [
                {
                  date: new Date().toISOString(),
                  type: 'waiver',
                  amount: adjustedAmount,
                  reason: 'Financial hardship',
                  adjustedBy: 'Admin User',
                },
              ]
            : [],
        updatedAt: new Date().toISOString(),
      }
    })

    // Apply filters
    let filteredStudents = students

    if (filters.searchTerm) {
      filteredStudents = filteredStudents.filter(
        student =>
          student.name
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          student.rollNumber
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())
      )
    }

    if (filters.status && filters.status !== 'all') {
      filteredStudents = filteredStudents.filter(
        student => student.status === filters.status,
      )
    }

    if (filters.classId) {
      filteredStudents = filteredStudents.filter(
        student => student.classId === filters.classId,
      )
    }

    return {
      success: true,
      data: filteredStudents,
    }
  },

  async adjustCarryForwardAmount(studentId, adjustmentData) {
    await delay(600)

    return {
      success: true,
      message: 'Carry forward amount adjusted successfully',
    }
  },

  async processCarryForward(studentId) {
    await delay(500)

    return {
      success: true,
      message: 'Carry forward processed successfully',
    }
  },

  async bulkProcessCarryForward(bulkData) {
    await delay(1200)

    return {
      success: true,
      message: `Bulk carry forward processed for ${bulkData.studentIds.length} students`,
    }
  },

  // Reminder Templates
  async getReminderTemplates() {
    await delay(400)

    const templates = [
      {
        id: 'template-1',
        name: 'Due Fee Reminder SMS',
        description: 'Standard SMS reminder for due fees',
        channel: 'sms',
        category: 'due_reminder',
        subject: '',
        content:
          'Dear Parent, your ward {studentName} (Roll: {rollNumber}) has pending fee payment of ₹{dueAmount}. Due date: {dueDate}. Please pay at the earliest. - {schoolName}',
        variables: [
          'studentName',
          'rollNumber',
          'dueAmount',
          'dueDate',
          'schoolName',
        ],
        status: 'active',
        autoSend: true,
        sendConditions: {
          daysBefore: 3,
          minimumAmount: 1000,
          overdueOnly: false,
        },
        usageCount: 245,
        lastUsed: '2024-03-10T10:00:00Z',
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'template-2',
        name: 'Overdue Notice Email',
        description: 'Formal email for overdue payments',
        channel: 'email',
        category: 'overdue_notice',
        subject: 'Overdue Fee Payment Notice - {studentName}',
        content:
          'Dear {fatherName},\n\nThis is to inform you that the fee payment for your ward {studentName} (Roll: {rollNumber}, Class: {className}) is overdue.\n\nDue Amount: ₹{dueAmount}\nDue Date: {dueDate}\n\nPlease make the payment immediately to avoid late fees.\n\nRegards,\n{schoolName}',
        variables: [
          'fatherName',
          'studentName',
          'rollNumber',
          'className',
          'dueAmount',
          'dueDate',
          'schoolName',
        ],
        status: 'active',
        autoSend: false,
        sendConditions: {
          daysBefore: 0,
          minimumAmount: 5000,
          overdueOnly: true,
        },
        usageCount: 89,
        lastUsed: '2024-03-08T15:30:00Z',
        createdAt: '2024-01-20T10:00:00Z',
      },
      {
        id: 'template-3',
        name: 'Payment Confirmation WhatsApp',
        description: 'WhatsApp message for payment confirmation',
        channel: 'whatsapp',
        category: 'payment_confirmation',
        subject: '',
        content:
          '✅ Payment Received!\n\nDear Parent, we have received fee payment of ₹{amount} for {studentName}.\n\nReceipt No: {receiptNumber}\nDate: {paymentDate}\n\nThank you! - {schoolName}',
        variables: [
          'amount',
          'studentName',
          'receiptNumber',
          'paymentDate',
          'schoolName',
        ],
        status: 'active',
        autoSend: true,
        sendConditions: {
          daysBefore: 0,
          minimumAmount: 0,
          overdueOnly: false,
        },
        usageCount: 156,
        lastUsed: '2024-03-12T09:15:00Z',
        createdAt: '2024-02-01T10:00:00Z',
      },
    ]

    return {
      success: true,
      data: templates,
    }
  },

  async createReminderTemplate(templateData) {
    await delay(500)

    return {
      success: true,
      data: { id: `template-${Date.now()}`, ...templateData },
      message: 'Reminder template created successfully',
    }
  },

  async updateReminderTemplate(id, templateData) {
    await delay(400)

    return {
      success: true,
      data: { id, ...templateData },
      message: 'Reminder template updated successfully',
    }
  },

  async deleteReminderTemplate(id) {
    await delay(300)

    return {
      success: true,
      message: 'Reminder template deleted successfully',
    }
  },

  async getStudentsWithDueFees(filters) {
    await delay(500)

    const students = mockData.students
      .slice(0, 30)
      .map(student => ({
        ...student,
        totalDue: Math.floor(Math.random() * 25000) + 5000,
        isOverdue: Math.random() < 0.4,
        admissionNumber: `ADM${student.rollNumber}`,
        fatherName: `Father of ${student.name}`,
        contactNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      }))
      .filter(student => {
        const matchesSearch =
          !filters.searchTerm ||
          student.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
        const matchesClass =
          !filters.classId || student.classId === filters.classId
        const matchesOverdue = !filters.overdueOnly || student.isOverdue
        return matchesSearch && matchesClass && matchesOverdue
      })

    return {
      success: true,
      data: students,
    }
  },

  async sendReminders(reminderData) {
    await delay(1000)

    return {
      success: true,
      message: `Reminders ${reminderData.scheduleTime ? 'scheduled' : 'sent'} to ${reminderData.studentIds.length} students`,
    }
  },

  async getReminderHistory() {
    await delay(400)

    const history = []
    for (let i = 0; i < 20; i++) {
      history.push({
        id: `history-${i}`,
        templateName: `Template ${i + 1}`,
        channel: ['sms', 'email', 'whatsapp'][Math.floor(Math.random() * 3)],
        studentCount: Math.floor(Math.random() * 50) + 10,
        sentAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: Math.random() < 0.9 ? 'sent' : 'failed',
        deliveryRate: Math.floor(Math.random() * 20) + 80,
      })
    }

    return {
      success: true,
      data: history,
    }
  },

  // Reports Dashboard
  async getFeesDashboard(filters) {
    await delay(800)

    const kpis = {
      totalCollection: Math.floor(Math.random() * 5000000) + 2000000,
      collectionChange: '+12.5%',
      collectionChangeType: 'positive',
      outstandingDues: Math.floor(Math.random() * 2000000) + 500000,
      duesChange: '-8.3%',
      duesChangeType: 'positive',
      studentsPaid: Math.floor(Math.random() * 500) + 200,
      studentsChange: '+15',
      studentsChangeType: 'positive',
      collectionRate: Math.floor(Math.random() * 20) + 75,
      rateChange: '+5.2%',
      rateChangeType: 'positive',
    }

    const collectionTrends = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      collectionTrends.push({
        period: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        amount: Math.floor(Math.random() * 200000) + 50000,
      })
    }

    const paymentModes = [
      { name: 'Cash', value: Math.floor(Math.random() * 1000000) + 500000 },
      { name: 'UPI', value: Math.floor(Math.random() * 800000) + 400000 },
      { name: 'Card', value: Math.floor(Math.random() * 600000) + 300000 },
      {
        name: 'Bank Transfer',
        value: Math.floor(Math.random() * 400000) + 200000,
      },
      { name: 'Cheque', value: Math.floor(Math.random() * 300000) + 100000 },
    ]

    const duesAging = [
      {
        ageGroup: '0-30 days',
        amount: Math.floor(Math.random() * 500000) + 200000,
      },
      {
        ageGroup: '31-60 days',
        amount: Math.floor(Math.random() * 400000) + 150000,
      },
      {
        ageGroup: '61-90 days',
        amount: Math.floor(Math.random() * 300000) + 100000,
      },
      {
        ageGroup: '91-180 days',
        amount: Math.floor(Math.random() * 200000) + 75000,
      },
      {
        ageGroup: '180+ days',
        amount: Math.floor(Math.random() * 150000) + 50000,
      },
    ]

    const concessionAnalytics = [
      {
        concessionType: 'Sibling',
        amount: Math.floor(Math.random() * 200000) + 100000,
        students: Math.floor(Math.random() * 50) + 25,
      },
      {
        concessionType: 'Merit',
        amount: Math.floor(Math.random() * 300000) + 150000,
        students: Math.floor(Math.random() * 30) + 15,
      },
      {
        concessionType: 'Staff',
        amount: Math.floor(Math.random() * 250000) + 120000,
        students: Math.floor(Math.random() * 20) + 10,
      },
      {
        concessionType: 'Financial Aid',
        amount: Math.floor(Math.random() * 180000) + 80000,
        students: Math.floor(Math.random() * 25) + 12,
      },
    ]

    const summary = {
      totalCollected: kpis.totalCollection,
      totalOutstanding: kpis.outstandingDues,
      collectionEfficiency: kpis.collectionRate,
    }

    return {
      success: true,
      data: {
        kpis,
        charts: {
          collectionTrends,
          paymentModes,
          duesAging,
          concessionAnalytics,
        },
        summary,
      },
    }
  },

  async getDetailedReport(reportType, filters) {
    await delay(600)

    const data = []

    if (reportType === 'collection') {
      for (let i = 0; i < 50; i++) {
        const student =
          mockData.students[
            Math.floor(Math.random() * mockData.students.length)
          ]
        data.push({
          date: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          studentName: student.name,
          className: student.className,
          amount: Math.floor(Math.random() * 25000) + 5000,
          paymentMode: ['cash', 'upi', 'card', 'bank_transfer'][
            Math.floor(Math.random() * 4)
          ],
          receiptNumber: `RCP${Date.now() + i}`,
        })
      }
    }

    return {
      success: true,
      data,
    }
  },
}

export default feesApi
