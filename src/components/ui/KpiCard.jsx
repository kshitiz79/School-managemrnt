import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

const KpiCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
  trend,
  className,
  onClick,
  ...props
}) => {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'positive':
        return TrendingUp
      case 'negative':
        return TrendingDown
      default:
        return Minus
    }
  }

  const getTrendColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 dark:text-green-400'
      case 'negative':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const TrendIcon = getTrendIcon()

  return (
    <div
      className={cn(
        'kpi-card',
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="kpi-card-header">
        <h3 className="kpi-card-title">{title}</h3>
        {Icon && <Icon className="kpi-card-icon" />}
      </div>

      <div className="kpi-card-content">
        <div className="kpi-card-value">{value}</div>

        {(change || trend) && (
          <div className="flex items-center space-x-1">
            {change && (
              <>
                <TrendIcon className={cn('h-3 w-3', getTrendColor())} />
                <span className={cn('text-xs font-medium', getTrendColor())}>
                  {change}
                </span>
              </>
            )}
            {description && (
              <span className="kpi-card-change">{description}</span>
            )}
          </div>
        )}

        {trend && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Trend</span>
              <span>{trend.period}</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  changeType === 'positive' && 'bg-green-500',
                  changeType === 'negative' && 'bg-red-500',
                  changeType === 'neutral' && 'bg-blue-500'
                )}
                style={{
                  width: `${Math.min(Math.abs(trend.percentage || 0), 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
        <div
          className={cn(
            'w-full h-full rounded-full',
            changeType === 'positive' && 'bg-green-500',
            changeType === 'negative' && 'bg-red-500',
            changeType === 'neutral' && 'bg-blue-500'
          )}
        />
      </div>
    </div>
  )
}

// Preset KPI Card variants
const KpiCardVariants = {
  Revenue: ({ value, change, ...props }) => (
    <KpiCard
      title="Revenue"
      value={`$${value?.toLocaleString() || '0'}`}
      change={change}
      changeType={
        change?.startsWith('+')
          ? 'positive'
          : change?.startsWith('-')
            ? 'negative'
            : 'neutral'
      }
      description="this month"
      {...props}
    />
  ),

  Users: ({ value, change, ...props }) => (
    <KpiCard
      title="Total Users"
      value={value?.toLocaleString() || '0'}
      change={change}
      changeType={
        change?.startsWith('+')
          ? 'positive'
          : change?.startsWith('-')
            ? 'negative'
            : 'neutral'
      }
      description="active users"
      {...props}
    />
  ),

  Conversion: ({ value, change, ...props }) => (
    <KpiCard
      title="Conversion Rate"
      value={`${value || 0}%`}
      change={change}
      changeType={
        change?.startsWith('+')
          ? 'positive'
          : change?.startsWith('-')
            ? 'negative'
            : 'neutral'
      }
      description="this week"
      {...props}
    />
  ),

  Attendance: ({ value, change, ...props }) => (
    <KpiCard
      title="Attendance"
      value={`${value || 0}%`}
      change={change}
      changeType={
        value >= 75 ? 'positive' : value >= 50 ? 'neutral' : 'negative'
      }
      description="this month"
      {...props}
    />
  ),
}

export default KpiCard
export { KpiCardVariants }
