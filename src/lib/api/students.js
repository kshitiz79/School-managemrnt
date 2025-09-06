import mockData from '../mockData'

// Mock API for students
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const studentsApi = {
  async getAll(params = {}) {
    await delay(400)

    let students = [...mockData.students]

    // Apply filters if provided
    if (params.classId) {
      students = students.filter(student => student.classId === params.classId)
    }

    if (params.section) {
      students = students.filter(student => student.section === params.section)
    }

    if (params.status) {
      students = students.filter(student => student.status === params.status)
    }

    return {
      success: true,
      data: students,
      total: students.length,
    }
  },

  async getBySection(sectionId) {
    await delay(300)

    // Parse section ID to get class and section
    const [classId, sectionName] = sectionId
      .split('-')
      .slice(0, -1)
      .join('-')
      .split('-')
      .concat(sectionId.split('-').pop())

    const students = mockData.students.filter(
      student => student.classId === classId && student.section === sectionName
    )

    return {
      success: true,
      data: students,
    }
  },

  async getById(id) {
    await delay(200)

    const student = mockData.students.find(s => s.id === id)

    if (!student) {
      return {
        success: false,
        error: 'Student not found',
      }
    }

    return {
      success: true,
      data: student,
    }
  },

  async create(studentData) {
    await delay(500)

    const newStudent = {
      id: `student-${Date.now()}`,
      ...studentData,
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: newStudent,
      message: 'Student created successfully',
    }
  },

  async update(id, studentData) {
    await delay(400)

    return {
      success: true,
      data: {
        id,
        ...studentData,
        updatedAt: new Date().toISOString(),
      },
      message: 'Student updated successfully',
    }
  },

  async delete(id) {
    await delay(300)

    return {
      success: true,
      message: 'Student deleted successfully',
    }
  },

  async bulkDelete(studentIds) {
    await delay(600)

    return {
      success: true,
      message: `${studentIds.length} students deleted successfully`,
    }
  },

  async search(query) {
    await delay(300)

    const students = mockData.students.filter(
      student =>
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(query.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(query.toLowerCase())
    )

    return {
      success: true,
      data: students,
    }
  },
}
