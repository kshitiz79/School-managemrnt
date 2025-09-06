import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  Users,
  GraduationCap,
  Home,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Camera,
} from 'lucide-react'
import { Table } from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { Dropdown } from '../../components/ui/Dropdown'
import { studentsApi } from '../../lib/api/students'
import { classesApi } from '../../lib/api/classes'
import { sectionsApi } from '../../lib/api/sections'
import { studentCategoriesApi } from '../../lib/api/studentCategories'
import { studentHousesApi } from '../../lib/api/studentHouses'
import { exportToPDF, exportToCSV } from '../../lib/export'

const StudentProfileDrawer = ({ student, isOpen, onClose }) => {
  if (!student) return null

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={`${student.name} - Profile`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header with Photo */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="relative">
            {student.photo ? (
              <img
                src={student.photo}
                alt={student.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{student.name}</h3>
            <p className="text-gray-600">Roll No: {student.rollNumber}</p>
            <p className="text-gray-600">
              {student.class?.name} - {student.section?.name}
            </p>
            <div className="flex gap-2 mt-2">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  student.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {student.isActive ? 'Active' : 'Inactive'}
              </span>
              {student.category && (
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {student.category.name}
                </span>
              )}
              {student.house && (
                <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  {student.house.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Personal Information
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date of Birth:</span>
                <span>
                  {new Date(student.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="capitalize">{student.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blood Group:</span>
                <span>{student.bloodGroup || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Religion:</span>
                <span>{student.religion || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nationality:</span>
                <span>{student.nationality || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Information
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mobile:</span>
                <span>{student.mobile || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span>{student.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Emergency Contact:</span>
                <span>{student.emergencyContact || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 block">Current Address:</span>
              <p className="mt-1">{student.currentAddress || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600 block">Permanent Address:</span>
              <p className="mt-1">{student.permanentAddress || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Guardian Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm">
              <h5 className="font-medium">Father Details</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span>{student.fatherName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupation:</span>
                  <span>{student.fatherOccupation || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobile:</span>
                  <span>{student.fatherMobile || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <h5 className="font-medium">Mother Details</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span>{student.motherName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupation:</span>
                  <span>{student.motherOccupation || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobile:</span>
                  <span>{student.motherMobile || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Academic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Admission Date:</span>
              <span>
                {new Date(student.admissionDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Academic Year:</span>
              <span>{student.academicYear || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Previous School:</span>
              <span>{student.previousSchool || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {student.documents?.map((doc, index) => (
              <div key={index} className="border rounded-lg p-3 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-600">{doc.name}</p>
                <button className="text-blue-600 text-xs mt-1 hover:underline">
                  View
                </button>
              </div>
            )) || (
              <p className="text-gray-500 text-sm col-span-full">
                No documents uploaded
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const StudentDetails = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedHouse, setSelectedHouse] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showProfileDrawer, setShowProfileDrawer] = useState(false)

  const {
    data: studentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'students',
      {
        page: currentPage,
        pageSize,
        search: searchTerm,
        classId: selectedClass,
        sectionId: selectedSection,
        categoryId: selectedCategory,
        houseId: selectedHouse,
      },
    ],
    queryFn: () =>
      studentsApi.getAll({
        page: currentPage,
        pageSize,
        search: searchTerm,
        classId: selectedClass,
        sectionId: selectedSection,
        categoryId: selectedCategory,
        houseId: selectedHouse,
      }),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.getAll({ all: true }),
  })

  const { data: sectionsData } = useQuery({
    queryKey: ['sections', 'by-class', selectedClass],
    queryFn: () => sectionsApi.getByClass(selectedClass),
    enabled: !!selectedClass,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['studentCategories', 'all'],
    queryFn: () => studentCategoriesApi.getAll({ all: true }),
  })

  const { data: housesData } = useQuery({
    queryKey: ['studentHouses', 'all'],
    queryFn: () => studentHousesApi.getAll({ all: true }),
  })

  const handleViewProfile = student => {
    setSelectedStudent(student)
    setShowProfileDrawer(true)
  }

  const handleExportCSV = () => {
    const csvData =
      studentsData?.data?.map(student => ({
        'Roll Number': student.rollNumber,
        Name: student.name,
        Class: student.class?.name,
        Section: student.section?.name,
        Category: student.category?.name || '',
        House: student.house?.name || '',
        'Father Name': student.fatherName,
        Mobile: student.mobile,
        Email: student.email,
        'Date of Birth': new Date(student.dateOfBirth).toLocaleDateString(),
        'Admission Date': new Date(student.admissionDate).toLocaleDateString(),
        Status: student.isActive ? 'Active' : 'Inactive',
      })) || []

    exportToCSV(csvData, 'students-list.csv')
  }

  const handleExportPDF = () => {
    const pdfData = {
      title: 'Students List',
      headers: ['Roll No', 'Name', 'Class', 'Section', 'Father Name', 'Mobile'],
      data:
        studentsData?.data?.map(student => [
          student.rollNumber,
          student.name,
          student.class?.name,
          student.section?.name,
          student.fatherName,
          student.mobile,
        ]) || [],
    }

    exportToPDF(pdfData, 'students-list.pdf')
  }

  const columns = [
    {
      key: 'photo',
      header: 'Photo',
      render: student => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          {student.photo ? (
            <img
              src={student.photo}
              alt={student.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
      ),
    },
    { key: 'rollNumber', header: 'Roll No', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'class',
      header: 'Class',
      render: student => `${student.class?.name} - ${student.section?.name}`,
    },
    {
      key: 'category',
      header: 'Category',
      render: student => student.category?.name || 'N/A',
    },
    {
      key: 'house',
      header: 'House',
      render: student => student.house?.name || 'N/A',
    },
    { key: 'fatherName', header: 'Father Name' },
    { key: 'mobile', header: 'Mobile' },
    {
      key: 'status',
      header: 'Status',
      render: student => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            student.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {student.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: student => (
        <Dropdown
          trigger={<MoreHorizontal className="w-4 h-4" />}
          items={[
            {
              label: 'View Profile',
              icon: Eye,
              onClick: () => handleViewProfile(student),
            },
            {
              label: 'Edit',
              icon: Edit,
              onClick: () => console.log('Edit student', student.id),
            },
          ]}
        />
      ),
    },
  ]

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState message="Failed to load students" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Details</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div>
            <select
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value)
                setSelectedSection('')
              }}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Classes</option>
              {Array.isArray(classesData?.data) &&
                classesData.data.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
            >
              <option value="">All Sections</option>
              {Array.isArray(sectionsData?.data) &&
                sectionsData.data.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Categories</option>
              {Array.isArray(categoriesData?.data) &&
                categoriesData.data.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <select
              value={selectedHouse}
              onChange={e => setSelectedHouse(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Houses</option>
              {housesData?.data?.map(house => (
                <option key={house.id} value={house.id}>
                  {house.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow">
        {studentsData?.data?.length === 0 ? (
          <EmptyState
            title="No students found"
            description="No students match your current filters"
          />
        ) : (
          <>
            <Table data={studentsData?.data || []} columns={columns} />
            <div className="p-6 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((studentsData?.total || 0) / pageSize)}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Profile Drawer */}
      <StudentProfileDrawer
        student={selectedStudent}
        isOpen={showProfileDrawer}
        onClose={() => {
          setShowProfileDrawer(false)
          setSelectedStudent(null)
        }}
      />
    </div>
  )
}

export default StudentDetails
