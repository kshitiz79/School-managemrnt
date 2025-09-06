import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  User,
  Calendar,
  Clock,
  MapPin,
  Eye,
  Edit,
  MessageSquare,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Download,
  Bell,
  BellOff,
  FileText,
  Users,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { behaviourApi } from '../../lib/api/behaviour'

const IncidentCard = ({ incident, onView, onEdit, onUpdateStatus }) => {
  const getSeverityColor = severity => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'open':
        return 'text-blue-600 bg-blue-100'
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-100'
      case 'resolved':
        return 'text-green-600 bg-green-100'
      case 'closed':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${getSeverityColor(incident.severity)}`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-medium">{incident.title}</h3>
            <p className="text-sm text-gray-500">
              {incident.studentName} • {incident.className} - {incident.section}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}
          >
            {incident.status.replace('-', ' ').toUpperCase()}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}
          >
            {incident.severity.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(incident.date).toLocaleDateString()}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{incident.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{incident.location}</span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-2">
          {incident.description}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <User className="w-4 h-4" />
          <span>Reported by {incident.reportedByName}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onView(incident)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(incident)}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {incident.parentNotificationSent ? (
            <BellOff
              className="w-4 h-4 text-green-600"
              title="Parent Notified"
            />
          ) : (
            <Bell
              className="w-4 h-4 text-orange-600"
              title="Parent Not Notified"
            />
          )}
        </div>
      </div>
    </div>
  )
}

const IncidentTimeline = ({ incident }) => {
  const timelineEvents = [
    {
      id: 1,
      type: 'created',
      title: 'Incident Reported',
      description: `Incident reported by ${incident.reportedByName}`,
      timestamp: incident.reportedAt,
      user: incident.reportedByName,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100',
    },
    {
      id: 2,
      type: 'action',
      title: 'Immediate Action Taken',
      description: incident.actionTaken || 'No immediate action recorded',
      timestamp: incident.reportedAt,
      user: incident.reportedByName,
      icon: CheckCircle,
      color: 'text-blue-600 bg-blue-100',
    },
    ...(incident.parentNotificationSent
      ? [
          {
            id: 3,
            type: 'notification',
            title: 'Parent Notified',
            description: 'Parent notification sent successfully',
            timestamp: incident.parentNotifiedAt,
            user: 'System',
            icon: Bell,
            color: 'text-green-600 bg-green-100',
          },
        ]
      : []),
    ...(incident.followUpActions?.map((action, index) => ({
      id: 4 + index,
      type: 'followup',
      title: 'Follow-up Action',
      description: action.description,
      timestamp: action.timestamp,
      user: action.user,
      icon: MessageSquare,
      color: 'text-purple-600 bg-purple-100',
    })) || []),
  ]

  return (
    <div className="space-y-4">
      {Array.isArray(timelineEvents) &&
        timelineEvents.map((event, index) => {
          const Icon = event.icon
          return (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full ${event.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {index < timelineEvents.length - 1 && (
                  <div className="w-px h-8 bg-gray-200 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{new Date(event.timestamp).toLocaleDateString()}</div>
                    <div>{new Date(event.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  by {event.user}
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}

const IncidentDetailsDialog = ({ incident, open, onClose, onUpdateStatus }) => {
  const [newStatus, setNewStatus] = useState(incident?.status || 'open')
  const [followUpNote, setFollowUpNote] = useState('')

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, note }) =>
      behaviourApi.updateIncidentStatus(id, status, note),
    onSuccess: () => {
      onClose()
    },
  })

  const handleStatusUpdate = () => {
    updateStatusMutation.mutate({
      id: incident.id,
      status: newStatus,
      note: followUpNote,
    })
  }

  if (!incident) return null

  return (
    <Dialog open={open} onClose={onClose} title="Incident Details" size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{incident.title}</h2>
            <p className="text-gray-600">
              {incident.studentName} • {incident.className} - {incident.section}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                incident.severity === 'critical'
                  ? 'text-red-600 bg-red-100'
                  : incident.severity === 'high'
                    ? 'text-orange-600 bg-orange-100'
                    : incident.severity === 'medium'
                      ? 'text-yellow-600 bg-yellow-100'
                      : 'text-green-600 bg-green-100'
              }`}
            >
              {incident.severity.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date & Time
            </label>
            <p className="text-sm">
              {new Date(incident.date).toLocaleDateString()} at {incident.time}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <p className="text-sm">{incident.location}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <p className="text-sm">{incident.categoryName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reported By
            </label>
            <p className="text-sm">{incident.reportedByName}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <p className="text-sm bg-gray-50 p-3 rounded">
            {incident.description}
          </p>
        </div>

        {/* Witnesses */}
        {incident.witnesses && incident.witnesses.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Witnesses
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(incident.witnesses) &&
                incident.witnesses.map((witness, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    {witness}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h3 className="text-lg font-medium mb-4">Timeline</h3>
          <IncidentTimeline incident={incident} />
        </div>

        {/* Status Update */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Update Status</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Note
              </label>
              <textarea
                value={followUpNote}
                onChange={e => setFollowUpNote(e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Add any follow-up notes..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleStatusUpdate}
            disabled={updateStatusMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const ParentAcknowledgmentDialog = ({ incident, open, onClose }) => {
  const acknowledgmentMutation = useMutation({
    mutationFn: data => behaviourApi.sendParentNotification(data),
    onSuccess: () => {
      onClose()
    },
  })

  const handleSendNotification = () => {
    acknowledgmentMutation.mutate({
      incidentId: incident.id,
      studentId: incident.studentId,
      message: `Incident Report: ${incident.title}`,
      requireAcknowledgment: true,
    })
  }

  if (!incident) return null

  return (
    <Dialog open={open} onClose={onClose} title="Parent Notification">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Send notification to parents of:</h3>
          <p className="text-gray-600">
            {incident.studentName} ({incident.className} - {incident.section})
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Notification Preview:</h4>
          <div className="text-sm space-y-2">
            <p>
              <strong>Subject:</strong> Incident Report - {incident.title}
            </p>
            <p>
              <strong>Date:</strong>{' '}
              {new Date(incident.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Severity:</strong> {incident.severity.toUpperCase()}
            </p>
            <p>
              <strong>Description:</strong> {incident.description}
            </p>
            {incident.actionTaken && (
              <p>
                <strong>Action Taken:</strong> {incident.actionTaken}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSendNotification}
            disabled={acknowledgmentMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            {acknowledgmentMutation.isPending
              ? 'Sending...'
              : 'Send Notification'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const Incidents = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showParentNotification, setShowParentNotification] = useState(false)

  const { data: incidentsData, isLoading } = useQuery({
    queryKey: [
      'behaviour',
      'incidents',
      searchTerm,
      statusFilter,
      severityFilter,
    ],
    queryFn: () =>
      behaviourApi.getIncidents({
        search: searchTerm,
        status: statusFilter,
        severity: severityFilter,
      }),
  })

  const handleViewIncident = incident => {
    setSelectedIncident(incident)
    setShowDetails(true)
  }

  const handleEditIncident = incident => {
    // Navigate to edit form
    console.log('Edit incident:', incident.id)
  }

  const handleParentNotification = incident => {
    setSelectedIncident(incident)
    setShowParentNotification(true)
  }

  const filteredIncidents = incidentsData?.data || []

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Behavior Incidents</h1>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            New Incident
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{filteredIncidents.length}</p>
              <p className="text-sm text-gray-600">Total Incidents</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">
                {filteredIncidents.filter(i => i.status === 'open').length}
              </p>
              <p className="text-sm text-gray-600">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {filteredIncidents.filter(i => i.status === 'resolved').length}
              </p>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">
                {
                  filteredIncidents.filter(i => !i.parentNotificationSent)
                    .length
                }
              </p>
              <p className="text-sm text-gray-600">Pending Notifications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Incidents Found
            </h3>
            <p className="text-gray-500">
              No incidents match your current filters.
            </p>
          </div>
        ) : (
          filteredIncidents.map(incident => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onView={handleViewIncident}
              onEdit={handleEditIncident}
              onUpdateStatus={() => {}}
            />
          ))
        )}
      </div>

      {/* Incident Details Dialog */}
      <IncidentDetailsDialog
        incident={selectedIncident}
        open={showDetails}
        onClose={() => setShowDetails(false)}
        onUpdateStatus={() => {}}
      />

      {/* Parent Notification Dialog */}
      <ParentAcknowledgmentDialog
        incident={selectedIncident}
        open={showParentNotification}
        onClose={() => setShowParentNotification(false)}
      />
    </div>
  )
}

export default Incidents
