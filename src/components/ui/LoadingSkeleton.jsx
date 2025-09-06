import React from 'react'
import { cn } from '../../lib/utils'

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

const LoadingSkeleton = {
  // Basic skeleton
  Base: Skeleton,

  // Text skeletons
  Text: ({ lines = 1, className, ...props }) => (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full',
          )}
        />
      ))}
    </div>
  ),

  // Card skeleton
  Card: ({ className, ...props }) => (
    <div className={cn('rounded-lg border bg-card p-6', className)} {...props}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  ),

  // Table skeleton
  Table: ({ rows = 5, columns = 4, className, ...props }) => (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="rounded-lg border">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex space-x-4">
                {Array.from({ length: columns }).map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  // KPI Card skeleton
  KpiCard: ({ className, ...props }) => (
    <div className={cn('rounded-lg border bg-card p-6', className)} {...props}>
      <div className="flex items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  ),

  // Dashboard skeleton
  Dashboard: ({ className, ...props }) => (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton.KpiCard key={i} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton.Card key={i} />
        ))}
      </div>
    </div>
  ),

  // Form skeleton
  Form: ({ fields = 4, className, ...props }) => (
    <div className={cn('space-y-6', className)} {...props}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  ),

  // List skeleton
  List: ({ items = 5, className, ...props }) => (
    <div className={cn('space-y-3', className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ),

  // Avatar skeleton
  Avatar: ({ className, ...props }) => (
    <Skeleton className={cn('h-10 w-10 rounded-full', className)} {...props} />
  ),

  // Button skeleton
  Button: ({ className, ...props }) => (
    <Skeleton className={cn('h-9 w-20', className)} {...props} />
  ),

  // Chart skeleton
  Chart: ({ className, ...props }) => (
    <div className={cn('rounded-lg border bg-card p-6', className)} {...props}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  ),
}

export default LoadingSkeleton
