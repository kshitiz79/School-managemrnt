import mockData from '../mockData'

// Mock API for term reports
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const termReportsApi = {
  // Available Reports
  async getAvailableReports() {
    await delay(500)

    const reports = [
      {
        id: 'report-1',
        name: 'Academic Performance Report',
        description:
          'Comprehensive analysis of student academic performance across all subjects',
        type: 'academic_performance',
        category: 'academic',
        formats: ['pdf', 'excel', 'html'],
        frequency: 'Term-wise',
        lastGenerated: '2024-02-01T10:00:00Z',
        estimatedTime: '5-10 minutes',
        features: [
          'Subject-wise performance analysis',
          'Grade distribution charts',
          'Comparative analysis with previous terms',
          'Individual student progress tracking',
        ],
      },
      {
        id: 'report-2',
        name: 'Attendance Summary Report',
        description: 'Detailed attendance analysis for students and classes',
        type: 'attendance_summary',
        category: 'attendance',
        formats: ['pdf', 'excel'],
        frequency: 'Monthly/Term-wise',
        lastGenerated: '2024-01-28T14:30:00Z',
        estimatedTime: '3-5 minutes',
        features: [
          'Class-wise attendance statistics',
          'Individual student attendance records',
          'Attendance trends and patterns',
          'Absenteeism analysis',
        ],
      },
      {
        id: 'report-3',
        name: 'Grade Distribution Analysis',
        description:
          'Statistical analysis of grade distribution across classes and subjects',
        type: 'grade_distribution',
        category: 'academic',
        formats: ['pdf', 'html'],
        frequency: 'Term-wise',
        lastGenerated: '2024-01-25T09:15:00Z',
        estimatedTime: '2-4 minutes',
        features: [
          'Grade distribution charts',
          'Subject-wise grade analysis',
          'Class comparison',
          'Performance benchmarking',
        ],
      },
      {
        id: 'report-4',
        name: 'Subject-wise Performance Analysis',
        description: 'In-depth analysis of performance in individual subjects',
        type: 'subject_analysis',
        category: 'academic',
        formats: ['pdf', 'excel'],
        frequency: 'Term-wise',
        lastGenerated: null,
        estimatedTime: '4-8 minutes',
        features: [
          'Subject difficulty analysis',
          'Teacher performance correlation',
          'Topic-wise performance breakdown',
          'Improvement recommendations',
        ],
      },
      {
        id: 'report-5',
        name: 'Student Progress Report',
        description:
          'Individual student progress tracking and development analysis',
        type: 'student_progress',
        category: 'academic',
        formats: ['pdf', 'html'],
        frequency: 'Term-wise',
        lastGenerated: '2024-01-30T11:45:00Z',
        estimatedTime: '6-12 minutes',
        features: [
          'Individual progress tracking',
          'Skill development analysis',
          'Learning outcome assessment',
          'Personalized recommendations',
        ],
      },
      {
        id: 'report-6',
        name: 'Class Comparison Report',
        description:
          'Comparative analysis between different classes and sections',
        type: 'class_comparison',
        category: 'administrative',
        formats: ['pdf', 'excel'],
        frequency: 'Term-wise',
        lastGenerated: '2024-01-22T16:20:00Z',
        estimatedTime: '3-6 minutes',
        features: [
          'Inter-class performance comparison',
          'Section-wise analysis',
          'Teacher effectiveness comparison',
          'Resource allocation insights',
        ],
      },
      {
        id: 'report-7',
        name: 'Behavioral Assessment Report',
        description:
          'Analysis of student behavioral patterns and disciplinary records',
        type: 'behavioral_assessment',
        category: 'behavioral',
        formats: ['pdf'],
        frequency: 'Term-wise',
        lastGenerated: null,
        estimatedTime: '4-7 minutes',
        features: [
          'Behavioral incident analysis',
          'Disciplinary action tracking',
          'Improvement trend analysis',
          'Counseling recommendations',
        ],
      },
      {
        id: 'report-8',
        name: 'Parent-Teacher Meeting Report',
        description: 'Summary of parent-teacher interactions and feedback',
        type: 'ptm_summary',
        category: 'administrative',
        formats: ['pdf', 'html'],
        frequency: 'Event-based',
        lastGenerated: '2024-01-15T13:00:00Z',
        estimatedTime: '2-4 minutes',
        features: [
          'Meeting attendance summary',
          'Parent feedback analysis',
          'Action items tracking',
          'Follow-up recommendations',
        ],
      },
    ]

    return {
      success: true,
      data: reports,
    }
  },

  // Generate Report
  async generateReport(reportId, options) {
    await delay(2000) // Simulate report generation time

    const reportJob = {
      id: `job-${Date.now()}`,
      reportId,
      status: 'processing',
      progress: 0,
      startedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      options,
    }

    return {
      success: true,
      data: reportJob,
      message: 'Report generation started',
    }
  },

  // Quick Stats
  async getQuickStats() {
    await delay(400)

    const stats = {
      averagePerformance: '85.2%',
      attendanceRate: '92.8%',
      passRate: '94.5%',
      reportsGenerated: 156,
      trends: {
        performance: 2.3,
        attendance: -1.2,
        passRate: 3.1,
        reports: 12.5,
      },
    }

    return {
      success: true,
      data: stats,
    }
  },

  // Recent Reports
  async getRecentReports() {
    await delay(300)

    const reports = [
      {
        id: 'recent-1',
        name: 'Academic Performance Report - Term 1',
        type: 'academic_performance',
        generatedAt: '2024-02-01T10:00:00Z',
        format: 'pdf',
        status: 'completed',
        downloadUrl: '/reports/academic-performance-term1.pdf',
        filename: 'academic_performance_term1_2024.pdf',
        size: '2.4 MB',
      },
      {
        id: 'recent-2',
        name: 'Attendance Summary - January 2024',
        type: 'attendance_summary',
        generatedAt: '2024-01-28T14:30:00Z',
        format: 'excel',
        status: 'completed',
        downloadUrl: '/reports/attendance-summary-jan2024.xlsx',
        filename: 'attendance_summary_jan2024.xlsx',
        size: '1.8 MB',
      },
      {
        id: 'recent-3',
        name: 'Grade Distribution Analysis',
        type: 'grade_distribution',
        generatedAt: '2024-01-25T09:15:00Z',
        format: 'pdf',
        status: 'completed',
        downloadUrl: '/reports/grade-distribution.pdf',
        filename: 'grade_distribution_analysis.pdf',
        size: '1.2 MB',
      },
      {
        id: 'recent-4',
        name: 'Student Progress Report - Class 10',
        type: 'student_progress',
        generatedAt: '2024-01-30T11:45:00Z',
        format: 'html',
        status: 'completed',
        downloadUrl: '/reports/student-progress-class10.html',
        filename: 'student_progress_class10.html',
        size: '856 KB',
      },
      {
        id: 'recent-5',
        name: 'Class Comparison Report',
        type: 'class_comparison',
        generatedAt: '2024-01-22T16:20:00Z',
        format: 'pdf',
        status: 'completed',
        downloadUrl: '/reports/class-comparison.pdf',
        filename: 'class_comparison_report.pdf',
        size: '1.5 MB',
      },
      {
        id: 'recent-6',
        name: 'Subject Analysis - Mathematics',
        type: 'subject_analysis',
        generatedAt: '2024-02-05T08:30:00Z',
        format: 'excel',
        status: 'processing',
        progress: 75,
        estimatedCompletion: '2024-02-05T08:45:00Z',
      },
    ]

    return {
      success: true,
      data: reports,
    }
  },

  // Report Templates
  async getReportTemplates() {
    await delay(300)

    const templates = [
      {
        id: 'template-1',
        name: 'Standard Academic Report',
        description: 'Default template for academic performance reports',
        type: 'academic_performance',
        isDefault: true,
        layout: 'portrait',
        sections: [
          'header',
          'summary',
          'detailed_analysis',
          'charts',
          'recommendations',
        ],
      },
      {
        id: 'template-2',
        name: 'Executive Summary Report',
        description: 'Condensed report template for administrators',
        type: 'academic_performance',
        isDefault: false,
        layout: 'portrait',
        sections: ['header', 'summary', 'key_metrics', 'charts'],
      },
    ]

    return {
      success: true,
      data: templates,
    }
  },

  // Utility functions
  async getActiveTerms() {
    await delay(200)

    const terms = [
      {
        id: 'term-1',
        name: 'Term 1 Examination 2024-25',
        academicYear: '2024-25',
        status: 'active',
      },
      {
        id: 'term-2',
        name: 'Term 2 Examination 2024-25',
        academicYear: '2024-25',
        status: 'upcoming',
      },
    ]

    return {
      success: true,
      data: terms,
    }
  },

  async getClasses() {
    await delay(200)

    return {
      success: true,
      data: mockData.classes,
    }
  },

  async getSubjects() {
    await delay(200)

    return {
      success: true,
      data: mockData.subjects,
    }
  },

  // Report Status
  async getReportStatus(jobId) {
    await delay(300)

    const status = {
      id: jobId,
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString(),
      downloadUrl: `/reports/${jobId}.pdf`,
      filename: `report_${jobId}.pdf`,
    }

    return {
      success: true,
      data: status,
    }
  },

  // Scheduled Reports
  async getScheduledReports() {
    await delay(400)

    const scheduled = [
      {
        id: 'schedule-1',
        reportId: 'report-1',
        name: 'Monthly Academic Performance',
        frequency: 'monthly',
        nextRun: '2024-03-01T09:00:00Z',
        recipients: ['principal@school.edu', 'admin@school.edu'],
        isActive: true,
      },
      {
        id: 'schedule-2',
        reportId: 'report-2',
        name: 'Weekly Attendance Summary',
        frequency: 'weekly',
        nextRun: '2024-02-12T08:00:00Z',
        recipients: ['attendance@school.edu'],
        isActive: true,
      },
    ]

    return {
      success: true,
      data: scheduled,
    }
  },
}
