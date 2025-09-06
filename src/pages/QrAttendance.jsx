import React, { useState } from 'react'
import { QrCode, Camera, Download, Clock, Scan, Users } from 'lucide-react'
import Button from '../components/Button'

const QrAttendance = () => {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false)

  const classes = [
    { id: '1', name: 'Class 1' },
    { id: '2', name: 'Class 2' },
    { id: '3', name: 'Class 3' },
    { id: '4', name: 'Class 4' },
    { id: '5', name: 'Class 5' },
  ]

  const subjects = [
    { id: '1', name: 'Mathematics' },
    { id: '2', name: 'Science' },
    { id: '3', name: 'English' },
    { id: '4', name: 'History' },
    { id: '5', name: 'Geography' },
  ]

  const generateQR = () => {
    setQrCodeGenerated(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <QrCode className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">QR Attendance</h1>
            <p className="text-gray-600">Generate and track attendance using QR codes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Generator */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Generate QR Code</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Choose a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Choose a subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={generateQR}
              disabled={!selectedClass || !selectedSubject}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Generate QR Code
            </Button>

            {qrCodeGenerated && (
              <div className="text-center space-y-4">
                <div className="bg-gray-100 p-8 rounded-lg">
                  <div className="w-48 h-48 mx-auto bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <QrCode className="h-32 w-32 text-gray-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">QR Code for attendance</p>
                <Button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Scanner */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Scan Attendance</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-100 p-8 rounded-lg">
              <div className="w-full h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Camera className="h-16 w-16 text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Use camera to scan student QR codes
            </p>
            <Button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              <Scan className="h-4 w-4 mr-2" />
              Start Scanner
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">142</div>
              <div className="text-sm text-gray-600">Present Today</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <QrCode className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">28</div>
              <div className="text-sm text-gray-600">QR Scans Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Recent Attendance</h3>
        </div>
        
        <div className="space-y-4">
          {[
            { class: 'Class 1', subject: 'Mathematics', time: '10:30 AM', present: 28, total: 30 },
            { class: 'Class 2', subject: 'Science', time: '11:30 AM', present: 25, total: 27 },
            { class: 'Class 3', subject: 'English', time: '12:30 PM', present: 30, total: 32 },
          ].map((record, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">{record.class} - {record.subject}</h4>
                <p className="text-sm text-gray-600">Today, {record.time}</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">{record.present}/{record.total}</div>
                <div className="text-sm text-gray-600">Present</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QrAttendance