import { z } from 'zod'

// Common validation schemas
export const phoneSchema = z
  .string()
  .regex(/^[+]?[\d\s\-\(\)]{10,15}$/, 'Invalid phone number format')

export const emailSchema = z.string().email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and number'
  )

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .regex(
    /^[a-zA-Z\s.'-]+$/,
    'Name can only contain letters, spaces, dots, apostrophes, and hyphens'
  )

export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  country: z.string().default('India'),
})

// User schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const userSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  role: z.enum([
    'admin',
    'principal',
    'teacher',
    'student',
    'parent',
    'accountant',
  ]),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  avatar: z.string().url().optional(),
})

// Student schemas
export const studentSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  rollNumber: z.string().min(1, 'Roll number is required'),
  admissionNumber: z.string().min(1, 'Admission number is required'),
  classId: z.string().min(1, 'Class is required'),
  section: z.string().min(1, 'Section is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  gender: z.enum(['male', 'female', 'other']),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  religion: z.string().optional(),
  category: z.enum(['General', 'OBC', 'SC', 'ST', 'Other']).optional(),
  address: addressSchema,
  parentName: nameSchema,
  parentPhone: phoneSchema,
  parentEmail: emailSchema,
  admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  status: z
    .enum(['active', 'inactive', 'transferred', 'graduated'])
    .default('active'),
})

// Staff schemas
export const staffSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  employeeId: z.string().min(1, 'Employee ID is required'),
  role: z.enum([
    'principal',
    'teacher',
    'accountant',
    'librarian',
    'admin_staff',
  ]),
  department: z.string().min(1, 'Department is required'),
  subjects: z.array(z.string()).optional(),
  classes: z.array(z.string()).optional(),
  joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  salary: z.number().positive('Salary must be positive'),
  address: addressSchema,
  qualification: z.string().min(1, 'Qualification is required'),
  experience: z.number().min(0, 'Experience cannot be negative'),
  status: z
    .enum(['active', 'inactive', 'on_leave', 'terminated'])
    .default('active'),
})

// Class schemas
export const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  level: z.number().int().min(1).max(12),
  sections: z.array(z.string()).min(1, 'At least one section is required'),
  capacity: z.number().int().positive('Capacity must be positive').optional(),
  classTeacher: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Invalid academic year format'),
})

// Subject schemas
export const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required'),
  type: z.enum(['core', 'elective', 'optional']).default('core'),
  credits: z.number().positive('Credits must be positive').optional(),
  description: z.string().optional(),
  classes: z.array(z.string()).optional(),
  teachers: z.array(z.string()).optional(),
})

// Attendance schemas
export const attendanceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  userType: z.enum(['student', 'staff']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  status: z.enum(['present', 'absent', 'late', 'half_day']),
  timeIn: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format')
    .optional(),
  timeOut: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format')
    .optional(),
  remarks: z.string().optional(),
  markedBy: z.string().min(1, 'Marked by is required'),
})

// Exam schemas
export const examSchema = z.object({
  name: z.string().min(1, 'Exam name is required'),
  type: z.enum(['unit_test', 'mid_term', 'final', 'practical', 'assignment']),
  classId: z.string().min(1, 'Class is required'),
  section: z.string().min(1, 'Section is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  totalMarks: z.number().positive('Total marks must be positive'),
  passingMarks: z.number().positive('Passing marks must be positive'),
  instructions: z.string().optional(),
})

export const examResultSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  marksObtained: z.number().min(0, 'Marks cannot be negative'),
  grade: z.string().optional(),
  remarks: z.string().optional(),
  evaluatedBy: z.string().min(1, 'Evaluated by is required'),
})

// Fee schemas
export const feeStructureSchema = z.object({
  name: z.string().min(1, 'Fee name is required'),
  classId: z.string().min(1, 'Class is required'),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.enum([
    'monthly',
    'quarterly',
    'half_yearly',
    'annual',
    'one_time',
  ]),
  dueDate: z.number().int().min(1).max(31),
  category: z.enum([
    'academic',
    'transport',
    'hostel',
    'library',
    'sports',
    'other',
  ]),
  description: z.string().optional(),
  isOptional: z.boolean().default(false),
})

export const feePaymentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  feeId: z.string().min(1, 'Fee ID is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['cash', 'card', 'online', 'cheque', 'dd']),
  transactionId: z.string().optional(),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  receivedBy: z.string().min(1, 'Received by is required'),
  remarks: z.string().optional(),
})

// Notice schemas
export const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum([
    'general',
    'academic',
    'event',
    'holiday',
    'urgent',
    'circular',
  ]),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  targetAudience: z.array(
    z.enum(['student', 'parent', 'staff', 'teacher', 'all'])
  ),
  publishedBy: z.string().min(1, 'Published by is required'),
  validUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid datetime format')
    .optional(),
  attachments: z.array(z.string()).optional(),
  classes: z.array(z.string()).optional(),
})

// Homework schemas
export const homeworkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  classId: z.string().min(1, 'Class is required'),
  section: z.string().min(1, 'Section is required'),
  assignedBy: z.string().min(1, 'Assigned by is required'),
  assignedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  instructions: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  maxMarks: z.number().positive().optional(),
})

// Library schemas
export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z
    .string()
    .regex(/^[\d-]{10,17}$/, 'Invalid ISBN format')
    .optional(),
  category: z.string().min(1, 'Category is required'),
  publisher: z.string().optional(),
  publishedYear: z.number().int().min(1900).max(new Date().getFullYear()),
  copies: z.number().int().positive('Copies must be positive'),
  availableCopies: z.number().int().min(0),
  location: z.string().optional(),
  price: z.number().positive().optional(),
})

// Transport schemas
export const vehicleSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  type: z.enum(['bus', 'van', 'car']),
  capacity: z.number().int().positive('Capacity must be positive'),
  driver: z.string().min(1, 'Driver is required'),
  driverPhone: phoneSchema,
  route: z.string().min(1, 'Route is required'),
  status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
})

// Settings schemas
export const schoolSettingsSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  address: addressSchema,
  phone: phoneSchema,
  email: emailSchema,
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Invalid academic year format'),
  workingDays: z.array(
    z.enum([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ])
  ),
  sessionTiming: z.object({
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  }),
})

export default {
  phoneSchema,
  emailSchema,
  passwordSchema,
  nameSchema,
  addressSchema,
  loginSchema,
  userSchema,
  studentSchema,
  staffSchema,
  classSchema,
  subjectSchema,
  attendanceSchema,
  examSchema,
  examResultSchema,
  feeStructureSchema,
  feePaymentSchema,
  noticeSchema,
  homeworkSchema,
  bookSchema,
  vehicleSchema,
  schoolSettingsSchema,
}
