# AI-Powered School Management System

A comprehensive school management system built with React, featuring role-based dashboards for administrators, principals, teachers, students, parents, and accountants.

## ✨ Features

### Core Features
- **Multi-Role Dashboard System**: Tailored interfaces for different user roles
- **Student Management**: Complete student lifecycle management
- **Academic Management**: Classes, subjects, homework, and exam management
- **Financial Management**: Fee structure, payments, and financial reporting
- **Attendance Tracking**: Digital attendance system for students and staff
- **Notice Board**: Centralized communication system

### New Features ⭐
- **🔍 Global Search**: Search across students, staff, and notices from anywhere
- **🔔 Notifications Panel**: Real-time notifications with priority levels
- **📊 Export Functionality**: Export tables to CSV/PDF format
- **📱 Responsive Design**: Fully responsive layouts for all devices
- **🌙 Dark Mode**: Toggle between light and dark themes
- **⚡ Enhanced Performance**: Optimized with React Query and modern patterns

## 🛠 Tech Stack

- **Frontend**: React 18, React Router DOM
- **Styling**: Tailwind CSS 4.x with dark mode support
- **State Management**: Zustand, React Query (TanStack Query)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite
- **Code Quality**: ESLint with React Hooks rules, Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd ai-powered-school-management
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser and navigate to `http://localhost:5173`**

## 🎭 Mock Login Credentials

The system includes mock authentication for testing different roles. Use these credentials to explore different dashboards:

### 👨‍💼 Admin
- **Email**: `admin@school.edu`
- **Password**: `admin123`
- **Features**: User management, system settings, reports, school management

### 🏫 Principal
- **Email**: `principal@school.edu`
- **Password**: `principal123`
- **Features**: Teacher management, student oversight, class management, school reports

### 👩‍🏫 Teacher
- **Email**: `teacher@school.edu`
- **Password**: `teacher123`
- **Features**: Class management, student grades, assignments, attendance marking

### 🎓 Student
- **Email**: `student@school.edu`
- **Password**: `student123`
- **Features**: View grades, assignments, attendance, fee payments, class schedule

### 👨‍👩‍👧‍👦 Parent
- **Email**: `parent@school.edu`
- **Password**: `parent123`
- **Features**: Child's progress, fee payments, teacher communication, events

### 💰 Accountant
- **Email**: `accountant@school.edu`
- **Password**: `accountant123`
- **Features**: Fee management, payment tracking, financial reports, budgets

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with React Hooks rules
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   │   ├── GlobalSearch.jsx      # Global search functionality
│   │   ├── NotificationPanel.jsx # Notifications system
│   │   ├── ExportButton.jsx      # CSV/PDF export
│   │   ├── DarkModeToggle.jsx    # Theme switcher
│   │   └── ...
│   ├── AppLayout.jsx   # Main application layout
│   └── ...
├── pages/              # Page components
│   ├── dashboard/      # Role-specific dashboards
│   ├── admin/          # Admin pages
│   ├── teacher/        # Teacher pages
│   └── ...
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utilities and configurations
│   ├── mockData.js     # Mock data for development
│   └── ...
├── guards/             # Route guards
├── utils/              # Helper functions
└── constants/          # Application constants
```

## 🎯 Role-Based Access

The system supports six different user roles with specific permissions:

### 1. **Admin** 👨‍💼
- System administration and configuration
- User management across all roles
- School-wide settings and policies
- System reports and analytics

### 2. **Principal** 🏫
- School-wide management and oversight
- Teacher and staff management
- Student enrollment and transfers
- Academic policy decisions

### 3. **Teacher** 👩‍🏫
- Class and subject management
- Student assessment and grading
- Assignment creation and tracking
- Attendance marking

### 4. **Student** 🎓
- Academic progress tracking
- Assignment submissions
- Fee payment status
- Class schedules and notices

### 5. **Parent** 👨‍👩‍👧‍👦
- Child's academic monitoring
- Fee payment management
- Teacher communication
- Event notifications

### 6. **Accountant** 💰
- Financial management and reporting
- Fee structure management
- Payment tracking and reconciliation
- Budget planning and analysis

## 🔧 Key Features Guide

### Global Search
- Press `Ctrl/Cmd + K` or click the search icon
- Search across students, staff, and notices
- Filter results by category
- Real-time search with instant results

### Notifications
- Click the bell icon to view notifications
- Filter by unread or priority
- Mark individual or all as read
- Real-time updates for important events

### Export Functionality
- Available on all data tables
- Export to CSV or PDF format
- Maintains data formatting and structure
- Includes metadata and timestamps

### Dark Mode
- Toggle using the moon/sun icon
- Persists across browser sessions
- Optimized for all components
- Reduces eye strain in low-light conditions

### Responsive Design
- Mobile-first approach
- Optimized for tablets and desktops
- Touch-friendly interface
- Adaptive layouts for all screen sizes

## 🧪 Development Guidelines

### Code Quality
- ESLint configured with React Hooks rules
- Prettier for consistent formatting
- TypeScript-ready structure
- Component-based architecture

### Best Practices
- Use custom hooks for data fetching
- Implement proper error boundaries
- Follow accessibility guidelines
- Optimize for performance

### Testing
- Mock data provided for development
- Role-based testing scenarios
- Responsive design testing
- Cross-browser compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Run linting and formatting (`npm run lint:fix && npm run format`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce the problem
4. Provide browser and system information

---

**Happy Coding! 🚀**# School-managemrnt
