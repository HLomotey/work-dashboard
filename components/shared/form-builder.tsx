'use client'

import * as React from 'react'
import { useForm, UseFormReturn, FieldValues, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ButtonLoadingSpinner } from './loading-spinner'

export type FormFieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'datetime'

export interface FormFieldConfig<T extends FieldValues> {
  name: Path<T>
  label: string
  type: FormFieldType
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  options?: { label: string; value: string | number }[]
  min?: number
  max?: number
  step?: number
  rows?: number
  className?: string
}

interface FormBuilderProps<T extends FieldValues> {
  schema: z.ZodSchema<T>
  fields: FormFieldConfig<T>[]
  defaultValues?: Partial<T>
  onSubmit: (data: T) => Promise<void> | void
  submitText?: string
  cancelText?: string
  onCancel?: () => void
  loading?: boolean
  className?: string
  children?: React.ReactNode
}

export function FormBuilder<T extends FieldValues>({
  schema,
  fields,
  defaultValues,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  loading = false,
  className,
  children,
}: FormBuilderProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  })

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const renderField = (field: FormFieldConfig<T>) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem className={field.className}>
            <FormLabel>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {renderFieldControl(field, formField)}
            </FormControl>
            {field.description && (
              <FormDescription>{field.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  const renderFieldControl = (field: FormFieldConfig<T>, formField: any) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            {...formField}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            min={field.min}
            max={field.max}
            step={field.step}
            {...formField}
            onChange={(e) => formField.onChange(Number(e.target.value))}
          />
        )

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            rows={field.rows || 3}
            {...formField}
          />
        )

      case 'select':
        return (
          <Select
            onValueChange={formField.onChange}
            defaultValue={formField.value}
            disabled={field.disabled || loading}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formField.value}
              onCheckedChange={formField.onChange}
              disabled={field.disabled || loading}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {field.placeholder}
            </label>
          </div>
        )

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={formField.value}
              onCheckedChange={formField.onChange}
              disabled={field.disabled || loading}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {field.placeholder}
            </label>
          </div>
        )

      case 'date':
      case 'datetime':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formField.value && 'text-muted-foreground'
                )}
                disabled={field.disabled || loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formField.value ? (
                  format(formField.value, field.type === 'datetime' ? 'PPP p' : 'PPP')
                ) : (
                  <span>{field.placeholder || 'Pick a date'}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formField.value}
                onSelect={formField.onChange}
                disabled={(date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      default:
        return (
          <Input
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            {...formField}
          />
        )
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn('space-y-6', className)}>
        <div className="grid gap-4">
          {fields.map(renderField)}
        </div>

        {children}

        <div className="flex items-center justify-end space-x-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading && <ButtonLoadingSpinner />}
            {submitText}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Hook to access form methods from parent components
export function useFormBuilder<T extends FieldValues>() {
  const [form, setForm] = React.useState<UseFormReturn<T> | null>(null)

  const registerForm = React.useCallback((formInstance: UseFormReturn<T>) => {
    setForm(formInstance)
  }, [])

  return {
    form,
    registerForm,
    reset: () => form?.reset(),
    setValue: (name: Path<T>, value: any) => form?.setValue(name, value),
    getValues: () => form?.getValues(),
    trigger: (name?: Path<T>) => form?.trigger(name),
  }
}