import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Eye,
    Phone,
    Mail,
    Calendar,
    User,
    Clock,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    Bell,
    Users,
    Target,
    TrendingUp,
    MessageSquare,
    FileText,
    Download,
    GraduationCap
} from 'lucide-react';
import Input from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Table } from '../../components/ui/Table';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { Dropdown } from '../../components/ui/Dropdown';
import { admissionEnquiryApi } from '../../lib/api/admissionEnquiry';
import { staffApi } from '../../lib/api/staff';
import { classesApi } from '../../lib/api/classes';

// Validation Schema
const enquirySchema = z.object({
    studentName: z.string().min(1, 'Student name is required'),
    parentName: z.string().min(1, 'Parent name is required'),
    parentMobile: z.string().min(10, 'Valid mobile number is required'),
    parentEmail: z.string().email('Valid email is required').optional().or(z.literal('')),
    classInterestedIn: z.string().min(1, 'Class is required'),
    enquiryDate: z.string().min(1, 'Enquiry date is required'),
    source: z.enum(['walk_in', 'phone', 'email', 'website', 'referral', 'advertisement'], {
        required_error: 'Source is required'
    }),
    priority: z.enum(['low', 'medium', 'high', 'urgent'], {
        required_error: 'Priority is required'
    }),
    assignedCounselorId: z.string().optional(),
    notes: z.string().optional(),
    followUpDate: z.string().optional(),
    status: z.enum(['new', 'contacted', 'interested', 'visit_scheduled', 'visited', 'application_submitted', 'admitted', 'rejected', 'lost'], {
        required_error: 'Status is required'
    })
});

const ENQUIRY_STAGES = [
    { id: 'new', name: 'New Enquiries', color: 'bg-gray-100', textColor: 'text-gray-800' },
    { id: 'contacted', name: 'Contacted', color: 'bg-blue-100', textColor: 'text-blue-800' },
    { id: 'interested', name: 'Interested', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
    { id: 'visit_scheduled', name: 'Visit Scheduled', color: 'bg-purple-100', textColor: 'text-purple-800' },
    { id: 'visited', name: 'Visited', color: 'bg-orange-100', textColor: 'text-orange-800' },
    { id: 'application_submitted', name: 'Application Submitted', color: 'bg-indigo-100', textColor: 'text-indigo-800' },
    { id: 'admitted', name: 'Admitted', color: 'bg-green-100', textColor: 'text-green-800' },
    { id: 'rejected', name: 'Rejected', color: 'bg-red-100', textColor: 'text-red-800' },
    { id: 'lost', name: 'Lost', color: 'bg-gray-200', textColor: 'text-gray-600' }
];

const EnquiryCard = ({ enquiry, onEdit, onViewDetails }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'enquiry',
        item: { id: enquiry.id, currentStatus: enquiry.status },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'border-l-red-500 bg-red-50';
            case 'high': return 'border-l-orange-500 bg-orange-50';
            case 'medium': return 'border-l-yellow-500 bg-yellow-50';
            default: return 'border-l-gray-500 bg-gray-50';
        }
    };

    const isOverdue = enquiry.followUpDate && new Date(enquiry.followUpDate) < new Date();

    return (
        <div
            ref={drag}
            className={`bg-white border-l-4 rounded-lg shadow-sm p-4 mb-3 cursor-move ${getPriorityColor(enquiry.priority)
                } ${isDragging ? 'opacity-50' : ''}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-medium text-gray-900">{enquiry.studentName}</h4>
                    <p className="text-sm text-gray-600">{enquiry.parentName}</p>
                </div>
                <div className="flex gap-1">
                    {isOverdue && (
                        <AlertTriangle className="w-4 h-4 text-red-500" title="Follow-up overdue" />
                    )}
                    <Dropdown
                        trigger={<MoreHorizontal className="w-4 h-4 text-gray-400" />}
                        items={[
                            {
                                label: 'View Details',
                                icon: Eye,
                                onClick: () => onViewDetails(enquiry)
                            },
                            {
                                label: 'Edit',
                                icon: Edit,
                                onClick: () => onEdit(enquiry)
                            },
                            {
                                label: 'Call',
                                icon: Phone,
                                onClick: () => window.open(`tel:${enquiry.parentMobile}`)
                            },
                            {
                                label: 'Email',
                                icon: Mail,
                                onClick: () => window.open(`mailto:${enquiry.parentEmail}`)
                            }
                        ]}
                    />
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span>{enquiry.classInterestedIn}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{enquiry.parentMobile}</span>
                </div>
                {enquiry.assignedCounselor && (
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{enquiry.assignedCounselor.name}</span>
                    </div>
                )}
                {enquiry.followUpDate && (
                    <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                        <Calendar className="w-4 h-4" />
                        <span>Follow-up: {new Date(enquiry.followUpDate).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mt-3">
                <span className={`px-2 py-1 rounded-full text-xs ${enquiry.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    enquiry.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        enquiry.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {enquiry.priority?.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                    {new Date(enquiry.enquiryDate).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
};

const KanbanColumn = ({ stage, enquiries, onDrop, onEdit, onViewDetails }) => {
    const [{ isOver }, drop] = useDrop({
        accept: 'enquiry',
        drop: (item) => onDrop(item.id, stage.id),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div
            ref={drop}
            className={`flex-1 min-w-80 ${isOver ? 'bg-blue-50' : 'bg-gray-50'} rounded-lg p-4`}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{stage.name}</h3>
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {enquiries.length}
                    </span>
                </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {Array.isArray(enquiries) && enquiries.map(enquiry => (
                    <EnquiryCard
                        key={enquiry.id}
                        enquiry={enquiry}
                        onEdit={onEdit}
                        onViewDetails={onViewDetails}
                    />
                ))}
                {enquiries.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Users className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm">No enquiries</p>
                    </div>
                )}
            </div>
        </div>
    );
};