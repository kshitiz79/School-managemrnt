import React, { useState } from 'react'
import { Award, Download, Search, Filter, Plus, FileText } from 'lucide-react'
import Button from '../components/Button'

const Certificates = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const certificates = [
    {
      id: 1,
      title: 'Academic Excellence Certificate',
      type: 'academic',
      recipient: 'John Doe',
      class: 'Class 10',
      dateIssued: '2024-01-15',
      status: 'generated'
    },
    {
      id: 2,
      title: 'Sports Achievement Certificate',
      type: 'sports',
      recipient: 'Jane Smith',
      class: 'Class 9',
      dateIssued: '2024-01-10',
      status: 'generated'
    },
    {
      id: 3,
      title: 'Perfect Attendance Certificate',
      type: 'attendance',
      recipient: 'Mike Johnson',
      class: 'Class 8',
      dateIssued: '2024-01-05',
      status: 'pending'
    },
    {
      id: 4,
      title: 'Leadership Award Certificate',
      type: 'leadership',
      recipient: 'Sarah Wilson',
      class: 'Class 11',
      dateIssued: '2024-01-03',
      status: 'generated'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'generated':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
            <p className="text-gray-600">Generate and manage student certificates</p>
          </div>
        </div>
        <Button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Create Certificate
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-gray-600">Total Certificates</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">142</div>
              <div className="text-sm text-gray-600">Generated</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">14</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Download className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">89</div>
              <div className="text-sm text-gray-600">Downloaded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All Types</option>
            <option value="academic">Academic</option>
            <option value="sports">Sports</option>
            <option value="attendance">Attendance</option>
            <option value="leadership">Leadership</option>
          </select>
        </div>
      </div>

      {/* Certificate Templates */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Certificate Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Academic Excellence', icon: '🎓', color: 'blue' },
            { name: 'Sports Achievement', icon: '🏆', color: 'green' },
            { name: 'Perfect Attendance', icon: '⏰', color: 'purple' },
            { name: 'Leadership Award', icon: '👑', color: 'orange' },
            { name: 'Art & Creativity', icon: '🎨', color: 'pink' },
            { name: 'Community Service', icon: '🤝', color: 'indigo' },
          ].map((template, index) => (
            <div key={index} className={`border-2 border-${template.color}-200 rounded-lg p-4 hover:border-${template.color}-400 cursor-pointer transition-colors`}>
              <div className="text-center">
                <div className="text-3xl mb-2">{template.icon}</div>
                <h4 className="font-medium">{template.name}</h4>
                <Button className={`mt-2 w-full bg-${template.color}-600 text-white px-3 py-1 rounded text-sm hover:bg-${template.color}-700`}>
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Certificates</h3>
        
        <div className="space-y-4">
          {certificates.map(cert => (
            <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{cert.title}</h3>
                  <p className="text-sm text-gray-600">
                    {cert.recipient} - {cert.class}
                  </p>
                  <p className="text-xs text-gray-500">
                    Issued: {cert.dateIssued}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(cert.status)}`}>
                  {cert.status}
                </span>
                <Button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300">
                  <FileText className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Certificates