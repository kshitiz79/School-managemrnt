import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { cn } from '../../lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './Card'

const TrendChart = ({
  title,
  description,
  data = [],
  type = 'line',
  dataKey = 'value',
  nameKey = 'name',
  color = '#3b82f6',
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  height = 300,
  showGrid = true,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  formatTooltip,
  formatXAxis,
  formatYAxis,
  className,
  ...props
}) => {
  const renderChart = () => {
    const commonProps = {
      data,
      height,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    }

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            )}
            {showXAxis && (
              <XAxis
                dataKey={nameKey}
                tickFormatter={formatXAxis}
                className="text-xs fill-muted-foreground"
              />
            )}
            {showYAxis && (
              <YAxis
                tickFormatter={formatYAxis}
                className="text-xs fill-muted-foreground"
              />
            )}
            {showTooltip && (
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            )}
            {showXAxis && (
              <XAxis
                dataKey={nameKey}
                tickFormatter={formatXAxis}
                className="text-xs fill-muted-foreground"
              />
            )}
            {showYAxis && (
              <YAxis
                tickFormatter={formatYAxis}
                className="text-xs fill-muted-foreground"
              />
            )}
            {showTooltip && (
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
            )}
            <Bar dataKey={dataKey} fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart {...commonProps}>
            {showTooltip && (
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
            )}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
          </PieChart>
        )

      default: // line
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            )}
            {showXAxis && (
              <XAxis
                dataKey={nameKey}
                tickFormatter={formatXAxis}
                className="text-xs fill-muted-foreground"
              />
            )}
            {showYAxis && (
              <YAxis
                tickFormatter={formatYAxis}
                className="text-xs fill-muted-foreground"
              />
            )}
            {showTooltip && (
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        )
    }
  }

  return (
    <Card className={cn('w-full', className)} {...props}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Preset chart components
const ChartVariants = {
  Revenue: ({ data, ...props }) => (
    <TrendChart
      title="Revenue Trend"
      description="Monthly revenue over time"
      data={data}
      type="area"
      color="#10b981"
      formatTooltip={value => [`$${value.toLocaleString()}`, 'Revenue']}
      {...props}
    />
  ),

  Users: ({ data, ...props }) => (
    <TrendChart
      title="User Growth"
      description="Active users over time"
      data={data}
      type="line"
      color="#3b82f6"
      formatTooltip={value => [value.toLocaleString(), 'Users']}
      {...props}
    />
  ),

  Attendance: ({ data, ...props }) => (
    <TrendChart
      title="Attendance Rate"
      description="Daily attendance percentage"
      data={data}
      type="bar"
      color="#f59e0b"
      formatTooltip={value => [`${value}%`, 'Attendance']}
      {...props}
    />
  ),

  Performance: ({ data, ...props }) => (
    <TrendChart
      title="Performance Distribution"
      description="Grade distribution"
      data={data}
      type="pie"
      colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444']}
      {...props}
    />
  ),
}

export default TrendChart
export { ChartVariants }
