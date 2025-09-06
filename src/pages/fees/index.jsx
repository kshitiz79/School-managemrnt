import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
  DollarSign,
  Settings,
  CreditCard,
  Search,
  AlertTriangle,
  Percent,
  ArrowRight,
  Mail,
  BarChart3,
} from 'lucide-react'
import FeesMaster from './FeesMaster'
import CollectFees from './CollectFees'
import SearchFeesPayment from './SearchFeesPayment'
import SearchDueFees from './SearchDueFees'
import FeesDiscount from './FeesDiscount'
import FeesCarryForward from './FeesCarryForward'
import FeesReminder from './FeesReminder'
import FeesReports from './FeesReports'

// Route wrapper component
const FeesRoutes = () => {
  return (
    <Routes>
      <Route index element={<FeesTabs />} />
      <Route path="master" element={<FeesMaster />} />
      <Route path="collect" element={<CollectFees />} />
      <Route path="payments" element={<SearchFeesPayment />} />
      <Route path="dues" element={<SearchDueFees />} />
      <Route path="discounts" element={<FeesDiscount />} />
      <Route path="carry-forward" element={<FeesCarryForward />} />
      <Route path="reminders" element={<FeesReminder />} />
      <Route path="reports" element={<FeesReports />} />
    </Routes>
  )
}

const FeesTabs = () => {
  const [activeTab, setActiveTab] = useState('master')

  const tabs = [
    {
      id: 'master',
      label: 'Fees Master',
      icon: Settings,
      component: FeesMaster,
      description: 'Manage fee groups, types, and concessions',
    },
    {
      id: 'collect',
      label: 'Collect Fees',
      icon: CreditCard,
      component: CollectFees,
      description: 'POS-like interface for fee collection',
    },
    {
      id: 'payments',
      label: 'Search Payments',
      icon: Search,
      component: SearchFeesPayment,
      description: 'Search and view payment history',
    },
    {
      id: 'dues',
      label: 'Due Fees',
      icon: AlertTriangle,
      component: SearchDueFees,
      description: 'Search and manage due fees',
    },
    {
      id: 'discounts',
      label: 'Discounts',
      icon: Percent,
      component: FeesDiscount,
      description: 'Manage fee discounts and concessions',
    },
    {
      id: 'carry-forward',
      label: 'Carry Forward',
      icon: ArrowRight,
      component: FeesCarryForward,
      description: 'Handle fee carry forward between academic years',
    },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: Mail,
      component: FeesReminder,
      description: 'SMS/Email/WhatsApp reminder templates and scheduler',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      component: FeesReports,
      description: 'Comprehensive reports dashboard with analytics',
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

        {/* Tab Description */}
        <div className="px-6 py-3 bg-gray-50">
          <p className="text-sm text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      <div>{ActiveComponent && <ActiveComponent />}</div>
    </div>
  )
}

export default FeesRoutes
