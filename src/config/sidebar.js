import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  Calendar,
  FileText,
  DollarSign,
  MessageSquare,
  BookOpen,
  Library,
  Bus,
  Building,
  Briefcase,
  Monitor,
  ClipboardCheck,
  Award,
  Download,
  Globe,
  Package,
  Video,
  BarChart3,
  Settings,
  Database,
  School,
  UserPlus,
  CalendarCheck,
  Calculator,
  Mail,
  Notebook,
  MapPin,
  Home,
  Users2,
  Laptop,
  QrCode,
  FileCheck,
  FolderDown,
  Layers,
  Archive,
  PlayCircle,
  TrendingUp,
  Cog,
} from 'lucide-react'

// Role-based sidebar configuration
export const getSidebarConfig = userRole => {
  const commonItems = [
    {
      title: 'Dashboard',
      items: [
        {
          href: `/dashboard/${userRole}`,
          icon: LayoutDashboard,
          label: 'Dashboard',
        },
      ],
    },
  ]

  const roleSpecificItems = {
    admin: [
      {
        title: 'Finance Management',
        items: [
          {
            href: '/dashboard/finance/profit-loss',
            icon: BarChart3,
            label: 'Profit & Loss',
          },
          {
            href: '/dashboard/finance/add-income',
            icon: TrendingUp,
            label: 'Add Income',
          },
          {
            href: '/dashboard/finance/add-expense',
            icon: Calculator,
            label: 'Add Expense',
          },
          {
            href: '/dashboard/finance/search-income',
            icon: Archive,
            label: 'Search Income',
          },
          {
            href: '/dashboard/finance/search-expense',
            icon: Archive,
            label: 'Search Expense',
          },
          {
            href: '/dashboard/finance/income-head',
            icon: Layers,
            label: 'Income Heads',
          },
          {
            href: '/dashboard/finance/expense-head',
            icon: Layers,
            label: 'Expense Heads',
          },
        ],
      },
      {
        title: 'Communication Hub',
        items: [
          {
            href: '/dashboard/communication/send-message',
            icon: MessageSquare,
            label: 'Send Message',
          },
          {
            href: '/dashboard/communication/notice-board',
            icon: FileText,
            label: 'Notice Board',
          },
          {
            href: '/dashboard/communication/template-email',
            icon: Mail,
            label: 'Email Templates',
          },
          {
            href: '/dashboard/communication/template-sms',
            icon: MessageSquare,
            label: 'SMS Templates',
          },
          {
            href: '/dashboard/communication/template-whatsapp',
            icon: MessageSquare,
            label: 'WhatsApp Templates',
          },
          {
            href: '/dashboard/communication/log',
            icon: Archive,
            label: 'Communication Logs',
          },
          {
            href: '/dashboard/communication/schedule-log',
            icon: Calendar,
            label: 'Scheduled Messages',
          },
          {
            href: '/dashboard/communication/send-credentials',
            icon: Users,
            label: 'Send Credentials',
          },
        ],
      },
      {
        title: 'Academic Management',
        items: [
          {
            href: '/dashboard/homework/add',
            icon: Notebook,
            label: 'Add Homework',
          },
          {
            href: '/dashboard/homework/daily',
            icon: CalendarCheck,
            label: 'Daily Assignments',
          },
          {
            href: '/dashboard/lessonplan/manage',
            icon: BookOpen,
            label: 'Manage Lesson Plans',
          },
          {
            href: '/dashboard/lessonplan/lessons',
            icon: FileText,
            label: 'Lessons',
          },
          {
            href: '/dashboard/lessonplan/topics',
            icon: Library,
            label: 'Topics',
          },
          {
            href: '/dashboard/lessonplan/syllabus-status',
            icon: BarChart3,
            label: 'Syllabus Status',
          },
          {
            href: '/dashboard/lessonplan/copy-old',
            icon: Archive,
            label: 'Copy Old Lessons',
          },
        ],
      },
    ],

    principal: [
      {
        title: 'Academic Management',
        items: [
          {
            href: '/dashboard/homework/daily',
            icon: Notebook,
            label: 'Homework Tracking',
          },
          {
            href: '/dashboard/lessonplan/manage',
            icon: BookOpen,
            label: 'Lesson Plans',
          },
          {
            href: '/dashboard/lessonplan/syllabus-status',
            icon: BarChart3,
            label: 'Syllabus Progress',
          },
        ],
      },
      {
        title: 'Communication',
        items: [
          {
            href: '/dashboard/communication/send-message',
            icon: MessageSquare,
            label: 'Send Messages',
          },
          {
            href: '/dashboard/communication/notice-board',
            icon: FileText,
            label: 'Notice Board',
          },
          {
            href: '/dashboard/communication/log',
            icon: Archive,
            label: 'Communication Logs',
          },
        ],
      },
      {
        title: 'Finance Overview',
        items: [
          {
            href: '/dashboard/finance/profit-loss',
            icon: BarChart3,
            label: 'Profit & Loss',
          },
          {
            href: '/dashboard/finance/search-income',
            icon: TrendingUp,
            label: 'Income Reports',
          },
          {
            href: '/dashboard/finance/search-expense',
            icon: Calculator,
            label: 'Expense Reports',
          },
        ],
      },
    ],

    teacher: [
      {
        title: 'Homework & Assignments',
        items: [
          {
            href: '/dashboard/homework/add',
            icon: Notebook,
            label: 'Add Homework',
          },
          {
            href: '/dashboard/homework/daily',
            icon: CalendarCheck,
            label: 'Track Submissions',
          },
        ],
      },
      {
        title: 'Lesson Planning',
        items: [
          {
            href: '/dashboard/lessonplan/lessons',
            icon: BookOpen,
            label: 'My Lessons',
          },
          {
            href: '/dashboard/lessonplan/topics',
            icon: Library,
            label: 'Topics',
          },
          {
            href: '/dashboard/lessonplan/copy-old',
            icon: Archive,
            label: 'Copy Old Lessons',
          },
        ],
      },
      {
        title: 'Communication',
        items: [
          {
            href: '/dashboard/communication/send-message',
            icon: MessageSquare,
            label: 'Send Messages',
          },
          {
            href: '/dashboard/communication/notice-board',
            icon: FileText,
            label: 'Notices',
          },
          {
            href: '/dashboard/communication/template-email',
            icon: Mail,
            label: 'Email Templates',
          },
        ],
      },
    ],

    student: [
      {
        title: 'Academic',
        items: [
          {
            href: '/dashboard/homework/daily',
            icon: Notebook,
            label: 'My Homework',
          },
        ],
      },
    ],

    parent: [
      {
        title: 'Children',
        items: [
          {
            href: '/dashboard/homework/daily',
            icon: Notebook,
            label: 'Homework Tracking',
          },
        ],
      },
    ],

    accountant: [
      {
        title: 'Finance Management',
        items: [
          {
            href: '/dashboard/finance/profit-loss',
            icon: BarChart3,
            label: 'Profit & Loss',
          },
          {
            href: '/dashboard/finance/add-income',
            icon: TrendingUp,
            label: 'Add Income',
          },
          {
            href: '/dashboard/finance/add-expense',
            icon: Calculator,
            label: 'Add Expense',
          },
          {
            href: '/dashboard/finance/search-income',
            icon: Archive,
            label: 'Income Reports',
          },
          {
            href: '/dashboard/finance/search-expense',
            icon: Archive,
            label: 'Expense Reports',
          },
          {
            href: '/dashboard/finance/income-head',
            icon: Layers,
            label: 'Income Heads',
          },
          {
            href: '/dashboard/finance/expense-head',
            icon: Layers,
            label: 'Expense Heads',
          },
        ],
      },
    ],
  }

  // Common items for all roles
  const allRolesItems = [
    {
      title: 'Tools',
      items: [
        { href: '/qr-attendance', icon: QrCode, label: 'QR Attendance' },
        { href: '/certificates', icon: FileCheck, label: 'Certificates' },
        { href: '/downloads', icon: FolderDown, label: 'Download Center' },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          href: '/settings/profile',
          icon: Settings,
          label: 'Profile Settings',
        },
        { href: '/settings/preferences', icon: Cog, label: 'Preferences' },
      ],
    },
  ]

  return [
    ...commonItems,
    ...(roleSpecificItems[userRole] || []),
    ...allRolesItems,
  ]
}
