import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Settings as SettingsIcon,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Award,
  Target,
  Users,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { behaviourApi } from '../../lib/api/behaviour'

const CategoryCard = ({ category, onEdit, onDelete }) => {
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

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium">{category.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(category.defaultSeverity)}`}
          >
            {category.defaultSeverity.toUpperCase()}
          </span>
          <button
            onClick={() => onEdit(category)}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Points:</span>
          <span className="font-medium">{category.points}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Auto Actions:</span>
          <span className="text-xs text-gray-600">
            {category.autoActions?.length || 0} configured
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status:</span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              category.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {category.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  )
}

const CategoryDialog = ({ category, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    defaultSeverity: category?.defaultSeverity || 'medium',
    points: category?.points || 0,
    isActive: category?.isActive ?? true,
    autoActions: category?.autoActions || [],
  })

  const handleSave = () => {
    onSave(category?.id, formData)
    onClose()
  }

  const addAutoAction = () => {
    setFormData(prev => ({
      ...prev,
      autoActions: [
        ...prev.autoActions,
        { threshold: 0, action: '', description: '' },
      ],
    }))
  }

  const updateAutoAction = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      autoActions: Array.isArray(prev.autoActions)
        ? prev.autoActions.map((action, i) =>
            i === index ? { ...action, [field]: value } : action
          )
        : [],
    }))
  }

  const removeAutoAction = index => {
    setFormData(prev => ({
      ...prev,
      autoActions: prev.autoActions.filter((_, i) => i !== index),
    }))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Add Category'}
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Category Name *"
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Disruptive Behavior"
          />
          <div>
            <label className="block text-sm font-medium mb-1">
              Default Severity *
            </label>
            <select
              value={formData.defaultSeverity}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  defaultSeverity: e.target.value,
                }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={e =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Describe this category of behavior..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Points"
            type="number"
            value={formData.points}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                points: parseInt(e.target.value) || 0,
              }))
            }
            placeholder="0"
          />
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={e =>
                setFormData(prev => ({ ...prev, isActive: e.target.checked }))
              }
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Active
            </label>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Auto Actions</h3>
            <button
              onClick={addAutoAction}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Action
            </button>
          </div>

          {formData.autoActions.length === 0 ? (
            <p className="text-gray-500 text-sm">No auto actions configured</p>
          ) : (
            <div className="space-y-3">
              {Array.isArray(formData.autoActions) &&
                formData.autoActions.map((action, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        label="Threshold"
                        type="number"
                        value={action.threshold}
                        onChange={e =>
                          updateAutoAction(
                            index,
                            'threshold',
                            parseInt(e.target.value) || 0,
                          )
                        }
                        placeholder="Points threshold"
                        size="sm"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Action
                        </label>
                        <select
                          value={action.action}
                          onChange={e =>
                            updateAutoAction(index, 'action', e.target.value)
                          }
                          className="w-full border rounded px-3 py-1 text-sm"
                        >
                          <option value="">Select Action</option>
                          <option value="warning">Send Warning</option>
                          <option value="parent_notification">
                            Notify Parents
                          </option>
                          <option value="counselor_referral">
                            Counselor Referral
                          </option>
                          <option value="suspension">Suspension</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeAutoAction(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <Input
                      label="Description"
                      value={action.description}
                      onChange={e =>
                        updateAutoAction(index, 'description', e.target.value)
                      }
                      placeholder="Action description"
                      size="sm"
                      className="mt-2"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Category
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const PointsSystemSettings = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState({
    enablePoints: settings?.enablePoints ?? true,
    resetPeriod: settings?.resetPeriod || 'semester',
    warningThreshold: settings?.warningThreshold || 10,
    parentNotificationThreshold: settings?.parentNotificationThreshold || 20,
    counselorReferralThreshold: settings?.counselorReferralThreshold || 30,
    suspensionThreshold: settings?.suspensionThreshold || 50,
  })

  const handleSave = () => {
    onUpdate(formData)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium mb-4">Points System Settings</h2>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enablePoints"
            checked={formData.enablePoints}
            onChange={e =>
              setFormData(prev => ({ ...prev, enablePoints: e.target.checked }))
            }
            className="rounded"
          />
          <label htmlFor="enablePoints" className="font-medium">
            Enable Points System
          </label>
        </div>

        {formData.enablePoints && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Reset Period
              </label>
              <select
                value={formData.resetPeriod}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    resetPeriod: e.target.value,
                  }))
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semester">Semester</option>
                <option value="yearly">Yearly</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Warning Threshold"
                type="number"
                value={formData.warningThreshold}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    warningThreshold: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="Points for warning"
              />
              <Input
                label="Parent Notification Threshold"
                type="number"
                value={formData.parentNotificationThreshold}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    parentNotificationThreshold: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="Points for parent notification"
              />
              <Input
                label="Counselor Referral Threshold"
                type="number"
                value={formData.counselorReferralThreshold}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    counselorReferralThreshold: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="Points for counselor referral"
              />
              <Input
                label="Suspension Threshold"
                type="number"
                value={formData.suspensionThreshold}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    suspensionThreshold: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="Points for suspension"
              />
            </div>
          </>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('categories')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)

  const queryClient = useQueryClient()

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['behaviour', 'categories'],
    queryFn: () => behaviourApi.getCategories(),
  })

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['behaviour', 'settings'],
    queryFn: () => behaviourApi.getSettings(),
  })

  const saveCategoryMutation = useMutation({
    mutationFn: ({ id, data }) =>
      id
        ? behaviourApi.updateCategory(id, data)
        : behaviourApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['behaviour', 'categories'])
      setShowCategoryDialog(false)
      setSelectedCategory(null)
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: behaviourApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['behaviour', 'categories'])
    },
  })

  const updateSettingsMutation = useMutation({
    mutationFn: behaviourApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['behaviour', 'settings'])
    },
  })

  const handleEditCategory = category => {
    setSelectedCategory(category)
    setShowCategoryDialog(true)
  }

  const handleDeleteCategory = category => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteCategoryMutation.mutate(category.id)
    }
  }

  const handleSaveCategory = (id, data) => {
    saveCategoryMutation.mutate({ id, data })
  }

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setShowCategoryDialog(true)
  }

  const tabs = [
    { id: 'categories', label: 'Categories', icon: AlertTriangle },
    { id: 'points', label: 'Points System', icon: Award },
    { id: 'thresholds', label: 'Thresholds', icon: Target },
    { id: 'notifications', label: 'Notifications', icon: Users },
  ]

  if (categoriesLoading || settingsLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Behavior Settings</h1>
        {activeTab === 'categories' && (
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        )}
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
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-4">
                  Behavior Categories
                </h2>
                <p className="text-gray-600 mb-6">
                  Configure different categories of behavior incidents with
                  their default severity levels and point values.
                </p>
              </div>

              {categoriesData?.data?.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Categories
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create your first behavior category to get started.
                  </p>
                  <button
                    onClick={handleAddCategory}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Category
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.isArray(categoriesData?.data) &&
                    categoriesData.data.map(category => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <PointsSystemSettings
              settings={settingsData?.data?.pointsSystem}
              onUpdate={data =>
                updateSettingsMutation.mutate({ pointsSystem: data })
              }
            />
          )}

          {activeTab === 'thresholds' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Action Thresholds</h2>
                <p className="text-gray-600 mb-6">
                  Configure automatic actions based on accumulated behavior
                  points.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    Coming Soon
                  </span>
                </div>
                <p className="text-yellow-700 mt-1">
                  Advanced threshold configuration will be available in the next
                  update.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-4">
                  Notification Settings
                </h2>
                <p className="text-gray-600 mb-6">
                  Configure how and when notifications are sent to parents and
                  staff.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    Under Development
                  </span>
                </div>
                <p className="text-blue-700 mt-1">
                  Notification settings panel is currently being developed.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Dialog */}
      <CategoryDialog
        category={selectedCategory}
        open={showCategoryDialog}
        onClose={() => {
          setShowCategoryDialog(false)
          setSelectedCategory(null)
        }}
        onSave={handleSaveCategory}
      />
    </div>
  )
}

export default Settings
