"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { CalendarIcon, Upload, X, FileText, DollarSign, Tag, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  TransactionType,
  TransactionStatus,
  TransactionCategory,
  PaymentMethod,
  CreateTransactionSchema,
  type Transaction,
  type CreateTransaction,
  type TransactionAttachment,
} from '@/lib/supabase/types/transaction'

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction
  onSubmit: (data: CreateTransaction) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

type TransactionFormData = CreateTransaction

export function TransactionForm({ 
  open, 
  onOpenChange, 
  transaction, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: TransactionFormProps) {
  const [attachments, setAttachments] = useState<TransactionAttachment[]>(
    transaction?.attachments || []
  )
  const [tags, setTags] = useState<string[]>(transaction?.tags || [])
  const [newTag, setNewTag] = useState('')

  const form = useForm<CreateTransaction>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      description: transaction?.description || '',
      type: transaction?.type || TransactionType.EXPENSE,
      status: transaction?.status || TransactionStatus.DRAFT,
      amount: transaction?.amount || 0,
      currency: transaction?.currency || 'USD',
      date: transaction?.date || new Date(),
      category: transaction?.category,
      paymentMethod: transaction?.paymentMethod,
      referenceNumber: transaction?.referenceNumber || '',
      budgetId: transaction?.budgetId,
      departmentId: transaction?.departmentId,
      vendorId: transaction?.vendorId,
      projectId: transaction?.projectId,
      taxAmount: transaction?.taxAmount || 0,
      taxRate: transaction?.taxRate || 0,
      discountAmount: transaction?.discountAmount || 0,
      attachments: [],
      tags: transaction?.tags || [],
      notes: transaction?.notes || '',
      createdBy: 'current-user-id',
    },
  })

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      const totalAmount = data.amount + (data.taxAmount || 0) - (data.discountAmount || 0)
      await onSubmit({
        ...data,
        attachments,
        tags,
      })
      toast.success(transaction ? 'Transaction updated successfully' : 'Transaction created successfully')
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error('Failed to save transaction')
      console.error('Transaction save error:', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const newAttachment: TransactionAttachment = {
          id: Date.now().toString(),
          filename: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size,
          uploadedAt: new Date(),
        }
        setAttachments(prev => [...prev, newAttachment])
      })
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(attachment => attachment.id !== id))
  }

  const updateAttachment = (id: string, updates: Partial<TransactionAttachment>) => {
    setAttachments(attachments.map(attachment => 
      attachment.id === id ? { ...attachment, ...updates } : attachment
    ))
  }

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return 'bg-green-100 text-green-800'
      case TransactionType.EXPENSE:
        return 'bg-red-100 text-red-800'
      case TransactionType.TRANSFER:
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'default'
      case TransactionStatus.PENDING:
        return 'secondary'
      case TransactionStatus.FAILED:
        return 'destructive'
      case TransactionStatus.CANCELLED:
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{transaction ? 'Edit Transaction' : 'Create New Transaction'}</CardTitle>
        <CardDescription>
          {transaction ? 'Update transaction details and attachments' : 'Record a new financial transaction with supporting documents'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Transaction Type and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TransactionType).map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <Badge className={getTransactionTypeColor(type)}>
                                {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the transaction amount in USD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description of the transaction" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Office Supplies, Travel, Marketing" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Method and Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PaymentMethod).map((method) => (
                          <SelectItem key={method} value={method}>
                            {method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reference number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget and Department Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="budgetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Budget UUID" />
                    </FormControl>
                    <FormDescription>
                      Link to specific budget line item
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Department UUID" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Vendor UUID" />
                    </FormControl>
                    <FormDescription>
                      If applicable, link to vendor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full md:w-64">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TransactionStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          <Badge variant={getStatusColor(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Supporting Documents</Label>
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    className="sr-only"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Add Document
                  </Button>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-3">
                  {attachments.map((attachment, index) => (
                    <Card key={attachment.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {attachment.filename || `Document ${index + 1}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {attachment.type} • {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter tags separated by commas (e.g., urgent, recurring, tax-deductible)"
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        field.onChange(tags)
                      }}
                      value={field.value?.join(', ') || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Add tags to help categorize and search for this transaction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Any additional notes or comments about this transaction..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : transaction ? 'Update Transaction' : 'Create Transaction'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
