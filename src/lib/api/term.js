import mockData from '../mockData'

// Mock API for term management
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const termApi = {
  // Terms
  async getTerms() {
    await delay(500)

    const terms = [
      {
        id: 'term-1',
        name: 'Term 1 Examination 2024-25',
        type: 'term1',
        academicYear: '2024-25',
        startDate: '2024-04-01',
        endDate: '2024-09-30',
        description:
          'First term examination covering syllabus from April to September',
        status: 'active',
        isDefault: true,
        applicableClasses: [
          'class-1',
          'class-2',
          'class-3',
          'class-4',
          'class-5',
        ],
        subjects: ['math', 'english', 'science', 'social', 'hindi'],
        examSchedule: {
          unitTests: 2,
          termExams: 1,
          practicals: 1,
          projects: 1,
        },
        gradingPatternId: 'cbse-pattern-1',
        gradingPattern: {
          name: 'CBSE Grading Pattern',
          scale: 'A+ to E',
        },
        weightages: {
          unitTest: 10,
          termExam: 80,
          practical: 5,
          project: 5,
        },
        createdAt: '2024-03-15T10:00:00Z',
        createdBy: 'Admin',
      },
      {
        id: 'term-2',
        name: 'Term 2 Examination 2024-25',
        type: 'term2',
        academicYear: '2024-25',
        startDate: '2024-10-01',
        endDate: '2025-03-31',
        description:
          'Second term examination covering syllabus from October to March',
        status: 'upcoming',
        isDefault: false,
        applicableClasses: [
          'class-1',
          'class-2',
          'class-3',
          'class-4',
          'class-5',
        ],
        subjects: ['math', 'english', 'science', 'social', 'hindi'],
        examSchedule: {
          unitTests: 2,
          termExams: 1,
          practicals: 1,
          projects: 1,
        },
        gradingPatternId: 'cbse-pattern-1',
        gradingPattern: {
          name: 'CBSE Grading Pattern',
          scale: 'A+ to E',
        },
        weightages: {
          unitTest: 10,
          termExam: 80,
          practical: 5,
          project: 5,
        },
        createdAt: '2024-03-15T10:30:00Z',
        createdBy: 'Admin',
      },
      {
        id: 'term-3',
        name: 'Annual Examination 2023-24',
        type: 'annual',
        academicYear: '2023-24',
        startDate: '2023-04-01',
        endDate: '2024-03-31',
        description: 'Annual examination for the academic year 2023-24',
        status: 'completed',
        isDefault: false,
        applicableClasses: [
          'class-6',
          'class-7',
          'class-8',
          'class-9',
          'class-10',
        ],
        subjects: ['math', 'english', 'science', 'social', 'hindi', 'computer'],
        examSchedule: {
          unitTests: 4,
          termExams: 2,
          practicals: 2,
          projects: 2,
        },
        gradingPatternId: 'cbse-pattern-2',
        gradingPattern: {
          name: 'CBSE Secondary Pattern',
          scale: 'Marks + Grades',
        },
        weightages: {
          unitTest: 20,
          termExam: 60,
          practical: 10,
          project: 10,
        },
        createdAt: '2023-03-20T09:00:00Z',
        createdBy: 'Admin',
      },
    ]

    return {
      success: true,
      data: terms,
    }
  },

  async createTerm(termData) {
    await delay(600)

    const newTerm = {
      id: `term-${Date.now()}`,
      ...termData,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User',
    }

    return {
      success: true,
      data: newTerm,
      message: 'Term created successfully',
    }
  },

  async updateTerm(id, termData) {
    await delay(500)

    return {
      success: true,
      data: {
        id,
        ...termData,
        updatedAt: new Date().toISOString(),
      },
      message: 'Term updated successfully',
    }
  },

  async deleteTerm(id) {
    await delay(300)

    return {
      success: true,
      message: 'Term deleted successfully',
    }
  },

  async activateTerm(id) {
    await delay(400)

    return {
      success: true,
      message: 'Term activated successfully',
    }
  },

  // Grading Patterns
  async getGradingPatterns() {
    await delay(300)

    const patterns = [
      {
        id: 'cbse-pattern-1',
        name: 'CBSE Primary Grading',
        scale: 'A+ to E',
        type: 'grade_based',
        grades: [
          {
            grade: 'A+',
            minMarks: 91,
            maxMarks: 100,
            description: 'Outstanding',
          },
          { grade: 'A', minMarks: 81, maxMarks: 90, description: 'Excellent' },
          { grade: 'B+', minMarks: 71, maxMarks: 80, description: 'Very Good' },
          { grade: 'B', minMarks: 61, maxMarks: 70, description: 'Good' },
          {
            grade: 'C+',
            minMarks: 51,
            maxMarks: 60,
            description: 'Satisfactory',
          },
          { grade: 'C', minMarks: 41, maxMarks: 50, description: 'Acceptable' },
          {
            grade: 'D',
            minMarks: 33,
            maxMarks: 40,
            description: 'Needs Improvement',
          },
          {
            grade: 'E',
            minMarks: 0,
            maxMarks: 32,
            description: 'Unsatisfactory',
          },
        ],
        applicableClasses: [
          'class-1',
          'class-2',
          'class-3',
          'class-4',
          'class-5',
        ],
      },
      {
        id: 'cbse-pattern-2',
        name: 'CBSE Secondary Grading',
        scale: 'Marks + Grades',
        type: 'marks_and_grade',
        grades: [
          {
            grade: 'A1',
            minMarks: 91,
            maxMarks: 100,
            description: 'Outstanding',
          },
          { grade: 'A2', minMarks: 81, maxMarks: 90, description: 'Excellent' },
          { grade: 'B1', minMarks: 71, maxMarks: 80, description: 'Very Good' },
          { grade: 'B2', minMarks: 61, maxMarks: 70, description: 'Good' },
          {
            grade: 'C1',
            minMarks: 51,
            maxMarks: 60,
            description: 'Satisfactory',
          },
          {
            grade: 'C2',
            minMarks: 41,
            maxMarks: 50,
            description: 'Acceptable',
          },
          {
            grade: 'D',
            minMarks: 33,
            maxMarks: 40,
            description: 'Needs Improvement',
          },
          {
            grade: 'E',
            minMarks: 0,
            maxMarks: 32,
            description: 'Unsatisfactory',
          },
        ],
        applicableClasses: [
          'class-6',
          'class-7',
          'class-8',
          'class-9',
          'class-10',
        ],
      },
    ]

    return {
      success: true,
      data: patterns,
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

  async getSubjects() {
    await delay(200)

    return {
      success: true,
      data: mockData.subjects,
    }
  },
}
