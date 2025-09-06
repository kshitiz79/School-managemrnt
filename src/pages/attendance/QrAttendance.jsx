import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  QrCode,
  Scan,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Settings,
  Smartphone,
  Monitor,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { qrAttendanceApi } from '../../lib/api/qrAttendance'

// Mock QR Code Component (in real app, use a QR library like qrcode.js)
const QRCodeDisplay = ({ value, size = 200 }) => {
  return (
    <div
      className="border-2 border-gray-300 flex items-center justify-center bg-white"
      style={{ width: size, height: size }}
    >
      <div className="text-center p-4">
        <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
        <div className="text-xs text-gray-500 break-all">{value}</div>
      </div>
    </div>
  )
}

const QRScanner = ({ onScan, isActive }) => {
  const [scanResult, setScanResult] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  // Mock scanner - in real app, integrate with camera API
  const simulateScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      const mockQRData = `QR_ATT_${Date.now()}_CLASS_10_A_PERIOD_1`
      setScanResult(mockQRData)
      onScan(mockQRData)
      setIsScanning(false)
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        {isActive ? (
          <div className="space-y-4">
            <div className="w-48 h-48 mx-auto border-2 border-blue-500 rounded-lg flex items-center justify-center bg-blue-50">
              {isScanning ? (
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 mx-auto mb-2 text-blue-600 animate-spin" />
                  <p className="text-blue-600">Scanning...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Scan className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                  <p className="text-blue-600">Position QR code here</p>
                </div>
              )}
            </div>
            <button
              onClick={simulateScan}
              disabled={isScanning}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isScanning ? 'Scanning...' : 'Simulate Scan'}
            </button>
          </div>
        ) : (
          <div className="text-gray-400">
            <Scan className="w-12 h-12 mx-auto mb-2" />
            <p>Scanner inactive</p>
          </div>
        )}
      </div>

      {scanResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Scan successful!</span>
          </div>
          <p className="text-sm text-green-700 mt-1">Data: {scanResult}</p>
        </div>
      )}
    </div>
  )
}

