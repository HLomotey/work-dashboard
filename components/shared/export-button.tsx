'use client'

import * as React from 'react'
import { Download, FileText, FileSpreadsheet, Image, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json' | 'png' | 'jpeg'

interface ExportOption {
  format: ExportFormat
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

interface ExportButtonProps {
  data?: any[]
  filename?: string
  onExport?: (format: ExportFormat, data?: any[]) => Promise<void> | void
  formats?: ExportFormat[]
  disabled?: boolean
  loading?: boolean
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const DEFAULT_EXPORT_OPTIONS: Record<ExportFormat, ExportOption> = {
  csv: {
    format: 'csv',
    label: 'CSV',
    icon: FileText,
    description: 'Comma-separated values',
  },
  excel: {
    format: 'excel',
    label: 'Excel',
    icon: FileSpreadsheet,
    description: 'Microsoft Excel format',
  },
  pdf: {
    format: 'pdf',
    label: 'PDF',
    icon: FileText,
    description: 'Portable Document Format',
  },
  json: {
    format: 'json',
    label: 'JSON',
    icon: FileText,
    description: 'JavaScript Object Notation',
  },
  png: {
    format: 'png',
    label: 'PNG',
    icon: Image,
    description: 'Portable Network Graphics',
  },
  jpeg: {
    format: 'jpeg',
    label: 'JPEG',
    icon: Image,
    description: 'Joint Photographic Experts Group',
  },
}

export function ExportButton({
  data,
  filename = 'export',
  onExport,
  formats = ['csv', 'excel', 'pdf'],
  disabled = false,
  loading = false,
  className,
  variant = 'outline',
  size = 'sm',
  showLabel = true,
}: ExportButtonProps) {
  const [exportingFormat, setExportingFormat] = React.useState<ExportFormat | null>(null)

  const handleExport = async (format: ExportFormat) => {
    if (!onExport) {
      // Default export behavior
      await defaultExport(format, data, filename)
      return
    }

    setExportingFormat(format)
    try {
      await onExport(format, data)
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed. Please try again.')
    } finally {
      setExportingFormat(null)
    }
  }

  const exportOptions = formats.map(format => DEFAULT_EXPORT_OPTIONS[format])

  // Single format - render as button
  if (formats.length === 1) {
    const option = exportOptions[0]
    const isLoading = loading || exportingFormat === option.format

    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => handleExport(option.format)}
        disabled={disabled || isLoading}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <option.icon className="mr-2 h-4 w-4" />
        )}
        {showLabel && (isLoading ? 'Exporting...' : `Export ${option.label}`)}
      </Button>
    )
  }

  // Multiple formats - render as dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || loading}
          className={className}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {showLabel && (loading ? 'Exporting...' : 'Export')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {exportOptions.map((option) => {
          const isLoading = exportingFormat === option.format

          return (
            <DropdownMenuItem
              key={option.format}
              onClick={() => handleExport(option.format)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <option.icon className="mr-2 h-4 w-4" />
              )}
              <div className="flex flex-col">
                <span>{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Default export implementations
async function defaultExport(format: ExportFormat, data: any[] = [], filename: string) {
  try {
    switch (format) {
      case 'csv':
        await exportToCSV(data, filename)
        break
      case 'json':
        await exportToJSON(data, filename)
        break
      case 'excel':
        toast.error('Excel export requires custom implementation')
        break
      case 'pdf':
        toast.error('PDF export requires custom implementation')
        break
      case 'png':
      case 'jpeg':
        toast.error('Image export requires custom implementation')
        break
      default:
        toast.error(`Export format ${format} not supported`)
    }
  } catch (error) {
    console.error('Export failed:', error)
    toast.error('Export failed. Please try again.')
  }
}

// CSV Export
function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    toast.error('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  toast.success('CSV exported successfully')
}

// JSON Export
function exportToJSON(data: any[], filename: string) {
  if (!data || data.length === 0) {
    toast.error('No data to export')
    return
  }

  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, `${filename}.json`, 'application/json')
  toast.success('JSON exported successfully')
}

// Download file helper
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Hook for managing export state
export function useExport() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const exportData = React.useCallback(async (
    format: ExportFormat,
    data: any[],
    filename: string,
    customExporter?: (format: ExportFormat, data: any[]) => Promise<void>
  ) => {
    setLoading(true)
    setError(null)

    try {
      if (customExporter) {
        await customExporter(format, data)
      } else {
        await defaultExport(format, data, filename)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    exportData,
    clearError: () => setError(null),
  }
}

// Bulk Export Button for multiple datasets
interface BulkExportButtonProps {
  datasets: {
    name: string
    data: any[]
    filename: string
  }[]
  onExport?: (datasets: any[], format: ExportFormat) => Promise<void>
  formats?: ExportFormat[]
  disabled?: boolean
  className?: string
}

export function BulkExportButton({
  datasets,
  onExport,
  formats = ['csv', 'excel'],
  disabled = false,
  className,
}: BulkExportButtonProps) {
  const [loading, setLoading] = React.useState(false)

  const handleBulkExport = async (format: ExportFormat) => {
    setLoading(true)
    try {
      if (onExport) {
        await onExport(datasets, format)
      } else {
        // Default bulk export - create separate files
        for (const dataset of datasets) {
          await defaultExport(format, dataset.data, dataset.filename)
        }
      }
      toast.success(`Bulk export completed (${format.toUpperCase()})`)
    } catch (error) {
      console.error('Bulk export failed:', error)
      toast.error('Bulk export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ExportButton
      formats={formats}
      onExport={handleBulkExport}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      showLabel={true}
    />
  )
}