import mockData from '../mockData'

// Mock API for observation management
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const observationApi = {
  // Observations
  async getObservations(filters = {}) {
    await delay(600)

    // Generate mock observations
    const observations = [
      {
        id: 'obs-1',
        studentId: 'student-1',
        studentName: 'Alex Johnson',
        className: 'Class 10',
        section: 'A',
        rollNumber: 'STU001',
        subjectId: 'mathematics',
        subjectName: 'Mathematics',
        term: 'term1',
        observationDate: '2024-02-08',
        observerId: 'teacher-1',
        observerName: 'Mr. John Smith',
        parameters: [
          {
            parameterId: 'param-1',
            parameterName: 'Problem Solving',
            grade: 'A',
            remarks:
              'Excellent analytical thinking and problem-solving approach',
          },
          {
            parameterId: 'param-2',
            parameterName: 'Mathematical Reasoning',
            grade: 'B+',
            remarks: 'Good understanding of mathematical concepts',
          },
          {
            parameterId: 'param-3',
            parameterName: 'Communication',
            grade: 'B',
            remarks: 'Can explain solutions clearly but needs more confidence',
          },
          {
            parameterId: 'param-4',
            parameterName: 'Collaboration',
            grade: 'A',
            remarks: 'Works very well in group activities',
          },
        ],
        overallComments:
          'Alex shows strong mathematical abilities and is particularly good at problem-solving. Encouraging more participation in class discussions would help build confidence.',
        recommendations: [
          'Encourage more verbal participation in class',
          'Provide advanced problem sets for additional challenge',
          'Consider for math competition team',
        ],
      },
      {
        id: 'obs-2',
        studentId: 'student-2',
        studentName: 'Emma Smith',
        className: 'Class 9',
        section: 'B',
        rollNumber: 'STU002',
        subjectId: 'english',
        subjectName: 'English',
        term: 'term1',
        observationDate: '2024-02-07',
        observerId: 'teacher-2',
        observerName: 'Ms. Emily Davis',
        parameters: [
          {
            parameterId: 'param-5',
            parameterName: 'Reading Comprehension',
            grade: 'A+',
            remarks: 'Outstanding reading skills and comprehension',
          },
          {
            parameterId: 'param-6',
            parameterName: 'Writing Skills',
            grade: 'A',
            remarks: 'Excellent creative writing and grammar',
          },
          {
            parameterId: 'param-7',
            parameterName: 'Oral Communication',
            grade: 'B+',
            remarks:
              'Good speaking skills, needs more confidence in presentations',
          },
          {
            parameterId: 'param-8',
            parameterName: 'Critical Thinking',
            grade: 'A',
            remarks: 'Shows excellent analytical skills in literature analysis',
          },
        ],
        overallComments:
          'Emma is an exceptional student with strong language skills. Her writing is creative and well-structured. She would benefit from more opportunities to present her work.',
        recommendations: [
          'Provide leadership opportunities in group discussions',
          'Encourage participation in debate club',
          'Consider for school magazine editorial team',
        ],
      },
      {
        id: 'obs-3',
        studentId: 'student-3',
        studentName: 'Michael Davis',
        className: 'Class 8',
        section: 'A',
        rollNumber: 'STU003',
        subjectId: 'science',
        subjectName: 'Science',
        term: 'term1',
        observationDate: '2024-02-06',
        observerId: 'teacher-3',
        observerName: 'Dr. Michael Brown',
        parameters: [
          {
            parameterId: 'param-9',
            parameterName: 'Scientific Inquiry',
            grade: 'B',
            remarks: 'Shows curiosity but needs guidance in forming hypotheses',
          },
          {
            parameterId: 'param-10',
            parameterName: 'Practical Skills',
            grade: 'A',
            remarks: 'Excellent hands-on laboratory skills',
          },
          {
            parameterId: 'param-11',
            parameterName: 'Data Analysis',
            grade: 'B+',
            remarks: 'Good at collecting and organizing data',
          },
          {
            parameterId: 'param-12',
            parameterName: 'Safety Awareness',
            grade: 'A+',
            remarks: 'Always follows safety protocols meticulously',
          },
        ],
        overallComments:
          'Michael has strong practical skills and is very safety-conscious in the lab. He would benefit from more structured approach to scientific inquiry and hypothesis formation.',
        recommendations: [
          'Provide more guided inquiry activities',
          'Encourage participation in science fair',
          'Focus on hypothesis formation skills',
        ],
      },
    ]

    return {
      success: true,
      data: observations,
    }
  },

  async createObservation(observationData) {
    await delay(500)

    const newObservation = {
      id: `obs-${Date.now()}`,
      ...observationData,
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: newObservation,
      message: 'Observation created successfully',
    }
  },

  // Parameters
  async getParameters() {
    await delay(400)

    const parameters = [
      {
        id: 'param-1',
        name: 'Problem Solving',
        description:
          'Ability to analyze and solve mathematical problems systematically',
        category: 'academic',
        subjectId: 'mathematics',
        subjectName: 'Mathematics',
        weight: 25,
        isActive: true,
        applicableClasses: ['class-9', 'class-10'],
        rubric: [
          {
            grade: 'A+',
            description: 'Outstanding problem-solving skills',
            minScore: 90,
          },
          {
            grade: 'A',
            description: 'Excellent problem-solving abilities',
            minScore: 80,
          },
          {
            grade: 'B+',
            description: 'Very good problem-solving approach',
            minScore: 70,
          },
          {
            grade: 'B',
            description: 'Good problem-solving skills',
            minScore: 60,
          },
          {
            grade: 'C+',
            description: 'Satisfactory problem-solving',
            minScore: 50,
          },
          {
            grade: 'C',
            description: 'Acceptable problem-solving',
            minScore: 40,
          },
          {
            grade: 'D',
            description: 'Needs improvement in problem-solving',
            minScore: 30,
          },
          {
            grade: 'E',
            description: 'Unsatisfactory problem-solving skills',
            minScore: 0,
          },
        ],
      },
      {
        id: 'param-2',
        name: 'Mathematical Reasoning',
        description:
          'Understanding and application of mathematical concepts and logic',
        category: 'academic',
        subjectId: 'mathematics',
        subjectName: 'Mathematics',
        weight: 20,
        isActive: true,
        applicableClasses: ['class-8', 'class-9', 'class-10'],
        rubric: [
          {
            grade: 'A+',
            description: 'Outstanding mathematical reasoning',
            minScore: 90,
          },
          {
            grade: 'A',
            description: 'Excellent reasoning skills',
            minScore: 80,
          },
          {
            grade: 'B+',
            description: 'Very good reasoning ability',
            minScore: 70,
          },
          { grade: 'B', description: 'Good reasoning skills', minScore: 60 },
          { grade: 'C+', description: 'Satisfactory reasoning', minScore: 50 },
          { grade: 'C', description: 'Acceptable reasoning', minScore: 40 },
          { grade: 'D', description: 'Needs improvement', minScore: 30 },
          { grade: 'E', description: 'Unsatisfactory reasoning', minScore: 0 },
        ],
      },
      {
        id: 'param-3',
        name: 'Communication',
        description:
          'Ability to express mathematical ideas clearly and effectively',
        category: 'social',
        subjectId: 'mathematics',
        subjectName: 'Mathematics',
        weight: 15,
        isActive: true,
        applicableClasses: [],
        rubric: [
          {
            grade: 'A+',
            description: 'Outstanding communication skills',
            minScore: 90,
          },
          { grade: 'A', description: 'Excellent communication', minScore: 80 },
          { grade: 'B+', description: 'Very good communication', minScore: 70 },
          {
            grade: 'B',
            description: 'Good communication skills',
            minScore: 60,
          },
          {
            grade: 'C+',
            description: 'Satisfactory communication',
            minScore: 50,
          },
          { grade: 'C', description: 'Acceptable communication', minScore: 40 },
          { grade: 'D', description: 'Needs improvement', minScore: 30 },
          {
            grade: 'E',
            description: 'Unsatisfactory communication',
            minScore: 0,
          },
        ],
      },
      {
        id: 'param-4',
        name: 'Collaboration',
        description:
          'Ability to work effectively with peers in group activities',
        category: 'social',
        subjectId: 'mathematics',
        subjectName: 'Mathematics',
        weight: 10,
        isActive: true,
        applicableClasses: [],
        rubric: [
          {
            grade: 'A+',
            description: 'Outstanding collaboration skills',
            minScore: 90,
          },
          { grade: 'A', description: 'Excellent team player', minScore: 80 },
          { grade: 'B+', description: 'Very good collaboration', minScore: 70 },
          { grade: 'B', description: 'Good team work skills', minScore: 60 },
          {
            grade: 'C+',
            description: 'Satisfactory collaboration',
            minScore: 50,
          },
          { grade: 'C', description: 'Acceptable team work', minScore: 40 },
          { grade: 'D', description: 'Needs improvement', minScore: 30 },
          {
            grade: 'E',
            description: 'Unsatisfactory collaboration',
            minScore: 0,
          },
        ],
      },
      {
        id: 'param-5',
        name: 'Reading Comprehension',
        description:
          'Ability to understand and interpret written texts effectively',
        category: 'academic',
        subjectId: 'english',
        subjectName: 'English',
        weight: 30,
        isActive: true,
        applicableClasses: [],
        rubric: [
          {
            grade: 'A+',
            description: 'Outstanding reading comprehension',
            minScore: 90,
          },
          {
            grade: 'A',
            description: 'Excellent comprehension skills',
            minScore: 80,
          },
          { grade: 'B+', description: 'Very good comprehension', minScore: 70 },
          { grade: 'B', description: 'Good reading skills', minScore: 60 },
          {
            grade: 'C+',
            description: 'Satisfactory comprehension',
            minScore: 50,
          },
          {
            grade: 'C',
            description: 'Acceptable reading skills',
            minScore: 40,
          },
          { grade: 'D', description: 'Needs improvement', minScore: 30 },
          {
            grade: 'E',
            description: 'Unsatisfactory comprehension',
            minScore: 0,
          },
        ],
      },
      {
        id: 'param-6',
        name: 'Writing Skills',
        description:
          'Ability to express ideas clearly and effectively in writing',
        category: 'academic',
        subjectId: 'english',
        subjectName: 'English',
        weight: 25,
        isActive: true,
        applicableClasses: [],
        rubric: [
          {
            grade: 'A+',
            description: 'Outstanding writing skills',
            minScore: 90,
          },
          {
            grade: 'A',
            description: 'Excellent writing ability',
            minScore: 80,
          },
          {
            grade: 'B+',
            description: 'Very good writing skills',
            minScore: 70,
          },
          { grade: 'B', description: 'Good writing ability', minScore: 60 },
          { grade: 'C+', description: 'Satisfactory writing', minScore: 50 },
          {
            grade: 'C',
            description: 'Acceptable writing skills',
            minScore: 40,
          },
          { grade: 'D', description: 'Needs improvement', minScore: 30 },
          { grade: 'E', description: 'Unsatisfactory writing', minScore: 0 },
        ],
      },
      {
        id: 'param-7',
        name: 'Oral Communication',
        description:
          'Ability to speak clearly and confidently in various contexts',
        category: 'social',
        subjectId: 'english',
        subjectName: 'English',
        weight: 20,
        isActive: true,
        applicableClasses: [],
        rubric: [
          {
            grade: 'A+',
            description: 'Outstanding speaking skills',
            minScore: 90,
          },
          {
            grade: 'A',
            description: 'Excellent oral communication',
            minScore: 80,
          },
          {
            grade: 'B+',
            description: 'Very good speaking ability',
            minScore: 70,
          },
          {
            grade: 'B',
            description: 'Good communication skills',
            minScore: 60,
          },
          { grade: 'C+', description: 'Satisfactory speaking', minScore: 50 },
          { grade: 'C', description: 'Acceptable communication', minScore: 40 },
          { grade: 'D', description: 'Needs improvement', minScore: 30 },
          { grade: 'E', description: 'Unsatisfactory speaking', minScore: 0 },
        ],
      },
      {
        id: 'param-8',
        name: 'Critical Thinking',
        description:
          'Ability to analyze, evaluate, and synthesize information effectively',
        category: 'academic',
        subjectId: 'english',
        subjectName: 'English',
        weight: 15,
        isActive: true,
        applicableClasses: [],
        rubric: [
          {
            grade: 'A+',
            description: 'Outstanding critical thinking',
            minScore: 90,
          },
          {
            grade: 'A',
            description: 'Excellent analytical skills',
            minScore: 80,
          },
          {
            grade: 'B+',
            description: 'Very good critical thinking',
            minScore: 70,
          },
          { grade: 'B', description: 'Good analytical ability', minScore: 60 },
          {
            grade: 'C+',
            description: 'Satisfactory thinking skills',
            minScore: 50,
          },
          { grade: 'C', description: 'Acceptable analysis', minScore: 40 },
          { grade: 'D', description: 'Needs improvement', minScore: 30 },
          { grade: 'E', description: 'Unsatisfactory thinking', minScore: 0 },
        ],
      },
    ]

    return {
      success: true,
      data: parameters,
    }
  },

  async getParametersBySubject(subjectId) {
    await delay(300)

    const allParameters = await this.getParameters()
    const filteredParameters = allParameters.data.filter(
      param => param.subjectId === subjectId
    )

    return {
      success: true,
      data: filteredParameters,
    }
  },

  async createParameter(parameterData) {
    await delay(400)

    const newParameter = {
      id: `param-${Date.now()}`,
      ...parameterData,
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: newParameter,
      message: 'Parameter created successfully',
    }
  },

  async updateParameter(id, parameterData) {
    await delay(400)

    return {
      success: true,
      data: {
        id,
        ...parameterData,
        updatedAt: new Date().toISOString(),
      },
      message: 'Parameter updated successfully',
    }
  },

  async deleteParameter(id) {
    await delay(300)

    return {
      success: true,
      message: 'Parameter deleted successfully',
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

  async searchStudents(query) {
    await delay(300)

    const students = mockData.students
      .filter(
        student =>
          student.name.toLowerCase().includes(query.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 10)

    return {
      success: true,
      data: students,
    }
  },
}
