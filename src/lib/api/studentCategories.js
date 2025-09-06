import mockData from '../mockData'

// Mock API for student categories
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const studentCategoriesApi = {
  async getAll() {
    await delay(300)

    // Generate categories from student data
    const categories = [
      {
        id: 'general',
        name: 'General',
        description: 'General category students',
      },
      { id: 'obc', name: 'OBC', description: 'Other Backward Classes' },
      { id: 'sc', name: 'SC', description: 'Scheduled Caste' },
      { id: 'st', name: 'ST', description: 'Scheduled Tribe' },
    ]

    return {
      success: true,
      data: categories,
    }
  },

  async getById(id) {
    await delay(200)

    const categories = {
      general: {
        id: 'general',
        name: 'General',
        description: 'General category students',
      },
      obc: { id: 'obc', name: 'OBC', description: 'Other Backward Classes' },
      sc: { id: 'sc', name: 'SC', description: 'Scheduled Caste' },
      st: { id: 'st', name: 'ST', description: 'Scheduled Tribe' },
    }

    const category = categories[id]

    if (!category) {
      return {
        success: false,
        error: 'Category not found',
      }
    }

    return {
      success: true,
      data: category,
    }
  },

  async create(categoryData) {
    await delay(400)

    const newCategory = {
      id: `category-${Date.now()}`,
      ...categoryData,
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: newCategory,
      message: 'Category created successfully',
    }
  },

  async update(id, categoryData) {
    await delay(400)

    return {
      success: true,
      data: {
        id,
        ...categoryData,
        updatedAt: new Date().toISOString(),
      },
      message: 'Category updated successfully',
    }
  },

  async delete(id) {
    await delay(300)

    return {
      success: true,
      message: 'Category deleted successfully',
    }
  },

  async bulkDelete(ids) {
    await delay(500)

    return {
      success: true,
      message: `${ids.length} categories deleted successfully`,
    }
  },

  async getStudentsByCategory(categoryId) {
    await delay(400)

    const students = mockData.students.filter(
      student => student.category?.toLowerCase() === categoryId.toLowerCase()
    )

    return {
      success: true,
      data: students,
    }
  },
}
