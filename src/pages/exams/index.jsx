import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  BarChart3,
  Layout,
  Printer,
  FileText,
  CreditCard,
} from 'lucide-react'
import ExamGroup from './ExamGroup'
import ExamSchedule from './ExamSchedule'
import ExamResult from './ExamResult'
import DesignAdmitCard from './DesignAdmitCard'
import PrintAdmitCard from './PrintAdmitCard'
import DesignMarksheet from './DesignMarksheet'
import PrintMarksheet from './PrintMarksheet'

// Route wrapper component
const ExamsRoutes = () => {
  return (
    <Routes>
      <Route index element={<ExamTabs />} />
      <Route path="groups" element={<ExamGroup />} />
      <Route path="schedule" element={<ExamSchedule />} />
      <Route path="results" element={<ExamResult />} />
      <Route path="design-admit" element={<DesignAdmitCard />} />
      <Route path="print-admit" element={<PrintAdmitCard />} />
      <Route path="design-marksheet" element={<DesignMarksheet />} />
      <Route path="print-marksheet" element={<PrintMarksheet />} />
    </Routes>
  )
}

const ExamTabs = () => {
  const [activeTab, setActiveTab] = useState('groups')

  const tabs = [
    {
      id: 'groups',
      label: 'Exam Groups',
      icon: BookOpen,
      component: ExamGroup,
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      component: ExamSchedule,
    },
    {
      id: 'results',
      label: 'Results',
      icon: BarChart3,
      component: ExamResult,
    },
    {
      id: 'design-admit',
      label: 'Design Admit Card',
      icon: Layout,
      component: DesignAdmitCard,
    },
    {
      id: 'print-admit',
      label: 'Print Admit Card',
      icon: Printer,
      component: PrintAdmitCard,
    },
    {
      id: 'design-marksheet',
      label: 'Design Marksheet',
      icon: FileText,
      component: DesignMarksheet,
    },
    {
      id: 'print-marksheet',
      label: 'Print Marksheet',
      icon: CreditCard,
      component: PrintMarksheet,
    },
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {Array.isArray(tabs) &&
              tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>{ActiveComponent && <ActiveComponent />}</div>
    </div>
  )
}

export default ExamsRoutes