const QRGenerationPanel = ({ classData, onGenerate, generatedQR }) => {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [qrType, setQrType] = useState('period') // period, daily
  const [expiryMinutes, setExpiryMinutes] = useState(30)

  const handleGenerate = () => {
    const qrData = {
      type: qrType,
      classId: selectedClass,
      section: selectedSection,
      period: qrType === 'period' ? selectedPeriod : null,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      expiresAt: Date.now() + expiryMinutes * 60 * 1000,
    }

    onGenerate(qrData)
  }

  const periods = ['1', '2', '3', '4', '5', '6', '7', '8']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium">Generate QR Code</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={qrType}
                onChange={e => setQrType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="daily">Daily Attendance</option>
                <option value="period">Period Wise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Expires In (minutes)
              </label>
              <input
                type="number"
                value={expiryMinutes}
                onChange={e => setExpiryMinutes(parseInt(e.target.value))}
                min="5"
                max="480"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Class</option>
                {classData?.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
                className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">Select Section</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          {qrType === 'period' && (
            <div>
              <label className="block text-sm font-medium mb-1">Period</label>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Period</option>
                {Array.isArray(periods) &&
                  periods.map(period => (
                    <option key={period} value={period}>
                      Period {period}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={
              !selectedClass ||
              !selectedSection ||
              (qrType === 'period' && !selectedPeriod)
            }
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Generate QR Code
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Generated QR Code</h3>
          {generatedQR ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <QRCodeDisplay value={JSON.stringify(generatedQR)} size={200} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <strong>Type:</strong> {generatedQR.type}
                  </div>
                  <div>
                    <strong>Class:</strong> {generatedQR.classId}
                  </div>
                  <div>
                    <strong>Section:</strong> {generatedQR.section}
                  </div>
                  {generatedQR.period && (
                    <div>
                      <strong>Period:</strong> {generatedQR.period}
                    </div>
                  )}
                  <div>
                    <strong>Date:</strong> {generatedQR.date}
                  </div>
                  <div>
                    <strong>Expires:</strong>{' '}
                    {new Date(generatedQR.expiresAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="flex-1 border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Display
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              <QrCode className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>QR code will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ScanEventsList = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Scan className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No scan events recorded</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {Array.isArray(events) &&
        events.map((event, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  event.status === 'success'
                    ? 'bg-green-500'
                    : event.status === 'duplicate'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              />
              <div>
                <div className="font-medium">{event.studentName}</div>
                <div className="text-sm text-gray-500">
                  {event.className} - {event.section}
                  {event.period && ` • Period ${event.period}`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {new Date(event.timestamp).toLocaleTimeString()}
              </div>
              <div
                className={`text-xs ${
                  event.status === 'success'
                    ? 'text-green-600'
                    : event.status === 'duplicate'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {event.status === 'success'
                  ? 'Marked Present'
                  : event.status === 'duplicate'
                    ? 'Already Marked'
                    : 'Failed'}
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}

const QrAttendance = () => {
  const [activeTab, setActiveTab] = useState('generate') // generate, scan, events
  const [generatedQR, setGeneratedQR] = useState(null)
  const [scannerActive, setScannerActive] = useState(false)
  const [scanEvents, setScanEvents] = useState([])
  const [showSettings, setShowSettings] = useState(false)

  const queryClient = useQueryClient()

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => qrAttendanceApi.getClasses(),
  })

  const { data: scanEventsData } = useQuery({
    queryKey: [
      'qr-attendance',
      'scan-events',
      new Date().toISOString().split('T')[0],
    ],
    queryFn: () =>
      qrAttendanceApi.getScanEvents(new Date().toISOString().split('T')[0]),
  })

  const generateQRMutation = useMutation({
    mutationFn: qrAttendanceApi.generateQR,
    onSuccess: data => {
      setGeneratedQR(data)
    },
  })

  const processScanMutation = useMutation({
    mutationFn: qrAttendanceApi.processScan,
    onSuccess: data => {
      setScanEvents(prev => [data, ...prev])
      queryClient.invalidateQueries(['qr-attendance', 'scan-events'])
    },
  })

  const handleGenerateQR = qrData => {
    generateQRMutation.mutate(qrData)
  }

  const handleScan = qrData => {
    try {
      const parsedData = JSON.parse(qrData)

      // Validate QR code
      if (parsedData.expiresAt < Date.now()) {
        alert('QR code has expired')
        return
      }

      // Process scan
      processScanMutation.mutate({
        qrData: parsedData,
        studentId: 'student-1', // In real app, get from authentication
        timestamp: Date.now(),
      })
    } catch (error) {
      alert('Invalid QR code')
    }
  }

  // Auto-refresh QR code every 30 minutes
  useEffect(() => {
    if (generatedQR) {
      const interval = setInterval(() => {
        if (generatedQR.expiresAt < Date.now()) {
          setGeneratedQR(null)
        }
      }, 60000) // Check every minute

      return () => clearInterval(interval)
    }
  }, [generatedQR])

  const getTabIcon = tab => {
    switch (tab) {
      case 'generate':
        return QrCode
      case 'scan':
        return Scan
      case 'events':
        return Clock
      default:
        return QrCode
    }
  }

  const tabs = [
    { id: 'generate', label: 'Generate QR', icon: QrCode },
    { id: 'scan', label: 'Scan QR', icon: Scan },
    { id: 'events', label: 'Scan Events', icon: Clock },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">QR Code Attendance</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Events
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <QrCode className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{generatedQR ? 1 : 0}</p>
              <p className="text-sm text-gray-600">Active QR Codes</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Scan className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {scanEventsData?.data?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Today's Scans</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {scanEventsData?.data?.filter(e => e.status === 'success')
                  .length || 0}
              </p>
              <p className="text-sm text-gray-600">Successful</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">
                {scanEventsData?.data?.filter(e => e.status === 'failed')
                  .length || 0}
              </p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            {Array.isArray(tabs) &&
              tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'generate' && (
            <QRGenerationPanel
              classData={classesData?.data}
              onGenerate={handleGenerateQR}
              generatedQR={generatedQR}
            />
          )}

          {activeTab === 'scan' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">QR Code Scanner</h3>
                <button
                  onClick={() => setScannerActive(!scannerActive)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    scannerActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {scannerActive ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {scannerActive ? 'Stop Scanner' : 'Start Scanner'}
                </button>
              </div>

              <QRScanner onScan={handleScan} isActive={scannerActive} />

              {scanEvents.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Recent Scans</h4>
                  <ScanEventsList events={scanEvents.slice(0, 5)} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Today's Scan Events</h3>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              <ScanEventsList events={scanEventsData?.data || []} />
            </div>
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title="QR Attendance Settings"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Default QR Expiry (minutes)
            </label>
            <input
              type="number"
              defaultValue={30}
              min="5"
              max="480"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Auto-refresh QR Codes
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">
                Automatically refresh expired QR codes
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Duplicate Scan Prevention
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">
                Prevent duplicate scans within same period
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default QrAttendance
