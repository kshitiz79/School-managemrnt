// Mock data for the school management system

// Classes and Sections
export const classes = [
  {
    id: 'class-1',
    name: 'Class 1',
    level: 1,
    sections: ['A', 'B'],
    createdAt: '2023-04-01',
  },
  {
    id: 'class-2',
    name: 'Class 2',
    level: 2,
    sections: ['A', 'B', 'C'],
    createdAt: '2023-04-01',
  },
  {
    id: 'class-3',
    name: 'Class 3',
    level: 3,
    sections: ['A', 'B'],
    createdAt: '2023-04-01',
  },
  {
    id: 'class-4',
    name: 'Class 4',
    level: 4,
    sections: ['A', 'B', 'C'],
    createdAt: '2023-04-01',
  },
  {
    id: 'class-5',
    name: 'Class 5',
    level: 5,
    sections: ['A', 'B'],
    createdAt: '2023-04-01',
  },
  {
    id: 'class-6',
    name: 'Class 6',
    level: 6,
    sections: ['A', 'B', 'C'],
    createdAt: '2023-04-01',
  },
  {
    id: 'class-7',
    name: 'Class 7',
    level: 7,
    sections: ['A', 'B'],
    createdAt: '2023-04-01',
  },
  {
    id: 'class-8',
    name: 'Class 8',
    level: 8,
    sections: ['A', 'B', 'C'],
    createdAt: '2023-04-01',
  },
  {
    id: 'class-9',
    name: 'Class 9',
    level: 9,
    sections: ['A', 'B'],
    createdAt: '2023-04-01',
  },
  {
    id: 'class-10',
    name: 'Class 10',
    level: 10,
    sections: ['A', 'B', 'C'],
    createdAt: '2023-04-01',
  },
]

// Subjects
export const subjects = [
  { id: 'math', name: 'Mathematics', code: 'MATH' },
  { id: 'english', name: 'English', code: 'ENG' },
  { id: 'science', name: 'Science', code: 'SCI' },
  { id: 'social', name: 'Social Studies', code: 'SS' },
  { id: 'hindi', name: 'Hindi', code: 'HIN' },
  { id: 'physics', name: 'Physics', code: 'PHY' },
  { id: 'chemistry', name: 'Chemistry', code: 'CHEM' },
  { id: 'biology', name: 'Biology', code: 'BIO' },
  { id: 'history', name: 'History', code: 'HIST' },
  { id: 'geography', name: 'Geography', code: 'GEO' },
  { id: 'computer', name: 'Computer Science', code: 'CS' },
  { id: 'art', name: 'Art & Craft', code: 'ART' },
  { id: 'pe', name: 'Physical Education', code: 'PE' },
]

// Staff Members
export const staff = [
  {
    id: 'staff-1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@school.edu',
    phone: '+1-555-0101',
    role: 'principal',
    employeeId: 'EMP001',
    department: 'Administration',
    subjects: [],
    classes: [],
    joiningDate: '2020-06-15',
    salary: 75000,
    address: '123 Main St, City, State 12345',
    qualification: 'Ph.D. in Education',
    experience: 15,
    status: 'active',
    avatar: null,
  },
  {
    id: 'staff-2',
    name: 'Mr. John Smith',
    email: 'john.smith@school.edu',
    phone: '+1-555-0102',
    role: 'teacher',
    employeeId: 'EMP002',
    department: 'Mathematics',
    subjects: ['math'],
    classes: ['class-9', 'class-10'],
    joiningDate: '2019-08-20',
    salary: 55000,
    address: '456 Oak Ave, City, State 12345',
    qualification: 'M.Sc. Mathematics',
    experience: 8,
    status: 'active',
    avatar: null,
  },
  {
    id: 'staff-3',
    name: 'Ms. Emily Davis',
    email: 'emily.davis@school.edu',
    phone: '+1-555-0103',
    role: 'teacher',
    employeeId: 'EMP003',
    department: 'English',
    subjects: ['english'],
    classes: ['class-8', 'class-9'],
    joiningDate: '2021-03-10',
    salary: 52000,
    address: '789 Pine St, City, State 12345',
    qualification: 'M.A. English Literature',
    experience: 5,
    status: 'active',
    avatar: null,
  },
  {
    id: 'staff-4',
    name: 'Dr. Michael Brown',
    email: 'michael.brown@school.edu',
    phone: '+1-555-0104',
    role: 'teacher',
    employeeId: 'EMP004',
    department: 'Science',
    subjects: ['physics', 'chemistry'],
    classes: ['class-9', 'class-10'],
    joiningDate: '2018-07-01',
    salary: 58000,
    address: '321 Elm St, City, State 12345',
    qualification: 'Ph.D. Physics',
    experience: 12,
    status: 'active',
    avatar: null,
  },
  {
    id: 'staff-5',
    name: 'Mrs. Lisa Wilson',
    email: 'lisa.wilson@school.edu',
    phone: '+1-555-0105',
    role: 'accountant',
    employeeId: 'EMP005',
    department: 'Finance',
    subjects: [],
    classes: [],
    joiningDate: '2020-01-15',
    salary: 48000,
    address: '654 Maple Ave, City, State 12345',
    qualification: 'M.Com, CPA',
    experience: 10,
    status: 'active',
    avatar: null,
  },
]

