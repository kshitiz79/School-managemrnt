import mockData from '../mockData'

// Mock API for sections
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const sectionsApi = {
  async getAll() {
    await delay(200)

    // Generate sections from classes data
    const sections = []
    mockData.classes.forEach(cls => {
      cls.sections.forEach(sectionName => {
        sections.push({
          id: `${cls.id}-${sectionName}`,
          name: sectionName,
          classId: cls.id,
          className: cls.name,
        })
      })
    })

    return {
      success: true,
      data: sections,
    }
  },

  async getByClass(classId) {
    await delay(200)

    const classData = mockData.classes.find(cls => cls.id === classId)

    if (!classData) {
      return {
        success: false,
        error: 'Class not found',
      }
    }

    const sections = classData.sections.map(sectionName => ({
      id: `${classId}-${sectionName}`,
      name: sectionName,
      classId,
      className: classData.name,
    }))

    return {
      success: true,
      data: sections,
    }
  },

  async create(sectionData) {
    await delay(300)

    const newSection = {
      id: `section-${Date.now()}`,
      ...sectionData,
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: newSection,
      message: 'Section created successfully',
    }
  },

  async update(id, sectionData) {
    await delay(300)

    return {
      success: true,
      data: {
        id,
        ...sectionData,
        updatedAt: new Date().toISOString(),
      },
      message: 'Section updated successfully',
    }
  },

  async delete(id) {
    await delay(200)

    return {
      success: true,
      message: 'Section deleted successfully',
    }
  },
}
