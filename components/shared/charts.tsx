'use client'

import * as React from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Color palette for charts
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00ff00',
]

interface BaseChartProps {
  data: any[]
  height?: number
  className?: string
  title?: string
  description?: string
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
}

// Line Chart Component
interface LineChartProps extends BaseChartProps {
  xKey: string
  yKey: string
  strokeColor?: string
  strokeWidth?: number
  dot?: boolean
  smooth?: boolean
}

export function CustomLineChart({
  data,
  xKey,
  yKey,
  height = 300,
  className,
  title,
  description,
  strokeColor = CHART_COLORS[0],
  strokeWidth = 2,
  dot = true,
  smooth = false,
  showLegend = false,
  showGrid = true,
  showTooltip = true,
}: LineChartProps) {
  const ChartWrapper = title ? Card : 'div'
  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xKey} />
        <YAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        <Line
          type={smooth ? 'monotone' : 'linear'}
          dataKey={yKey}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          dot={dot}
        />
      </LineChart>
    </ResponsiveContainer>
  )

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{chartContent}</CardContent>
      </Card>
    )
  }

  return <div className={className}>{chartContent}</div>
}

// Bar Chart Component
interface BarChartProps extends BaseChartProps {
  xKey: string
  yKey: string
  fillColor?: string
  orientation?: 'vertical' | 'horizontal'
}

export function CustomBarChart({
  data,
  xKey,
  yKey,
  height = 300,
  className,
  title,
  description,
  fillColor = CHART_COLORS[0],
  orientation = 'vertical',
  showLegend = false,
  showGrid = true,
  showTooltip = true,
}: BarChartProps) {
  const ChartWrapper = title ? Card : 'div'
  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        {orientation === 'vertical' ? (
          <>
            <XAxis dataKey={xKey} />
            <YAxis />
          </>
        ) : (
          <>
            <XAxis type="number" />
            <YAxis dataKey={xKey} type="category" />
          </>
        )}
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        <Bar dataKey={yKey} fill={fillColor} />
      </BarChart>
    </ResponsiveContainer>
  )

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{chartContent}</CardContent>
      </Card>
    )
  }

  return <div className={className}>{chartContent}</div>
}

// Area Chart Component
interface AreaChartProps extends BaseChartProps {
  xKey: string
  yKey: string
  fillColor?: string
  strokeColor?: string
  smooth?: boolean
}

export function CustomAreaChart({
  data,
  xKey,
  yKey,
  height = 300,
  className,
  title,
  description,
  fillColor = CHART_COLORS[0],
  strokeColor = CHART_COLORS[0],
  smooth = true,
  showLegend = false,
  showGrid = true,
  showTooltip = true,
}: AreaChartProps) {
  const ChartWrapper = title ? Card : 'div'
  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xKey} />
        <YAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        <Area
          type={smooth ? 'monotone' : 'linear'}
          dataKey={yKey}
          stroke={strokeColor}
          fill={fillColor}
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  )

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{chartContent}</CardContent>
      </Card>
    )
  }

  return <div className={className}>{chartContent}</div>
}

// Pie Chart Component
interface PieChartProps extends BaseChartProps {
  dataKey: string
  nameKey: string
  innerRadius?: number
  outerRadius?: number
  colors?: string[]
}

export function CustomPieChart({
  data,
  dataKey,
  nameKey,
  height = 300,
  className,
  title,
  description,
  innerRadius = 0,
  outerRadius = 80,
  colors = CHART_COLORS,
  showLegend = true,
  showTooltip = true,
}: PieChartProps) {
  const ChartWrapper = title ? Card : 'div'
  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={5}
          dataKey={dataKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  )

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{chartContent}</CardContent>
      </Card>
    )
  }

  return <div className={className}>{chartContent}</div>
}

// Multi-series Line Chart
interface MultiLineChartProps extends BaseChartProps {
  xKey: string
  series: {
    key: string
    name: string
    color?: string
  }[]
}

export function MultiLineChart({
  data,
  xKey,
  series,
  height = 300,
  className,
  title,
  description,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
}: MultiLineChartProps) {
  const ChartWrapper = title ? Card : 'div'
  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xKey} />
        <YAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {series.map((s, index) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color || CHART_COLORS[index % CHART_COLORS.length]}
            name={s.name}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{chartContent}</CardContent>
      </Card>
    )
  }

  return <div className={className}>{chartContent}</div>
}

// Stacked Bar Chart
interface StackedBarChartProps extends BaseChartProps {
  xKey: string
  series: {
    key: string
    name: string
    color?: string
  }[]
}

export function StackedBarChart({
  data,
  xKey,
  series,
  height = 300,
  className,
  title,
  description,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
}: StackedBarChartProps) {
  const ChartWrapper = title ? Card : 'div'
  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xKey} />
        <YAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {series.map((s, index) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            stackId="a"
            fill={s.color || CHART_COLORS[index % CHART_COLORS.length]}
            name={s.name}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{chartContent}</CardContent>
      </Card>
    )
  }

  return <div className={className}>{chartContent}</div>
}

// Chart with Reference Line
interface ChartWithReferenceProps extends LineChartProps {
  referenceLine?: {
    value: number
    label?: string
    color?: string
  }
}

export function ChartWithReference({
  referenceLine,
  ...props
}: ChartWithReferenceProps) {
  const chartContent = (
    <ResponsiveContainer width="100%" height={props.height || 300}>
      <LineChart data={props.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {props.showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={props.xKey} />
        <YAxis />
        {props.showTooltip && <Tooltip />}
        {props.showLegend && <Legend />}
        <Line
          type="monotone"
          dataKey={props.yKey}
          stroke={props.strokeColor || CHART_COLORS[0]}
          strokeWidth={props.strokeWidth || 2}
          dot={props.dot}
        />
        {referenceLine && (
          <ReferenceLine
            y={referenceLine.value}
            stroke={referenceLine.color || '#ff0000'}
            strokeDasharray="5 5"
            label={referenceLine.label}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )

  if (props.title) {
    return (
      <Card className={props.className}>
        <CardHeader>
          <CardTitle>{props.title}</CardTitle>
          {props.description && <CardDescription>{props.description}</CardDescription>}
        </CardHeader>
        <CardContent>{chartContent}</CardContent>
      </Card>
    )
  }

  return <div className={props.className}>{chartContent}</div>
}