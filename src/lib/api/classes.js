import mockData from '../mockData'

// Mock API for classes
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const classesApi = {
  async getAll(params = {}) {
    await delay(300)

    return {
      success: true,
      data: mockData.classes,
    }
  },

  async getById(id) {
    await delay(200)

    const classData = mockData.classes.find(cls => cls.id === id)

    if (!classData) {
      return {
        success: false,
        error: 'Class not found',
      }
    }

    return {
      success: true,
      data: classData,
    }
  },

  async create(classData) {
    await delay(400)

    const newClass = {
      id: `class-${Date.now()}`,
      ...classData,
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: newClass,
      message: 'Class created successfully',
    }
  },

  async update(id, classData) {
    await delay(400)

    return {
      success: true,
      data: {
        id,
        ...classData,
        updatedAt: new Date().toISOString(),
      },
      message: 'Class updated successfully',
    }
  },

  async delete(id) {
    await delay(300)

    return {
      success: true,
      message: 'Class deleted successfully',
    }
  },
}
