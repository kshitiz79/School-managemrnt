// Mock API for subject management
import { subjectSchema } from '../validators.js'

// In-memory store
let subjectsStore = []
let nextId = 1

// Simulate API latency
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Generate realistic subject data
const generateSubjects = () => {
    const subjects = [
        // Primary subjects (KG-5)
        {
            name: 'English',
            code: 'ENG',
            type: 'core',
            classes: [
                'KG',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '11',
                '12',
            ],
        },
        {
            name: 'Mathematics',
            code: 'MATH',
            type: 'core',
            classes: [
                'KG',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '11',
                '12',
            ],
        },
        {
            name: 'Environmental Studies',
            code: 'EVS',
            type: 'core',
            classes: ['KG', '1', '2', '3', '4', '5'],
        },
        {
            name: 'Hindi',
            code: 'HIN',
            type: 'core',
            classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        },
        {
            name: 'Art & Craft',
            code: 'ART',
            type: 'elective',
            classes: ['KG', '1', '2', '3', '4', '5', '6', '7', '8'],
        },
        {
            name: 'Physical Education',
            code: 'PE',
            type: 'core',
            classes: [
                'KG',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '11',
                '12',
            ],
        },

        // Middle school subjects (6-8)
        { name: 'Science', code: 'SCI', type: 'core', classes: ['6', '7', '8'] },
        {
            name: 'Social Studies',
            code: 'SS',
            type: 'core',
            classes: ['6', '7', '8'],
        },
        {
            name: 'Computer Science',
            code: 'CS',
            type: 'elective',
            classes: ['6', '7', '8', '9', '10', '11', '12'],
        },

        // High school subjects (9-10)
        {
            name: 'Physics',
            code: 'PHY',
            type: 'core',
            classes: ['9', '10', '11', '12'],
        },
        {
            name: 'Chemistry',
            code: 'CHEM',
            type: 'core',
            classes: ['9', '10', '11', '12'],
        },
        {
            name: 'Biology',
            code: 'BIO',
            type: 'core',
            classes: ['9', '10', '11', '12'],
        },
        {
            name: 'History',
            code: 'HIST',
            type: 'core',
            classes: ['9', '10', '11', '12'],
        },
        {
            name: 'Geography',
            code: 'GEO',
            type: 'core',
            classes: ['9', '10', '11', '12'],
        },
        { name: 'Economics', code: 'ECO', type: 'elective', classes: ['11', '12'] },
        {
            name: 'Political Science',
            code: 'POL',
            type: 'elective',
            classes: ['11', '12'],
        },
        {
            name: 'Accountancy',
            code: 'ACC',
            type: 'elective',
            classes: ['11', '12'],
        },
        {
            name: 'Business Studies',
            code: 'BS',
            type: 'elective',
            classes: ['11', '12'],
        },

        // Additional subjects
        {
            name: 'Sanskrit',
            code: 'SAN',
            type: 'optional',
            classes: ['6', '7', '8', '9', '10'],
        },
        {
            name: 'Music',
            code: 'MUS',
            type: 'elective',
            classes: ['6', '7', '8', '9', '10'],
        },
        {
            name: 'Dance',
            code: 'DAN',
            type: 'elective',
            classes: ['6', '7', '8', '9', '10'],
        },
        {
            name: 'Psychology',
            code: 'PSY',
            type: 'elective',
            classes: ['11', '12'],
        },
        {
            name: 'Philosophy',
            code: 'PHI',
            type: 'optional',
            classes: ['11', '12'],
        },
    ]

    return subjects.map((subject, index) => ({
        id: `subject-${index + 1}`,
        name: subject.name,
        code: subject.code,
        type: subject.type,
        credits: subject.type === 'core' ? 4 : subject.type === 'elective' ? 3 : 2,
        description: `${subject.name} curriculum for classes ${subject.classes.join(', ')}`,
        classes: subject.classes,
        teachers: [], // Will be populated when teachers are assigned
        syllabus: generateSyllabus(subject.name, subject.classes),
        assessmentPattern: generateAssessmentPattern(subject.type),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }))
}

