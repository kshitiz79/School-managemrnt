/**
 * Utility functions to safely handle array operations
 */

/**
 * Safely map over an array, returning empty array if input is not an array
 * @param {any} data - The data to map over
 * @param {Function} mapFn - The mapping function
 * @returns {Array} - Mapped array or empty array
 */
export const safeMap = (data, mapFn) => {
  if (!Array.isArray(data)) {
    return []
  }
  return data.map(mapFn)
}

/**
 * Safely get array from data, returning empty array if not an array
 * @param {any} data - The data to check
 * @returns {Array} - The array or empty array
 */
export const safeArray = data => {
  return Array.isArray(data) ? data : []
}

/**
 * Safely access nested array property
 * @param {Object} obj - The object to access
 * @param {string} path - The path to the array (e.g., 'data.items')
 * @returns {Array} - The array or empty array
 */
export const safeNestedArray = (obj, path) => {
  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return []
    }
  }

  return Array.isArray(current) ? current : []
}
