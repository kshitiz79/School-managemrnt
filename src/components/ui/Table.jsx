import React, { useState, useMemo } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from './Button'
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from './Dropdown'

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table ref={ref} className={cn('table', className)} {...props} />
  </div>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('table-header', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('table-body', className)} {...props} />
))
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn('table-footer', className)} {...props} />
))
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('table-row', className)} {...props} />
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th ref={ref} className={cn('table-head', className)} {...props} />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('table-cell', className)} {...props} />
))
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('table-caption', className)} {...props} />
))
TableCaption.displayName = 'TableCaption'

// Sortable Table Head Component
const SortableTableHead = ({
  children,
  sortKey,
  currentSort,
  onSort,
  className,
  ...props
}) => {
  const isSorted = currentSort?.key === sortKey
  const isAsc = isSorted && currentSort?.direction === 'asc'
  const isDesc = isSorted && currentSort?.direction === 'desc'

  const handleSort = () => {
    if (!onSort || !sortKey) return

    let direction = 'asc'
    if (isSorted) {
      direction = isAsc ? 'desc' : 'asc'
    }

    onSort({ key: sortKey, direction })
  }

  return (
    <TableHead
      className={cn(
        sortKey && onSort && 'cursor-pointer select-none hover:bg-muted/50',
        className,
      )}
      onClick={handleSort}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <span>{children}</span>
        {sortKey && onSort && (
          <div className="flex flex-col">
            <ChevronUp
              className={cn(
                'h-3 w-3',
                isAsc ? 'text-primary' : 'text-muted-foreground',
              )}
            />
            <ChevronDown
              className={cn(
                'h-3 w-3 -mt-1',
                isDesc ? 'text-primary' : 'text-muted-foreground',
              )}
            />
          </div>
        )}
      </div>
    </TableHead>
  )
}

// Pagination Component
const TablePagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots.filter(
      (page, index, array) => array.indexOf(page) === index
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 px-2 py-4',
        className,
      )}
    >
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>
          Showing {startItem} to {endItem} of {totalItems} results
        </span>
        {onItemsPerPageChange && (
          <div className="flex items-center space-x-2 ml-4">
            <label htmlFor="items-per-page" className="text-sm">
              Show:
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={e => onItemsPerPageChange(Number(e.target.value))}
              className="h-8 w-16 rounded border border-input bg-background px-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-1 text-muted-foreground">...</span>
            ) : (
              <Button
                variant={currentPage === page ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Complete Sortable and Paginated Table Component
const DataTable = ({
  data = [],
  columns = [],
  sortable = true,
  paginated = true,
  exportable = false,
  exportFilename = 'data',
  initialSort = null,
  initialItemsPerPage = 10,
  className,
  emptyMessage = 'No data available',
  loading = false,
  title,
  actions,
  onRowClick,
  rowActions,
  ...props
}) => {
  const [sort, setSort] = useState(initialSort)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  const sortedData = useMemo(() => {
    if (!sort || !sortable) return data

    return [...data].sort((a, b) => {
      const aValue = a[sort.key]
      const bValue = b[sort.key]

      if (aValue === bValue) return 0

      const comparison = aValue < bValue ? -1 : 1
      return sort.direction === 'asc' ? comparison : -comparison
    })
  }, [data, sort, sortable])

  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData

    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage, paginated])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = newSort => {
    setSort(newSort)
    setCurrentPage(1) // Reset to first page when sorting
  }

  const handlePageChange = page => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = newItemsPerPage => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Prepare export data
  const exportData = useMemo(() => {
    return sortedData.map(row => {
      const exportRow = {}
      columns.forEach(column => {
        if (column.exportKey) {
          exportRow[column.exportKey] = row[column.key]
        } else if (!column.render) {
          exportRow[column.header] = row[column.key]
        }
      })
      return exportRow
    })
  }, [sortedData, columns])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-muted/50 rounded mb-2"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Table Header with Title and Actions */}
      {(title || exportable || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          <div className="flex items-center space-x-2">
            {actions}
            {exportable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Export functionality would be implemented here
                  console.log('Export data:', exportData)
                }}
              >
                Export
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <SortableTableHead
                  key={column.key}
                  sortKey={sortable ? column.sortKey || column.key : null}
                  currentSort={sort}
                  onSort={sortable ? handleSort : null}
                  className={column.headerClassName}
                >
                  {column.header}
                </SortableTableHead>
              ))}
              {rowActions && (
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  className={onRowClick ? 'cursor-pointer' : ''}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(column => (
                    <TableCell
                      key={column.key}
                      className={column.cellClassName}
                    >
                      {column.render
                        ? column.render(row[column.key], row, index)
                        : row[column.key]}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownTrigger>
                        <DropdownContent align="end">
                          {rowActions.map((action, actionIndex) => (
                            <DropdownItem
                              key={actionIndex}
                              onClick={() => action.onClick(row)}
                            >
                              {action.icon && (
                                <action.icon className="mr-2 h-4 w-4" />
                              )}
                              {action.label}
                            </DropdownItem>
                          ))}
                        </DropdownContent>
                      </Dropdown>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {paginated && sortedData.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </div>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  SortableTableHead,
  TablePagination,
  DataTable,
}
