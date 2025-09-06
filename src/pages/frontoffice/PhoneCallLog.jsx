import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Download,
  FileText
} from 'lucide-react';
import Input from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Table } from '../../components/ui/Table';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { Dropdown } from '../../components/ui/Dropdown';
import { phoneCallLogApi } from '../../lib/api/phoneCallLog';
import { staffApi } from '../../lib/api/staff';

// Validation Schema
const callLogSchema = z.object({
  callerName: z.string().min(1, 'Caller name is required'),
  callerPhone: z.string().min(10, 'Valid phone number is required'),
  callerEmail: z.string().email('Valid email is required').optional().or(z.literal('')),
  callType: z.enum(['incoming', 'outgoing'], {
    required_error: 'Call type is required'
  }),
  callDate: z.string().min(1, 'Call date is required'),
  callTime: z.string().min(1, 'Call time is required'),
  duration: z.string().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  personCalled: z.string().optional(),
  department: z.string().optional(),
  callStatus: z.enum(['answered', 'missed', 'busy', 'no_answer'], {
    required_error: 'Call status is required'
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: 'Priority is required'
  }),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
  actionTaken: z.string().optional(),
  recordedBy: z.string().min(1, 'Recorded by is required')
});

const PhoneCallLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [callTypeFilter, setCallTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(callLogSchema),
    mode: 'onChange',
    defaultValues: {
      callDate: new Date().toISOString().split('T')[0],
      callTime: new Date().toTimeString().slice(0, 5),
      callType: 'incoming',
      callStatus: 'answered',
      priority: 'medium',
      followUpRequired: false
    }
  });

  const followUpRequired = watch('followUpRequired');

  const { data: callsData, isLoading, error } = useQuery({
    queryKey: ['phoneCalls', { 
      page: currentPage, 
      pageSize, 
      search: searchTerm,
      callType: callTypeFilter,
      status: statusFilter,
      date: dateFilter
    }],
    queryFn: () => phoneCallLogApi.getAll({ 
      page: currentPage, 
      pageSize, 
      search: searchTerm,
      callType: callTypeFilter,
      status: statusFilter,
      date: dateFilter
    })
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff', 'all'],
    queryFn: () => staffApi.getAll({ all: true })
  });

  const createMutation = useMutation({
    mutationFn: phoneCallLogApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['phoneCalls']);
      setShowCreateDialog(false);
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => phoneCallLogApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['phoneCalls']);
      setShowEditDialog(false);
      reset();
    }
  });

  const handleEdit = (call) => {
    setSelectedCall(call);
    reset({
      callerName: call.callerName,
      callerPhone: call.callerPhone,
      callerEmail: call.callerEmail || '',
      callType: call.callType,
      callDate: call.callDate?.split('T')[0],
      callTime: call.callTime,
      duration: call.duration || '',
      purpose: call.purpose,
      personCalled: call.personCalled || '',
      department: call.department || '',
      callStatus: call.callStatus,
      priority: call.priority,
      followUpRequired: call.followUpRequired || false,
      followUpDate: call.followUpDate?.split('T')[0] || '',
      notes: call.notes || '',
      actionTaken: call.actionTaken || '',
      recordedBy: call.recordedBy
    });
    setShowEditDialog(true);
  };

  const handleViewDetails = (call) => {
    setSelectedCall(call);
    setShowDetailsDialog(true);
  };

  const onSubmit = (data) => {
    if (selectedCall) {
      updateMutation.mutate({ id: selectedCall.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getCallTypeIcon = (type) => {
    return type === 'incoming' ? PhoneIncoming : PhoneOutgoing;
  };

  const getCallTypeColor = (type) => {
    return type === 'incoming' ? 'text-green-600' : 'text-blue-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'no_answer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'callType',
      header: 'Type',
      render: (call) => {
        const Icon = getCallTypeIcon(call.callType);
        return (
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${getCallTypeColor(call.callType)}`} />
            <span className="capitalize">{call.callType}</span>
          </div>
        );
      }
    },
    {
      key: 'callerName',
      header: 'Caller',
      render: (call) => (
        <div>
          <div className="font-medium">{call.callerName}</div>
          <div className="text-sm text-gray-500">{call.callerPhone}</div>
        </div>
      )
    },
    {
      key: 'purpose',
      header: 'Purpose'
    },
    {
      key: 'personCalled',
      header: 'Person Called',
      render: (call) => call.personCalled || 'Reception'
    },
    {
      key: 'callDateTime',
      header: 'Date & Time',
      render: (call) => (
        <div>
          <div>{new Date(call.callDate).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">{call.callTime}</div>
        </div>
      )
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (call) => call.duration || 'N/A'
    },
    {
      key: 'callStatus',
      header: 'Status',
      render: (call) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(call.callStatus)}`}>
          {call.callStatus?.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (call) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(call.priority)}`}>
          {call.priority?.toUpperCase()}
        </span>
      )
    },
    {
      key: 'followUp',
      header: 'Follow-up',
      render: (call) => (
        call.followUpRequired ? (
          <div className="flex items-center gap-1 text-orange-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">
              {call.followUpDate ? new Date(call.followUpDate).toLocaleDateString() : 'Required'}
            </span>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">None</span>
        )
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (call) => (
        <Dropdown
          trigger={<MoreHorizontal className="w-4 h-4" />}
          items={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: () => handleViewDetails(call)
            },
            {
              label: 'Edit',
              icon: Edit,
              onClick: () => handleEdit(call)
            },
            {
              label: 'Call Back',
              icon: Phone,
              onClick: () => window.open(`tel:${call.callerPhone}`)
            }
          ]}
        />
      )
    }
  ];

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState message="Failed to load phone call logs" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Phone Call Log</h1>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => {
              reset();
              setSelectedCall(null);
              setShowCreateDialog(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Log Call
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{callsData?.total || 0}</p>
              <p className="text-sm text-gray-600">Total Calls</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <PhoneIncoming className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {callsData?.data?.filter(c => c.callType === 'incoming').length || 0}
              </p>
              <p className="text-sm text-gray-600">Incoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <PhoneOutgoing className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">
                {callsData?.data?.filter(c => c.callType === 'outgoing').length || 0}
              </p>
              <p className="text-sm text-gray-600">Outgoing</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">
                {callsData?.data?.filter(c => c.followUpRequired).length || 0}
              </p>
              <p className="text-sm text-gray-600">Follow-ups</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneCallLog;