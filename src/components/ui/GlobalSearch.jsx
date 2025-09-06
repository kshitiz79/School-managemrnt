import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  X,
  User,
  Users,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Dialog, DialogContent } from './Dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'
import Badge from './Badge'
import { students, staff, notices } from '../../lib/mockData'

const GlobalSearch = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({
    students: [],
    staff: [],
    notices: [],
  })
  const [activeTab, setActiveTab] = useState('all')
  const [recentSearches, setRecentSearches] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    if (query.length < 2) {
      setResults({ students: [], staff: [], notices: [] })
      return
    }

    const searchQuery = query.toLowerCase()

    const filteredStudents = students
      .filter(
        student =>
          student.name.toLowerCase().includes(searchQuery) ||
          student.rollNumber.toLowerCase().includes(searchQuery) ||
          student.email.toLowerCase().includes(searchQuery) ||
          student.admissionNumber.toLowerCase().includes(searchQuery)
      )
      .slice(0, 5)

    const filteredStaff = staff
      .filter(
        member =>
          member.name.toLowerCase().includes(searchQuery) ||
          member.employeeId.toLowerCase().includes(searchQuery) ||
          member.email.toLowerCase().includes(searchQuery) ||
          member.department.toLowerCase().includes(searchQuery) ||
          member.role.toLowerCase().includes(searchQuery)
      )
      .slice(0, 5)

    const filteredNotices = notices
      .filter(
        notice =>
          notice.title.toLowerCase().includes(searchQuery) ||
          notice.content.toLowerCase().includes(searchQuery)
      )
      .slice(0, 5)

    setResults({
      students: filteredStudents,
      staff: filteredStaff,
      notices: filteredNotices,
    })
  }, [query])

  const handleClose = () => {
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)])
    }
    setQuery('')
    setResults({ students: [], staff: [], notices: [] })
    setActiveTab('all')
    onOpenChange(false)
  }

  const handleRecentSearch = searchTerm => {
    setQuery(searchTerm)
  }

  const getFilteredResults = () => {
    if (activeTab === 'all') {
      return [
        ...results.students.map(item => ({ ...item, type: 'student' })),
        ...results.staff.map(item => ({ ...item, type: 'staff' })),
        ...results.notices.map(item => ({ ...item, type: 'notice' })),
      ]
    }
    return (
      results[activeTab]?.map(item => ({
        ...item,
        type: activeTab.slice(0, -1),
      })) || []
    )
  }

  const getIcon = type => {
    switch (type) {
      case 'student':
        return User
      case 'staff':
        return Users
      case 'notice':
        return FileText
      default:
        return Search
    }
  }

  const getTypeColor = type => {
    switch (type) {
      case 'student':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'staff':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'notice':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const totalResults =
    results.students.length + results.staff.length + results.notices.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        {/* Search Header */}
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search students, staff, notices..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex items-center space-x-2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              ESC
            </kbd>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-muted rounded-sm"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Search Content */}
        <div className="max-h-96 overflow-y-auto">
          {query.length === 0 ? (
            /* Recent Searches & Quick Actions */
            <div className="p-4 space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Recent Searches
                  </h3>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearch(search)}
                        className="flex items-center w-full p-2 text-left hover:bg-muted rounded-md transition-colors"
                      >
                        <Search className="h-4 w-4 text-muted-foreground mr-3" />
                        <span className="text-sm text-foreground">
                          {search}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center p-3 text-left hover:bg-muted rounded-md transition-colors">
                    <User className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Students
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Browse all students
                      </div>
                    </div>
                  </button>
                  <button className="flex items-center p-3 text-left hover:bg-muted rounded-md transition-colors">
                    <Users className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Staff
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Browse all staff
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : query.length < 2 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>Type at least 2 characters to search</p>
            </div>
          ) : (
            <>
              {/* Search Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="border-b border-border px-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all" className="text-xs">
                      All ({totalResults})
                    </TabsTrigger>
                    <TabsTrigger value="students" className="text-xs">
                      Students ({results.students.length})
                    </TabsTrigger>
                    <TabsTrigger value="staff" className="text-xs">
                      Staff ({results.staff.length})
                    </TabsTrigger>
                    <TabsTrigger value="notices" className="text-xs">
                      Notices ({results.notices.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Search Results */}
                <div className="p-2">
                  {getFilteredResults().length > 0 ? (
                    <div className="space-y-1">
                      {getFilteredResults().map((item, index) => {
                        const Icon = getIcon(item.type)
                        return (
                          <button
                            key={`${item.type}-${item.id}-${index}`}
                            className="flex items-center w-full p-3 hover:bg-muted rounded-md cursor-pointer transition-colors group"
                            onClick={handleClose}
                          >
                            <div className="flex-shrink-0 mr-3">
                              <div
                                className={cn(
                                  'p-2 rounded-full',
                                  getTypeColor(item.type)
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-medium text-foreground truncate">
                                {item.name || item.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.type === 'student' &&
                                  `${item.rollNumber} • Class ${item.classId} • ${item.section}`}
                                {item.type === 'staff' &&
                                  `${item.department} • ${item.role} • ${item.employeeId}`}
                                {item.type === 'notice' &&
                                  `${item.content.substring(0, 60)}...`}
                              </p>
                            </div>
                            <div className="flex-shrink-0 flex items-center space-x-2">
                              <Badge variant="outline" size="sm">
                                {item.type}
                              </Badge>
                              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No results found for "{query}"</p>
                      <p className="text-xs mt-1">
                        Try adjusting your search terms
                      </p>
                    </div>
                  )}
                </div>
              </Tabs>
            </>
          )}
        </div>

        {/* Search Footer */}
        <div className="border-t border-border px-4 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                ↑↓
              </kbd>
              <span>Navigate</span>
              <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                ↵
              </kbd>
              <span>Select</span>
            </div>
            <div>
              Press{' '}
              <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                ESC
              </kbd>{' '}
              to close
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GlobalSearch