// Generate syllabus for subjects
const generateSyllabus = (subjectName, classes) => {
    const syllabusTemplates = {
        Mathematics: {
            KG: ['Numbers 1-10', 'Shapes', 'Colors', 'Patterns'],
            1: ['Numbers 1-100', 'Addition', 'Subtraction', 'Shapes', 'Measurement'],
            2: [
                'Numbers 1-1000',
                'Addition & Subtraction',
                'Multiplication Tables',
                'Time',
                'Money',
            ],
            9: [
                'Number Systems',
                'Polynomials',
                'Linear Equations',
                'Geometry',
                'Statistics',
            ],
            10: [
                'Real Numbers',
                'Polynomials',
                'Linear Equations',
                'Quadratic Equations',
                'Arithmetic Progressions',
                'Triangles',
                'Coordinate Geometry',
                'Trigonometry',
                'Circles',
                'Surface Areas and Volumes',
                'Statistics',
                'Probability',
            ],
        },
        English: {
            KG: ['Alphabets', 'Phonics', 'Simple Words', 'Rhymes'],
            1: ['Reading', 'Writing', 'Grammar Basics', 'Vocabulary'],
            9: ['Literature', 'Grammar', 'Writing Skills', 'Reading Comprehension'],
            10: [
                'Literature',
                'Grammar',
                'Writing Skills',
                'Reading Comprehension',
                'Poetry',
            ],
        },
        Science: {
            6: [
                'Food',
                'Components of Food',
                'Fibre to Fabric',
                'Sorting Materials',
                'Separation of Substances',
                'Changes Around Us',
            ],
            7: [
                'Nutrition in Plants',
                'Nutrition in Animals',
                'Fibre to Fabric',
                'Heat',
                'Acids, Bases and Salts',
                'Physical and Chemical Changes',
            ],
            8: [
                'Crop Production',
                'Microorganisms',
                'Synthetic Fibres',
                'Materials',
                'Coal and Petroleum',
                'Combustion and Flame',
            ],
        },
    }

    const defaultSyllabus = classes.map(
        cls => `${subjectName} curriculum for Class ${cls}`
    )

    return classes.reduce((acc, cls) => {
        acc[cls] = syllabusTemplates[subjectName]?.[cls] || [
            `${subjectName} topics for Class ${cls}`,
        ]
        return acc
    }, {})
}

// Generate assessment pattern
const generateAssessmentPattern = type => {
    const patterns = {
        core: {
            midterm: 30,
            final: 40,
            assignments: 15,
            practicals: 15,
        },
        elective: {
            midterm: 25,
            final: 35,
            assignments: 20,
            practicals: 20,
        },
        optional: {
            midterm: 20,
            final: 30,
            assignments: 25,
            practicals: 25,
        },
    }

    return patterns[type] || patterns.core
}

// Initialize subjects
const initializeSubjects = () => {
    if (subjectsStore.length === 0) {
        subjectsStore = generateSubjects()
        nextId = subjectsStore.length + 1
    }
}

// Initialize on module load
initializeSubjects()

