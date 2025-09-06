import React, { useState } from 'react'
import { Download, FileText, Folder, Search, Filter, Calendar, FileIcon } from 'lucide-react'
import Button from '../components/Button'

const Downloads = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  const downloads = [
    {
      id: 1,
      name: 'Student Handbook 2024',
      category: 'handbook',
      size: '2.5 MB',
      format: 'PDF',
      downloads: 1250,
      lastUpdated: '2024-01-15',
      description: 'Complete guide for students and parents'
    },
    {
      id: 2,
      name: 'Academic Calendar',
      category: 'calendar',
      size: '1.2 MB',
      format: 'PDF',
      downloads: 890,
      lastUpdated: '2024-01-10',
      description: 'Important dates and academic schedule'
    },
    {
      id: 3,
      name: 'Fee Structure 2024',
      category: 'fees',
      size: '850 KB',
      format: 'PDF',
      downloads: 645,
      lastUpdated: '2024-01-08',
      description: 'Detailed fee structure for all classes'
    },
    {
      id: 4,
      name: 'Admission Form',
      category: 'forms',
      size: '450 KB',
      format: 'PDF',
      downloads: 2100,
      lastUpdated: '2024-01-05',
      description: 'Application form for new admissions'
    },
    {
      id: 5,
      name: 'School Policies',
      category: 'policies',
      size: '3.1 MB',
      format: 'PDF',
      downloads: 567,
      lastUpdated: '2024-01-03',
      description: 'Complete school policies and guidelines'
    },
    {
      id: 6,
      name: 'Transport Route Map',
      category: 'transport',
      size: '1.8 MB',
      format: 'PDF',
      downloads: 423,
      lastUpdated: '2024-01-01',
      description: 'School bus routes and timings'
    }
  ]

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'handbook', label: 'Handbooks' },
    { value: 'forms', label: 'Forms' },
    { value: 'calendar', label: 'Calendars' },
    { value: 'fees', label: 'Fee Structure' },
    { value: 'policies', label: 'Policies' },
    { value: 'transport', label: 'Transport' }
  ]

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'handbook':
        return '📚'
      case 'forms':
        return '📝'
      case 'calendar':
        return '📅'
      case 'fees':
        return '💰'
      case 'policies':
        return '📋'
      case 'transport':
        return '🚌'
      default:
        return '📄'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'handbook':
        return 'bg-blue-100 text-blue-800'
      case 'forms':
        return 'bg-green-100 text-green-800'
      case 'calendar':
        return 'bg-purple-100 text-purple-800'
      case 'fees':
        return 'bg-yellow-100 text-yellow-800'
      case 'policies':
        return 'bg-red-100 text-red-800'
      case 'transport':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Download Center</h1>
            <p className="text-gray-600">Access important documents and files</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">45</div>
              <div className="text-sm text-gray-600">Total Files</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">5.2K</div>
              <div className="text-sm text-gray-600">Total Downloads</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Folder className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">125 MB</div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Downloads */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Featured Downloads</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {downloads.slice(0, 3).map(file => (
            <div key={file.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl mb-2">{getCategoryIcon(file.category)}</div>
                <h4 className="font-medium mb-1">{file.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{file.format}</span>
                  <span>•</span>
                  <span>{file.size}</span>
                  <span>•</span>
                  <span>{file.downloads} downloads</span>
                </div>
                <Button className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Downloads List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">All Downloads</h3>
        
        <div className="space-y-4">
          {downloads.map(file => (
            <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="text-2xl">
                  {getCategoryIcon(file.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{file.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(file.category)}`}>
                      {file.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{file.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileIcon className="h-3 w-3" />
                      {file.format} • {file.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {file.downloads} downloads
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated: {file.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>
              <Button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Downloads