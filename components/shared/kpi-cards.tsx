'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface KPICardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    label?: string
    period?: string
  }
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = 'default',
}: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    
    if (trend.value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (trend.value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground'
    
    if (trend.value > 0) {
      return 'text-green-600'
    } else if (trend.value < 0) {
      return 'text-red-600'
    } else {
      return 'text-muted-foreground'
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
      case 'destructive':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
      default:
        return ''
    }
  }

  return (
    <Card className={cn(getVariantStyles(), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center justify-between mt-2">
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className={cn('flex items-center text-xs', getTrendColor())}>
                {getTrendIcon()}
                <span className="ml-1">
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                  {trend.label && ` ${trend.label}`}
                  {trend.period && ` ${trend.period}`}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Progress KPI Card
interface ProgressKPICardProps {
  title: string
  value: number
  max: number
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  showPercentage?: boolean
  color?: 'default' | 'success' | 'warning' | 'destructive'
}

export function ProgressKPICard({
  title,
  value,
  max,
  description,
  icon: Icon,
  className,
  showPercentage = true,
  color = 'default',
}: ProgressKPICardProps) {
  const percentage = Math.round((value / max) * 100)
  
  const getProgressColor = () => {
    switch (color) {
      case 'success':
        return 'bg-green-600'
      case 'warning':
        return 'bg-yellow-600'
      case 'destructive':
        return 'bg-red-600'
      default:
        return 'bg-primary'
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {showPercentage && <span className="text-sm text-muted-foreground ml-1">/ {max}</span>}
        </div>
        <div className="mt-2">
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{percentage}%</span>
            {description && <span>{description}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Comparison KPI Card
interface ComparisonKPICardProps {
  title: string
  current: {
    value: string | number
    label: string
  }
  previous: {
    value: string | number
    label: string
  }
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function ComparisonKPICard({
  title,
  current,
  previous,
  icon: Icon,
  className,
}: ComparisonKPICardProps) {
  const currentNum = typeof current.value === 'string' ? parseFloat(current.value) : current.value
  const previousNum = typeof previous.value === 'string' ? parseFloat(previous.value) : previous.value
  
  const change = currentNum - previousNum
  const changePercent = previousNum !== 0 ? (change / previousNum) * 100 : 0

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{current.value}</div>
              <p className="text-xs text-muted-foreground">{current.label}</p>
            </div>
            <div className="text-right">
              <div className={cn(
                'flex items-center text-sm font-medium',
                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground'
              )}>
                {change > 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : change < 0 ? (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                ) : null}
                {change > 0 ? '+' : ''}{changePercent.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">{previous.label}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Multi-value KPI Card
interface MultiValueKPICardProps {
  title: string
  values: {
    label: string
    value: string | number
    color?: string
  }[]
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function MultiValueKPICard({
  title,
  values,
  icon: Icon,
  className,
}: MultiValueKPICardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {values.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span 
                className="text-sm font-medium"
                style={{ color: item.color }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Status KPI Card
interface StatusKPICardProps {
  title: string
  status: 'online' | 'offline' | 'warning' | 'error'
  value?: string | number
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function StatusKPICard({
  title,
  status,
  value,
  description,
  icon: Icon,
  className,
}: StatusKPICardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      case 'offline':
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'warning':
        return 'Warning'
      case 'error':
        return 'Error'
      case 'offline':
      default:
        return 'Offline'
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className={cn('h-2 w-2 rounded-full', getStatusColor())} />
          <Badge variant="outline">{getStatusText()}</Badge>
        </div>
        {value && (
          <div className="text-2xl font-bold mt-2">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// KPI Grid Layout
interface KPIGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function KPIGrid({
  children,
  columns = 4,
  gap = 'md',
  className,
}: KPIGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  )
}