// Subject management API
export const subjectsApi = {
    // Get all subjects
    getAll: async(options = {}) => {
        await delay()

        let filteredSubjects = [...subjectsStore]

        // Apply filters
        if (options.type) {
            filteredSubjects = filteredSubjects.filter(
                subject => subject.type === options.type,
            )
        }

        if (options.class) {
            filteredSubjects = filteredSubjects.filter(subject =>
                subject.classes.includes(options.class)
            )
        }

        if (options.status) {
            filteredSubjects = filteredSubjects.filter(
                subject => subject.status === options.status,
            )
        }

        return {
            data: filteredSubjects,
            total: filteredSubjects.length,
            page: 1,
            limit: filteredSubjects.length,
        }
    },

    // Get subject by ID
    getById: async id => {
        await delay()
        const subject = subjectsStore.find(s => s.id === id)
        if (!subject) {
            throw new Error('Subject not found')
        }
        return { data: subject }
    },

    // Create new subject
    create: async subjectData => {
        await delay()

        // Validate data
        const validatedData = subjectSchema.parse(subjectData)

        // Check for duplicate code
        if (subjectsStore.some(s => s.code === validatedData.code)) {
            throw new Error('Subject code already exists')
        }

        const newSubject = {
            id: `subject-${nextId++}`,
            ...validatedData,
            teachers: [],
            syllabus: generateSyllabus(validatedData.name, validatedData.classes),
            assessmentPattern: generateAssessmentPattern(validatedData.type),
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        subjectsStore.push(newSubject)
        return { data: newSubject }
    },

    // Update subject
    update: async(id, updates) => {
        await delay()

        const index = subjectsStore.findIndex(s => s.id === id)
        if (index === -1) {
            throw new Error('Subject not found')
        }

        // Validate updates
        const validatedData = subjectSchema.partial().parse(updates)

        // Check for duplicate code (excluding current subject)
        if (
            validatedData.code &&
            subjectsStore.some(s => s.code === validatedData.code && s.id !== id)
        ) {
            throw new Error('Subject code already exists')
        }

        subjectsStore[index] = {
            ...subjectsStore[index],
            ...validatedData,
            updatedAt: new Date().toISOString(),
        }

        return { data: subjectsStore[index] }
    },

    // Delete subject
    delete: async id => {
        await delay()

        const index = subjectsStore.findIndex(s => s.id === id)
        if (index === -1) {
            throw new Error('Subject not found')
        }

        const deleted = subjectsStore.splice(index, 1)[0]
        return { data: deleted }
    },

    // Get subjects by class
    getByClass: async classId => {
        await delay()
        const subjects = subjectsStore.filter(subject =>
            subject.classes.includes(classId)
        )
        return { data: subjects }
    },

    // Get subject statistics
    getStats: async() => {
        await delay()

        const stats = {
            total: subjectsStore.length,
            byType: {},
            byStatus: {},
            totalClasses: 0,
        }

        subjectsStore.forEach(subject => {
            // Count by type
            stats.byType[subject.type] = (stats.byType[subject.type] || 0) + 1

            // Count by status
            stats.byStatus[subject.status] = (stats.byStatus[subject.status] || 0) + 1

            // Count total class associations
            stats.totalClasses += subject.classes.length
        })

        return { data: stats }
    },

    // Search subjects
    searchSubjects: async query => {
        await delay()

        const searchTerm = query.toLowerCase()
        const results = subjectsStore.filter(
            subject =>
            subject.name.toLowerCase().includes(searchTerm) ||
            subject.code.toLowerCase().includes(searchTerm) ||
            subject.description.toLowerCase().includes(searchTerm)
        )

        return {
            data: results,
            total: results.length,
            query: query,
        }
    },

    // Assign teacher to subject
    assignTeacher: async(subjectId, teacherId) => {
        await delay()

        const subject = subjectsStore.find(s => s.id === subjectId)
        if (!subject) {
            throw new Error('Subject not found')
        }

        if (!subject.teachers.includes(teacherId)) {
            subject.teachers.push(teacherId)
            subject.updatedAt = new Date().toISOString()
        }

        return { data: subject }
    },

    // Remove teacher from subject
    removeTeacher: async(subjectId, teacherId) => {
        await delay()

        const subject = subjectsStore.find(s => s.id === subjectId)
        if (!subject) {
            throw new Error('Subject not found')
        }

        subject.teachers = subject.teachers.filter(id => id !== teacherId)
        subject.updatedAt = new Date().toISOString()

        return { data: subject }
    },

    // Update subject syllabus
    updateSubjectSyllabus: async(subjectId, classId, syllabus) => {
        await delay()

        const subject = subjectsStore.find(s => s.id === subjectId)
        if (!subject) {
            throw new Error('Subject not found')
        }

        if (!subject.classes.includes(classId)) {
            throw new Error('Subject not available for this class')
        }

        subject.syllabus[classId] = syllabus
        subject.updatedAt = new Date().toISOString()

        return { data: subject }
    },
}

export default subjectsApi