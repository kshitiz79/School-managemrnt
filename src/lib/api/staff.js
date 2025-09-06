// Mock API for staff management
import { staffSchema } from '../validators'

// In-memory store
let staffStore = []
let nextId = 1

// Simulate API latency
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Generate realistic staff data
const generateStaff = () => {
  const firstNames = [
    'Rajesh',
    'Priya',
    'Amit',
    'Sunita',
    'Vikram',
    'Meera',
    'Suresh',
    'Kavita',
    'Ravi',
    'Anita',
    'Deepak',
    'Pooja',
    'Manoj',
    'Rekha',
    'Ashok',
    'Geeta',
    'Ramesh',
    'Sita',
    'Vinod',
    'Usha',
    'Anil',
    'Shanti',
    'Prakash',
    'Lata',
    'Mohan',
    'Radha',
    'Kishore',
    'Mala',
    'Gopal',
    'Nirmala',
  ]
  const lastNames = [
    'Sharma',
    'Verma',
    'Gupta',
    'Singh',
    'Kumar',
    'Agarwal',
    'Jain',
    'Patel',
    'Shah',
    'Mehta',
    'Reddy',
    'Nair',
    'Iyer',
    'Rao',
    'Pillai',
    'Menon',
    'Bhat',
    'Shetty',
    'Kulkarni',
    'Desai',
  ]
  const departments = [
    'Mathematics',
    'English',
    'Science',
    'Social Studies',
    'Hindi',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Physical Education',
    'Art',
    'Music',
    'Administration',
  ]
  const subjects = [
    'Mathematics',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Computer Science',
    'Physical Education',
    'Art',
    'Music',
    'Hindi',
    'Sanskrit',
  ]
  const qualifications = [
    'B.Ed, M.A. English',
    'M.Sc. Mathematics, B.Ed',
    'Ph.D. Physics',
    'M.Sc. Chemistry, B.Ed',
    'M.A. History, B.Ed',
    'M.Sc. Biology, B.Ed',
    'MCA, B.Ed',
    'M.P.Ed',
    'M.A. Hindi, B.Ed',
    'M.Com, B.Ed',
    'MBA',
    'M.A. Geography, B.Ed',
  ]
  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Pune',
    'Ahmedabad',
  ]
  const states = [
    'Maharashtra',
    'Delhi',
    'Karnataka',
    'Tamil Nadu',
    'West Bengal',
    'Telangana',
    'Gujarat',
  ]

  const staff = []

  // Add principal
  staff.push({
    id: 'staff-1',
    name: 'Dr. Sarah Johnson',
    email: 'principal@school.edu',
    phone: '+91 9876543210',
    employeeId: 'EMP001',
    role: 'principal',
    department: 'Administration',
    subjects: [],
    classes: [],
    joiningDate: '2020-06-15',
    salary: 75000,
    address: {
      street: '123 Principal Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
    },
    qualification: 'Ph.D. in Education Administration',
    experience: 15,
    status: 'active',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  // Add teachers and other staff
  for (let i = 2; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const department =
      departments[Math.floor(Math.random() * departments.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const state = states[Math.floor(Math.random() * states.length)]

    // Determine role based on department
    let role = 'teacher'
    if (department === 'Administration') {
      role = Math.random() > 0.5 ? 'accountant' : 'admin_staff'
    }

    // Assign subjects for teachers
    let assignedSubjects = []
    let assignedClasses = []
    if (role === 'teacher') {
      const subjectCount = Math.floor(Math.random() * 3) + 1
      assignedSubjects = subjects
        .filter(subject => Math.random() > 0.7)
        .slice(0, subjectCount)

      // Assign classes
      const classCount = Math.floor(Math.random() * 4) + 1
      const classes = ['6', '7', '8', '9', '10', '11', '12']
      assignedClasses = classes
        .filter(() => Math.random() > 0.6)
        .slice(0, classCount)
    }

    const experience = Math.floor(Math.random() * 20) + 1
    const baseSalary =
      role === 'principal' ? 75000 : role === 'teacher' ? 45000 : 35000
    const salary =
      baseSalary + experience * 2000 + Math.floor(Math.random() * 10000)

    staff.push({
      id: `staff-${i}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.edu`,
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      employeeId: `EMP${String(i).padStart(3, '0')}`,
      role: role,
      department: department,
      subjects: assignedSubjects,
      classes: assignedClasses,
      joiningDate: `${2015 + Math.floor(Math.random() * 8)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      salary: salary,
      address: {
        street: `${Math.floor(Math.random() * 999) + 1}, ${['MG Road', 'Park Street', 'Main Road', 'Gandhi Nagar'][Math.floor(Math.random() * 4)]}`,
        city: city,
        state: state,
        pincode: String(Math.floor(Math.random() * 900000) + 100000),
        country: 'India',
      },
      qualification:
        qualifications[Math.floor(Math.random() * qualifications.length)],
      experience: experience,
      status:
        Math.random() > 0.05
          ? 'active'
          : ['inactive', 'on_leave'][Math.floor(Math.random() * 2)],
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return staff
}

// Initialize store
staffStore = generateStaff()
nextId = staffStore.length + 1

// API functions
export const staffApi = {
  // Get all staff with filtering and pagination
  getStaff: async (params = {}) => {
    await delay()

    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      department = '',
      status = '',
      sortBy = 'name',
      sortOrder = 'asc',
    } = params

    let filtered = [...staffStore]

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        member =>
          member.name.toLowerCase().includes(searchLower) ||
          member.employeeId.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower) ||
          member.department.toLowerCase().includes(searchLower)
      )
    }

    if (role) {
      filtered = filtered.filter(member => member.role === role)
    }

    if (department) {
      filtered = filtered.filter(member => member.department === department)
    }

    if (status) {
      filtered = filtered.filter(member => member.status === status)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = filtered.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        hasNext: endIndex < filtered.length,
        hasPrev: page > 1,
      },
    }
  },

  // Get staff member by ID
  getStaffMember: async id => {
    await delay()

    const member = staffStore.find(s => s.id === id)
    if (!member) {
      throw new Error('Staff member not found')
    }

    return member
  },

  // Create new staff member
  createStaffMember: async staffData => {
    await delay()

    // Validate data
    const validatedData = staffSchema.parse(staffData)

    // Check for duplicate employee ID or email
    const existingEmpId = staffStore.find(
      s => s.employeeId === validatedData.employeeId,
    )
    if (existingEmpId) {
      throw new Error('Employee ID already exists')
    }

    const existingEmail = staffStore.find(s => s.email === validatedData.email)
    if (existingEmail) {
      throw new Error('Email already exists')
    }

    const newStaff = {
      id: `staff-${nextId++}`,
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    staffStore.push(newStaff)
    return newStaff
  },

  // Update staff member
  updateStaffMember: async (id, updateData) => {
    await delay()

    const index = staffStore.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error('Staff member not found')
    }

    // Validate update data
    const validatedData = staffSchema.partial().parse(updateData)

    // Check for duplicate employee ID or email (excluding current member)
    if (validatedData.employeeId) {
      const existingEmpId = staffStore.find(
        s => s.employeeId === validatedData.employeeId && s.id !== id,
      )
      if (existingEmpId) {
        throw new Error('Employee ID already exists')
      }
    }

    if (validatedData.email) {
      const existingEmail = staffStore.find(
        s => s.email === validatedData.email && s.id !== id,
      )
      if (existingEmail) {
        throw new Error('Email already exists')
      }
    }

    const updatedStaff = {
      ...staffStore[index],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    }

    staffStore[index] = updatedStaff
    return updatedStaff
  },

  // Delete staff member
  deleteStaffMember: async id => {
    await delay()

    const index = staffStore.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error('Staff member not found')
    }

    staffStore.splice(index, 1)
    return { success: true }
  },

  // Get teachers by subject
  getTeachersBySubject: async subjectId => {
    await delay()

    return staffStore.filter(
      member => member.role === 'teacher' && member.subjects.includes(subjectId)
    )
  },

  // Get teachers by class
  getTeachersByClass: async classId => {
    await delay()

    return staffStore.filter(
      member => member.role === 'teacher' && member.classes.includes(classId)
    )
  },

  // Get staff statistics
  getStaffStats: async () => {
    await delay()

    const stats = {
      total: staffStore.length,
      active: staffStore.filter(s => s.status === 'active').length,
      inactive: staffStore.filter(s => s.status === 'inactive').length,
      onLeave: staffStore.filter(s => s.status === 'on_leave').length,
      byRole: {},
      byDepartment: {},
      averageSalary: 0,
      averageExperience: 0,
    }

    // Group by role
    staffStore.forEach(member => {
      stats.byRole[member.role] = (stats.byRole[member.role] || 0) + 1
    })

    // Group by department
    staffStore.forEach(member => {
      stats.byDepartment[member.department] =
        (stats.byDepartment[member.department] || 0) + 1
    })

    // Calculate averages
    if (staffStore.length > 0) {
      stats.averageSalary = Math.round(
        staffStore.reduce((sum, member) => sum + member.salary, 0) /
          staffStore.length,
      )
      stats.averageExperience = Math.round(
        staffStore.reduce((sum, member) => sum + member.experience, 0) /
          staffStore.length,
      )
    }

    return stats
  },

  // Search staff
  searchStaff: async query => {
    await delay()

    if (!query || query.length < 2) {
      return []
    }

    const searchLower = query.toLowerCase()
    return staffStore
      .filter(
        member =>
          member.name.toLowerCase().includes(searchLower) ||
          member.employeeId.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower) ||
          member.department.toLowerCase().includes(searchLower) ||
          member.role.toLowerCase().includes(searchLower)
      )
      .slice(0, 10) // Limit search results
  },

  // Get departments
  getDepartments: async () => {
    await delay()

    const departments = [
      ...new Set(staffStore.map(member => member.department)),
    ]
    return departments.sort()
  },

  // Get staff by department
  getStaffByDepartment: async department => {
    await delay()

    return staffStore.filter(member => member.department === department)
  },
}

export default staffApi