// Students
export const students = [
  {
    id: 'student-1',
    name: 'Alex Johnson',
    email: 'alex.johnson@student.edu',
    phone: '+1-555-1001',
    rollNumber: 'STU001',
    admissionNumber: 'ADM2023001',
    classId: 'class-10',
    section: 'A',
    dateOfBirth: '2008-05-15',
    gender: 'male',
    address: '123 Student St, City, State 12345',
    parentName: 'Robert Johnson',
    parentPhone: '+1-555-2001',
    parentEmail: 'robert.johnson@parent.edu',
    admissionDate: '2023-04-01',
    status: 'active',
    avatar: null,
    bloodGroup: 'O+',
    religion: 'Christian',
    category: 'General',
  },
  {
    id: 'student-2',
    name: 'Emma Smith',
    email: 'emma.smith@student.edu',
    phone: '+1-555-1002',
    rollNumber: 'STU002',
    admissionNumber: 'ADM2023002',
    classId: 'class-10',
    section: 'A',
    dateOfBirth: '2008-08-22',
    gender: 'female',
    address: '456 Student Ave, City, State 12345',
    parentName: 'Jennifer Smith',
    parentPhone: '+1-555-2002',
    parentEmail: 'jennifer.smith@parent.edu',
    admissionDate: '2023-04-01',
    status: 'active',
    avatar: null,
    bloodGroup: 'A+',
    religion: 'Hindu',
    category: 'General',
  },
  {
    id: 'student-3',
    name: 'Michael Davis',
    email: 'michael.davis@student.edu',
    phone: '+1-555-1003',
    rollNumber: 'STU003',
    admissionNumber: 'ADM2023003',
    classId: 'class-9',
    section: 'B',
    dateOfBirth: '2009-03-10',
    gender: 'male',
    address: '789 Student Blvd, City, State 12345',
    parentName: 'David Davis',
    parentPhone: '+1-555-2003',
    parentEmail: 'david.davis@parent.edu',
    admissionDate: '2023-04-01',
    status: 'active',
    avatar: null,
    bloodGroup: 'B+',
    religion: 'Muslim',
    category: 'OBC',
  },
  // Add more students...
  ...Array.from({ length: 47 }, (_, i) => ({
    id: `student-${i + 4}`,
    name: `Student ${i + 4}`,
    email: `student${i + 4}@student.edu`,
    phone: `+1-555-${1004 + i}`,
    rollNumber: `STU${String(i + 4).padStart(3, '0')}`,
    admissionNumber: `ADM2023${String(i + 4).padStart(3, '0')}`,
    classId: classes[Math.floor(Math.random() * classes.length)].id,
    section: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
    dateOfBirth: `200${8 + Math.floor(Math.random() * 3)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    gender: Math.random() > 0.5 ? 'male' : 'female',
    address: `${i + 4} Student St, City, State 12345`,
    parentName: `Parent ${i + 4}`,
    parentPhone: `+1-555-${2004 + i}`,
    parentEmail: `parent${i + 4}@parent.edu`,
    admissionDate: '2023-04-01',
    status: Math.random() > 0.1 ? 'active' : 'inactive',
    avatar: null,
    bloodGroup: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][
      Math.floor(Math.random() * 8)
    ],
    religion: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist'][
      Math.floor(Math.random() * 5)
    ],
    category: ['General', 'OBC', 'SC', 'ST'][Math.floor(Math.random() * 4)],
  })),
]

// Attendance Records
export const attendanceRecords = []
const generateAttendanceRecords = () => {
  const records = []
  const today = new Date()

  // Generate attendance for last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Student attendance
    students.forEach(student => {
      if (Math.random() > 0.1) {
        // 90% attendance rate
        records.push({
          id: `att-${student.id}-${date.toISOString().split('T')[0]}`,
          type: 'student',
          userId: student.id,
          date: date.toISOString().split('T')[0],
          status: Math.random() > 0.05 ? 'present' : 'absent',
          timeIn: '09:00',
          timeOut: '15:30',
          remarks: '',
          markedBy: 'staff-2',
          markedAt: date.toISOString(),
        })
      }
    })

    // Staff attendance
    staff.forEach(staffMember => {
      if (Math.random() > 0.05) {
        // 95% attendance rate
        records.push({
          id: `att-${staffMember.id}-${date.toISOString().split('T')[0]}`,
          type: 'staff',
          userId: staffMember.id,
          date: date.toISOString().split('T')[0],
          status: Math.random() > 0.02 ? 'present' : 'absent',
          timeIn: '08:30',
          timeOut: '16:30',
          remarks: '',
          markedBy: 'staff-1',
          markedAt: date.toISOString(),
        })
      }
    })
  }

  return records
}

export const attendance = generateAttendanceRecords()

// Exams
export const exams = [
  {
    id: 'exam-1',
    name: 'Mid-Term Examination',
    type: 'mid-term',
    classId: 'class-10',
    section: 'A',
    subjectId: 'math',
    date: '2024-02-15',
    startTime: '09:00',
    endTime: '12:00',
    totalMarks: 100,
    passingMarks: 35,
    status: 'completed',
    createdBy: 'staff-2',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'exam-2',
    name: 'English Literature Test',
    type: 'unit-test',
    classId: 'class-9',
    section: 'A',
    subjectId: 'english',
    date: '2024-02-20',
    startTime: '10:00',
    endTime: '11:30',
    totalMarks: 50,
    passingMarks: 18,
    status: 'scheduled',
    createdBy: 'staff-3',
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'exam-3',
    name: 'Physics Practical',
    type: 'practical',
    classId: 'class-10',
    section: 'B',
    subjectId: 'physics',
    date: '2024-02-25',
    startTime: '14:00',
    endTime: '16:00',
    totalMarks: 30,
    passingMarks: 12,
    status: 'scheduled',
    createdBy: 'staff-4',
    createdAt: '2024-01-25T10:00:00Z',
  },
]

// Exam Results
export const examResults = [
  {
    id: 'result-1',
    examId: 'exam-1',
    studentId: 'student-1',
    marksObtained: 85,
    grade: 'A',
    remarks: 'Excellent performance',
    evaluatedBy: 'staff-2',
    evaluatedAt: '2024-02-16T10:00:00Z',
  },
  {
    id: 'result-2',
    examId: 'exam-1',
    studentId: 'student-2',
    marksObtained: 78,
    grade: 'B+',
    remarks: 'Good work',
    evaluatedBy: 'staff-2',
    evaluatedAt: '2024-02-16T10:00:00Z',
  },
]

// Fee Structure
export const feeStructure = [
  {
    id: 'fee-1',
    name: 'Tuition Fee',
    classId: 'class-10',
    amount: 5000,
    frequency: 'monthly',
    dueDate: 10,
    category: 'academic',
    description: 'Monthly tuition fee for Class 10',
  },
  {
    id: 'fee-2',
    name: 'Library Fee',
    classId: 'class-10',
    amount: 500,
    frequency: 'annual',
    dueDate: 30,
    category: 'facility',
    description: 'Annual library fee',
  },
  {
    id: 'fee-3',
    name: 'Sports Fee',
    classId: 'class-10',
    amount: 1000,
    frequency: 'annual',
    dueDate: 30,
    category: 'activity',
    description: 'Annual sports and activities fee',
  },
]

// Fee Payments

const generateFeePayments = () => {
  const payments = []
  students.forEach(student => {
    // Generate some payment history
    for (let i = 0; i < Math.floor(Math.random() * 6) + 1; i++) {
      const paymentDate = new Date()
      paymentDate.setMonth(paymentDate.getMonth() - i)

      payments.push({
        id: `payment-${student.id}-${i}`,
        studentId: student.id,
        feeId: 'fee-1',
        amount: 5000,
        paymentDate: paymentDate.toISOString().split('T')[0],
        paymentMethod: ['cash', 'card', 'online', 'cheque'][
          Math.floor(Math.random() * 4)
        ],
        transactionId: `TXN${Date.now()}${i}`,
        status: Math.random() > 0.05 ? 'paid' : 'pending',
        receivedBy: 'staff-5',
        remarks: '',
      })
    }
  })
  return payments
}

export const feePayments = generateFeePayments()

// Notices
export const notices = [
  {
    id: 'notice-1',
    title: 'School Reopening After Winter Break',
    content:
      'School will reopen on January 8th, 2024 after winter break. All students are expected to attend classes regularly.',
    type: 'general',
    priority: 'high',
    targetAudience: ['student', 'parent', 'staff'],
    publishedBy: 'staff-1',
    publishedAt: '2024-01-01T10:00:00Z',
    validUntil: '2024-01-15T23:59:59Z',
    status: 'published',
    attachments: [],
  },
  {
    id: 'notice-2',
    title: 'Parent-Teacher Meeting',
    content:
      "Parent-Teacher meeting is scheduled for February 10th, 2024. Parents are requested to meet their ward's class teacher.",
    type: 'meeting',
    priority: 'medium',
    targetAudience: ['parent'],
    publishedBy: 'staff-1',
    publishedAt: '2024-01-20T10:00:00Z',
    validUntil: '2024-02-10T23:59:59Z',
    status: 'published',
    attachments: [],
  },
  {
    id: 'notice-3',
    title: 'Annual Sports Day',
    content:
      'Annual Sports Day will be held on March 15th, 2024. All students are encouraged to participate in various sports activities.',
    type: 'event',
    priority: 'medium',
    targetAudience: ['student', 'parent', 'staff'],
    publishedBy: 'staff-1',
    publishedAt: '2024-02-01T10:00:00Z',
    validUntil: '2024-03-15T23:59:59Z',
    status: 'published',
    attachments: [],
  },
]

// Homework
export const homework = [
  {
    id: 'hw-1',
    title: 'Algebra Practice Problems',
    description: 'Complete exercises 1-20 from Chapter 5: Quadratic Equations',
    subjectId: 'math',
    classId: 'class-10',
    section: 'A',
    assignedBy: 'staff-2',
    assignedDate: '2024-01-15',
    dueDate: '2024-01-18',
    status: 'active',
    attachments: [],
    instructions: 'Show all working steps clearly',
  },
  {
    id: 'hw-2',
    title: 'Essay Writing',
    description: 'Write a 500-word essay on "The Importance of Education"',
    subjectId: 'english',
    classId: 'class-9',
    section: 'A',
    assignedBy: 'staff-3',
    assignedDate: '2024-01-16',
    dueDate: '2024-01-20',
    status: 'active',
    attachments: [],
    instructions: 'Use proper grammar and structure',
  },
]

// Homework Submissions
export const homeworkSubmissions = [
  {
    id: 'sub-1',
    homeworkId: 'hw-1',
    studentId: 'student-1',
    submittedAt: '2024-01-17T14:30:00Z',
    status: 'submitted',
    attachments: [],
    remarks: '',
    grade: null,
    gradedBy: null,
    gradedAt: null,
  },
]

// Admissions
export const admissions = [
  {
    id: 'adm-1',
    applicationNumber: 'APP2024001',
    studentName: 'John Doe',
    fatherName: 'Robert Doe',
    motherName: 'Jane Doe',
    dateOfBirth: '2010-05-15',
    gender: 'male',
    classApplied: 'class-8',
    previousSchool: 'ABC Public School',
    address: '123 New St, City, State 12345',
    phone: '+1-555-3001',
    email: 'robert.doe@email.com',
    applicationDate: '2024-01-10',
    status: 'pending',
    documents: ['birth_certificate', 'previous_school_tc', 'photos'],
    interviewDate: '2024-01-25',
    remarks: '',
    processedBy: null,
  },
  {
    id: 'adm-2',
    applicationNumber: 'APP2024002',
    studentName: 'Mary Johnson',
    fatherName: 'James Johnson',
    motherName: 'Lisa Johnson',
    dateOfBirth: '2009-08-22',
    gender: 'female',
    classApplied: 'class-9',
    previousSchool: 'XYZ Convent School',
    address: '456 Oak Ave, City, State 12345',
    phone: '+1-555-3002',
    email: 'james.johnson@email.com',
    applicationDate: '2024-01-12',
    status: 'approved',
    documents: ['birth_certificate', 'previous_school_tc', 'photos'],
    interviewDate: '2024-01-20',
    remarks: 'Good academic record',
    processedBy: 'staff-1',
  },
]

// Leave Requests
export const leaveRequests = [
  {
    id: 'leave-1',
    userId: 'student-1',
    userType: 'student',
    type: 'sick',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    reason: 'Fever and cold',
    status: 'approved',
    appliedAt: '2024-01-19T10:00:00Z',
    approvedBy: 'staff-2',
    approvedAt: '2024-01-19T14:00:00Z',
    remarks: 'Medical certificate provided',
    attachments: ['medical_certificate.pdf'],
  },
  {
    id: 'leave-2',
    userId: 'staff-3',
    userType: 'staff',
    type: 'personal',
    startDate: '2024-01-25',
    endDate: '2024-01-25',
    reason: 'Family function',
    status: 'pending',
    appliedAt: '2024-01-22T10:00:00Z',
    approvedBy: null,
    approvedAt: null,
    remarks: '',
    attachments: [],
  },
]

// Moc

export const notifications = [
  {
    id: 'notif-1',
    type: 'assignment',
    title: 'New Assignment Posted',
    message: 'Mathematics homework has been assigned for Class 10-A',
    timestamp: '2024-02-08T10:30:00Z',
    read: false,
    priority: 'medium',
    targetRoles: ['student', 'parent'],
    actionUrl: '/dashboard/student/assignments',
  },
  {
    id: 'notif-2',
    type: 'fee',
    title: 'Fee Payment Due',
    message: 'Monthly tuition fee payment is due in 3 days',
    timestamp: '2024-02-08T09:15:00Z',
    read: false,
    priority: 'high',
    targetRoles: ['parent', 'student'],
    actionUrl: '/dashboard/parent/fees',
  },
  {
    id: 'notif-3',
    type: 'event',
    title: 'Parent-Teacher Meeting',
    message: 'Scheduled for February 15th, 2024 at 2:00 PM',
    timestamp: '2024-02-07T16:45:00Z',
    read: true,
    priority: 'medium',
    targetRoles: ['parent', 'teacher'],
    actionUrl: '/dashboard/parent/events',
  },
  {
    id: 'notif-4',
    type: 'grade',
    title: 'Exam Results Published',
    message: 'Mid-term examination results are now available',
    timestamp: '2024-02-07T14:20:00Z',
    read: true,
    priority: 'low',
    targetRoles: ['student', 'parent'],
    actionUrl: '/dashboard/student/grades',
  },
  {
    id: 'notif-5',
    type: 'attendance',
    title: 'Attendance Alert',
    message: 'Student attendance is below 75% this month',
    timestamp: '2024-02-06T11:00:00Z',
    read: false,
    priority: 'high',
    targetRoles: ['student', 'parent', 'teacher'],
    actionUrl: '/dashboard/student/attendance',
  },
  {
    id: 'notif-6',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on February 10th from 2:00 AM to 4:00 AM',
    timestamp: '2024-02-05T18:00:00Z',
    read: false,
    priority: 'medium',
    targetRoles: ['admin', 'principal'],
    actionUrl: '/dashboard/admin/system',
  },
  {
    id: 'notif-7',
    type: 'announcement',
    title: 'School Holiday',
    message:
      'School will be closed on February 12th for Republic Day celebration',
    timestamp: '2024-02-04T12:00:00Z',
    read: true,
    priority: 'low',
    targetRoles: ['student', 'parent', 'teacher', 'staff'],
    actionUrl: '/dashboard/notices',
  },
]

// Export updated default object
export default {
  classes,
  subjects,
  staff,
  students,
  attendance,
  exams,
  examResults,
  feeStructure,
  feePayments,
  notices,
  homework,
  homeworkSubmissions,
  admissions,
  leaveRequests,
  notifications,
}
