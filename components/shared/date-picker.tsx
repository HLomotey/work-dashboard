'use client'

import * as React from 'react'
import { format, isValid } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DatePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  disableFuture?: boolean
  disablePast?: boolean
  minDate?: Date
  maxDate?: Date
  showClearButton?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  disableFuture = false,
  disablePast = false,
  minDate,
  maxDate,
  showClearButton = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const isDateDisabled = (date: Date) => {
    if (disableFuture && date > new Date()) return true
    if (disablePast && date < new Date()) return true
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange(undefined)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date && isValid(date) ? format(date, 'PPP') : placeholder}
          {date && showClearButton && (
            <X
              className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange(selectedDate)
            setOpen(false)
          }}
          disabled={isDateDisabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

// Date Range Picker
interface DateRangePickerProps {
  from?: Date
  to?: Date
  onRangeChange: (range: { from?: Date; to?: Date }) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  disableFuture?: boolean
  disablePast?: boolean
  minDate?: Date
  maxDate?: Date
  showClearButton?: boolean
}

export function DateRangePicker({
  from,
  to,
  onRangeChange,
  placeholder = 'Pick a date range',
  disabled = false,
  className,
  disableFuture = false,
  disablePast = false,
  minDate,
  maxDate,
  showClearButton = true,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const isDateDisabled = (date: Date) => {
    if (disableFuture && date > new Date()) return true
    if (disablePast && date < new Date()) return true
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRangeChange({ from: undefined, to: undefined })
  }

  const formatRange = () => {
    if (from && to) {
      return `${format(from, 'MMM dd')} - ${format(to, 'MMM dd, yyyy')}`
    }
    if (from) {
      return `${format(from, 'MMM dd, yyyy')} - ...`
    }
    return placeholder
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !from && !to && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatRange()}
          {(from || to) && showClearButton && (
            <X
              className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from, to }}
          onSelect={(range) => {
            onRangeChange({
              from: range?.from,
              to: range?.to,
            })
            if (range?.from && range?.to) {
              setOpen(false)
            }
          }}
          disabled={isDateDisabled}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

// Time Picker (simplified)
interface TimePickerProps {
  time?: string // Format: "HH:mm"
  onTimeChange: (time: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showClearButton?: boolean
}

export function TimePicker({
  time,
  onTimeChange,
  placeholder = 'Select time',
  disabled = false,
  className,
  showClearButton = true,
}: TimePickerProps) {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onTimeChange(value || undefined)
  }

  const handleClear = () => {
    onTimeChange(undefined)
  }

  return (
    <div className={cn('relative', className)}>
      <Input
        type="time"
        value={time || ''}
        onChange={handleTimeChange}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-8"
      />
      {time && showClearButton && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-transparent"
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

// DateTime Picker
interface DateTimePickerProps {
  dateTime?: Date
  onDateTimeChange: (dateTime: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  disableFuture?: boolean
  disablePast?: boolean
  minDate?: Date
  maxDate?: Date
  showClearButton?: boolean
}

export function DateTimePicker({
  dateTime,
  onDateTimeChange,
  placeholder = 'Pick date and time',
  disabled = false,
  className,
  disableFuture = false,
  disablePast = false,
  minDate,
  maxDate,
  showClearButton = true,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(dateTime)
  const [time, setTime] = React.useState<string | undefined>(
    dateTime ? format(dateTime, 'HH:mm') : undefined
  )

  React.useEffect(() => {
    if (date && time) {
      const [hours, minutes] = time.split(':').map(Number)
      const newDateTime = new Date(date)
      newDateTime.setHours(hours, minutes, 0, 0)
      onDateTimeChange(newDateTime)
    } else if (!date && !time) {
      onDateTimeChange(undefined)
    }
  }, [date, time, onDateTimeChange])

  const handleClear = () => {
    setDate(undefined)
    setTime(undefined)
    onDateTimeChange(undefined)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-sm font-medium">Date</Label>
          <DatePicker
            date={date}
            onDateChange={setDate}
            placeholder="Pick date"
            disabled={disabled}
            disableFuture={disableFuture}
            disablePast={disablePast}
            minDate={minDate}
            maxDate={maxDate}
            showClearButton={false}
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Time</Label>
          <TimePicker
            time={time}
            onTimeChange={setTime}
            placeholder="Select time"
            disabled={disabled}
            showClearButton={false}
          />
        </div>
      </div>
      {(date || time) && showClearButton && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="w-full"
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}