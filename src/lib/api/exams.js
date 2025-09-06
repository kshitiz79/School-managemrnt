import mockData from '../mockData'

// Mock API for examination system
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const examApi = {
  // Exam Groups
  async getExamGroups() {
    await delay(500)

    const examGroups = [
      {
        id: 'exam-group-1',
        name: 'Unit Test 1 - Term 1',
        description: 'First unit test for Term 1 covering initial chapters',
        type: 'unit_test',
        termId: 'term-1',
        termName: 'Term 1 2024-25',
        maxMarks: 50,
        passMarks: 18,
        duration: 90,
        weightage: 10,
        status: 'active',
        classes: ['class-9', 'class-10'],
        classNames: ['Class 9', 'Class 10'],
        subjects: ['math', 'english', 'science'],
        subjectNames: ['Mathematics', 'English', 'Science'],
        examSettings: {
          allowAbsent: true,
          allowPartialMarks: true,
          roundOffMarks: false,
          showRank: true,
          publishResults: false,
        },
        gradingCriteria: {
          enableGrading: true,
          gradingType: 'percentage',
        },
        examDates: {
          startDate: '2024-02-15',
          endDate: '2024-02-20',
        },
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'exam-group-2',
        name: 'Mid Term Examination',
        description: 'Mid-term examination covering half syllabus',
        type: 'mid_term',
        termId: 'term-1',
        termName: 'Term 1 2024-25',
        maxMarks: 100,
        passMarks: 35,
        duration: 180,
        weightage: 40,
        status: 'scheduled',
        classes: ['class-8', 'class-9', 'class-10'],
        classNames: ['Class 8', 'Class 9', 'Class 10'],
        subjects: ['math', 'english', 'science', 'social'],
        subjectNames: ['Mathematics', 'English', 'Science', 'Social Studies'],
        examSettings: {
          allowAbsent: true,
          allowPartialMarks: false,
          roundOffMarks: true,
          showRank: true,
          publishResults: false,
        },
        gradingCriteria: {
          enableGrading: true,
          gradingType: 'percentage',
        },
        examDates: {
          startDate: '2024-03-01',
          endDate: '2024-03-10',
        },
        createdAt: '2024-01-20T10:00:00Z',
      },
      {
        id: 'exam-group-3',
        name: 'Final Examination',
        description: 'Final examination covering complete syllabus',
        type: 'final_exam',
        termId: 'term-1',
        termName: 'Term 1 2024-25',
        maxMarks: 100,
        passMarks: 35,
        duration: 180,
        weightage: 50,
        status: 'draft',
        classes: ['class-10'],
        classNames: ['Class 10'],
        subjects: ['math', 'english', 'science', 'social', 'hindi'],
        subjectNames: [
          'Mathematics',
          'English',
          'Science',
          'Social Studies',
          'Hindi',
        ],
        examSettings: {
          allowAbsent: true,
          allowPartialMarks: false,
          roundOffMarks: true,
          showRank: true,
          publishResults: false,
        },
        gradingCriteria: {
          enableGrading: true,
          gradingType: 'percentage',
        },
        examDates: {
          startDate: '2024-04-01',
          endDate: '2024-04-15',
        },
        createdAt: '2024-02-01T10:00:00Z',
      },
    ]

    return {
      success: true,
      data: examGroups,
    }
  },

  async createExamGroup(examGroupData) {
    await delay(600)

    const newExamGroup = {
      id: `exam-group-${Date.now()}`,
      ...examGroupData,
      status: 'draft',
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: newExamGroup,
      message: 'Exam group created successfully',
    }
  },

  async updateExamGroup(id, examGroupData) {
    await delay(500)

    return {
      success: true,
      data: {
        id,
        ...examGroupData,
        updatedAt: new Date().toISOString(),
      },
      message: 'Exam group updated successfully',
    }
  },

  async deleteExamGroup(id) {
    await delay(300)

    return {
      success: true,
      message: 'Exam group deleted successfully',
    }
  },

  async duplicateExamGroup(id) {
    await delay(400)

    return {
      success: true,
      message: 'Exam group duplicated successfully',
    }
  },

  // Exam Schedules
  async getExamSchedules() {
    await delay(600)

    const schedules = [
      {
        id: 'schedule-1',
        examGroupId: 'exam-group-1',
        examGroupName: 'Unit Test 1 - Term 1',
        examType: 'unit_test',
        subjectId: 'math',
        subjectName: 'Mathematics',
        classId: 'class-10',
        className: 'Class 10',
        section: 'A',
        examDate: '2024-02-15',
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        examRoom: 'Room 101',
        maxStudents: 30,
        status: 'scheduled',
        instructions: 'Bring calculator and geometry box',
        invigilators: ['staff-2', 'staff-3'],
      },
      {
        id: 'schedule-2',
        examGroupId: 'exam-group-1',
        examGroupName: 'Unit Test 1 - Term 1',
        examType: 'unit_test',
        subjectId: 'english',
        subjectName: 'English',
        classId: 'class-10',
        className: 'Class 10',
        section: 'A',
        examDate: '2024-02-16',
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        examRoom: 'Room 102',
        maxStudents: 30,
        status: 'scheduled',
        instructions: 'Dictionary not allowed',
        invigilators: ['staff-3', 'staff-4'],
      },
      {
        id: 'schedule-3',
        examGroupId: 'exam-group-2',
        examGroupName: 'Mid Term Examination',
        examType: 'mid_term',
        subjectId: 'science',
        subjectName: 'Science',
        classId: 'class-9',
        className: 'Class 9',
        section: 'B',
        examDate: '2024-03-01',
        startTime: '10:00',
        endTime: '13:00',
        duration: 180,
        examRoom: 'Room 201',
        maxStudents: 25,
        status: 'scheduled',
        instructions: 'Bring scientific calculator',
        invigilators: ['staff-4', 'staff-5'],
      },
    ]

    return {
      success: true,
      data: schedules,
    }
  },

  async createExamSchedule(scheduleData) {
    await delay(500)

    const newSchedule = {
      id: `schedule-${Date.now()}`,
      ...scheduleData,
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: newSchedule,
      message: 'Exam schedule created successfully',
    }
  },

  async updateExamSchedule(id, scheduleData) {
    await delay(400)

    return {
      success: true,
      data: {
        id,
        ...scheduleData,
        updatedAt: new Date().toISOString(),
      },
      message: 'Exam schedule updated successfully',
    }
  },

  async deleteExamSchedule(id) {
    await delay(300)

    return {
      success: true,
      message: 'Exam schedule deleted successfully',
    }
  },

  async bulkCreateSchedules(bulkData) {
    await delay(800)

    return {
      success: true,
      message: `Created ${bulkData.classIds.length * bulkData.subjects.length} exam schedules successfully`,
    }
  },

  // Exam Results
  async getExamSchedulesForResults() {
    await delay(500)

    const schedules = [
      {
        id: 'schedule-1',
        examGroupId: 'exam-group-1',
        examGroupName: 'Unit Test 1 - Term 1',
        subjectId: 'math',
        subjectName: 'Mathematics',
        classId: 'class-10',
        className: 'Class 10',
        section: 'A',
        examDate: '2024-02-15',
        maxMarks: 50,
        passMarks: 18,
        isPublished: false,
      },
      {
        id: 'schedule-2',
        examGroupId: 'exam-group-1',
        examGroupName: 'Unit Test 1 - Term 1',
        subjectId: 'english',
        subjectName: 'English',
        classId: 'class-10',
        className: 'Class 10',
        section: 'A',
        examDate: '2024-02-16',
        maxMarks: 50,
        passMarks: 18,
        isPublished: true,
      },
      {
        id: 'schedule-3',
        examGroupId: 'exam-group-2',
        examGroupName: 'Mid Term Examination',
        subjectId: 'science',
        subjectName: 'Science',
        classId: 'class-9',
        className: 'Class 9',
        section: 'B',
        examDate: '2024-03-01',
        maxMarks: 100,
        passMarks: 35,
        isPublished: false,
      },
    ]

    return {
      success: true,
      data: schedules,
    }
  },

  async getStudentsBySchedule(scheduleId) {
    await delay(400)

    // Mock students for the schedule
    const students = mockData.students.slice(0, 15).map(student => ({
      ...student,
      fatherName: `Father of ${student.name}`,
    }))

    return {
      success: true,
      data: students,
    }
  },

  async getMarksBySchedule(scheduleId) {
    await delay(500)

    // Generate mock marks data
    const marks = mockData.students.slice(0, 15).map(student => {
      const isAbsent = Math.random() < 0.1 // 10% absent rate
      const marksObtained = isAbsent
        ? 'AB'
        : Math.floor(Math.random() * 50) + 20 // Random marks between 20-70

      return {
        id: `mark-${student.id}-${scheduleId}`,
        studentId: student.id,
        scheduleId,
        marksObtained,
        remarks: isAbsent
          ? 'Absent due to illness'
          : marksObtained < 30
            ? 'Needs improvement'
            : marksObtained > 45
              ? 'Good performance'
              : '',
      }
    })

    return {
      success: true,
      data: marks,
    }
  },

  async saveMarks(scheduleId, marks) {
    await delay(600)

    return {
      success: true,
      message: 'Marks saved successfully',
    }
  },

  async publishResults(scheduleId) {
    await delay(800)

    return {
      success: true,
      message: 'Results published successfully',
    }
  },

  async importMarks(scheduleId, csvData) {
    await delay(700)

    return {
      success: true,
      message: `Imported marks for ${csvData.length} students successfully`,
    }
  },

  // Utility functions
  async getActiveTerms() {
    await delay(200)

    const terms = [
      {
        id: 'term-1',
        name: 'Term 1 2024-25',
        status: 'active',
      },
      {
        id: 'term-2',
        name: 'Term 2 2024-25',
        status: 'upcoming',
      },
    ]

    return {
      success: true,
      data: terms,
    }
  },

  async getActiveExamGroups() {
    await delay(300)

    const examGroups = [
      {
        id: 'exam-group-1',
        name: 'Unit Test 1 - Term 1',
        status: 'active',
      },
      {
        id: 'exam-group-2',
        name: 'Mid Term Examination',
        status: 'scheduled',
      },
    ]

    return {
      success: true,
      data: examGroups,
    }
  },

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

  async getTeachers() {
    await delay(300)

    const teachers = mockData.staff.filter(member => member.role === 'teacher')

    return {
      success: true,
      data: teachers,
    }
  },
}
