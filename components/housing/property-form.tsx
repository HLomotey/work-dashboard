'use client'

import * as React from 'react'
import { z } from 'zod'

import { useProperties } from '@/hooks/use-housing'
import type { Property, CreateProperty, UpdateProperty, PropertyStatus } from '@/lib/types/housing'
import { CreatePropertySchema, UpdatePropertySchema } from '@/lib/types/housing'
import { FormBuilder, FormFieldConfig } from '@/components/shared'

interface PropertyFormProps {
  property?: Property
  onSuccess?: (property: Property) => void
  onCancel?: () => void
  className?: string
}

export function PropertyForm({
  property,
  onSuccess,
  onCancel,
  className,
}: PropertyFormProps) {
  const { createProperty, updateProperty } = useProperties()
  const [loading, setLoading] = React.useState(false)

  const isEditing = !!property

  // Form schema
  const schema = isEditing ? UpdatePropertySchema : CreatePropertySchema

  // Form fields configuration
  const fields: FormFieldConfig<CreateProperty | UpdateProperty>[] = [
    {
      name: 'name',
      label: 'Property Name',
      type: 'text',
      placeholder: 'Enter property name',
      required: true,
      description: 'A unique name for this property',
    },
    {
      name: 'address',
      label: 'Address',
      type: 'textarea',
      placeholder: 'Enter full address',
      required: true,
      rows: 3,
      description: 'Complete address including street, city, state, and zip code',
    },
    {
      name: 'totalCapacity',
      label: 'Total Capacity',
      type: 'number',
      placeholder: 'Enter total bed capacity',
      required: true,
      min: 1,
      max: 1000,
      description: 'Maximum number of beds available in this property',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Maintenance', value: 'maintenance' },
      ],
      description: 'Current operational status of the property',
    },
  ]

  // Default values
  const defaultValues = React.useMemo(() => {
    if (isEditing && property) {
      return {
        name: property.name,
        address: property.address,
        totalCapacity: property.totalCapacity,
        status: property.status,
      }
    }
    return {
      name: '',
      address: '',
      totalCapacity: 1,
      status: 'active' as PropertyStatus,
    }
  }, [isEditing, property])

  // Handle form submission
  const handleSubmit = async (data: CreateProperty | UpdateProperty) => {
    setLoading(true)
    try {
      let result: Property

      if (isEditing && property) {
        result = await updateProperty(property.id, data as UpdateProperty)
      } else {
        result = await createProperty(data as CreateProperty)
      }

      onSuccess?.(result)
    } catch (error) {
      console.error('Form submission error:', error)
      throw error // Let FormBuilder handle the error display
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <FormBuilder
        schema={schema}
        fields={fields}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        loading={loading}
        submitText={isEditing ? 'Update Property' : 'Create Property'}
        cancelText="Cancel"
      />
    </div>
  )
}