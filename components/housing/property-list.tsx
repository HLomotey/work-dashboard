'use client'

import * as React from 'react'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Building } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

import { useProperties } from '@/hooks/use-housing'
import type { Property, PropertyStatus, HousingFilters } from '@/lib/types/housing'
import { 
  DataTable, 
  createSortableHeader, 
  createActionColumn,
  SearchInput,
  Modal,
  ConfirmationModal,
  KPICard,
  KPIGrid,
  LoadingSpinner,
  useModal
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { PropertyForm } from './property-form'
import { PropertyDetails } from './property-details'

interface PropertyListProps {
  onPropertySelect?: (property: Property) => void
  showActions?: boolean
  compact?: boolean
  className?: string
}

export function PropertyList({
  onPropertySelect,
  showActions = true,
  compact = false,
  className,
}: PropertyListProps) {
  const [filters, setFilters] = React.useState<HousingFilters>({})
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null)
  const [propertyToDelete, setPropertyToDelete] = React.useState<Property | null>(null)
  
  const { properties, isLoading, error, updateProperty, deleteProperty } = useProperties(filters)
  
  const createModal = useModal()
  const editModal = useModal()
  const detailsModal = useModal()
  const deleteModal = useModal()

  // Handle search
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }))
  }

  // Handle status filter
  const handleStatusFilter = (status: PropertyStatus | 'all') => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status
    }))
  }

  // Handle property actions
  const handleEdit = (property: Property) => {
    setSelectedProperty(property)
    editModal.openModal()
  }

  const handleView = (property: Property) => {
    setSelectedProperty(property)
    detailsModal.openModal()
  }

  const handleDelete = (property: Property) => {
    setPropertyToDelete(property)
    deleteModal.openModal()
  }

  const confirmDelete = async () => {
    if (!propertyToDelete) return

    try {
      await deleteProperty(propertyToDelete.id)
      toast.success('Property deleted successfully')
      setPropertyToDelete(null)
    } catch (error) {
      toast.error('Failed to delete property')
      console.error('Delete error:', error)
    }
  }

  // Table columns
  const columns: ColumnDef<Property>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<Property>[] = [
      {
        accessorKey: 'name',
        header: createSortableHeader('Name', 'name'),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{row.original.name}</div>
              {!compact && (
                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {row.original.address}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'totalCapacity',
        header: createSortableHeader('Capacity', 'totalCapacity'),
        cell: ({ row }) => (
          <div className="text-center">
            <div className="font-medium">{row.original.totalCapacity}</div>
            <div className="text-xs text-muted-foreground">beds</div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          const variant = status === 'active' ? 'default' : 
                        status === 'maintenance' ? 'secondary' : 'outline'
          
          return (
            <Badge variant={variant} className="capitalize">
              {status}
            </Badge>
          )
        },
      },
    ]

    if (!compact) {
      baseColumns.push({
        accessorKey: 'address',
        header: 'Address',
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate" title={row.original.address}>
            {row.original.address}
          </div>
        ),
      })
    }

    if (showActions) {
      baseColumns.push(
        createActionColumn<Property>((property) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(property)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(property)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(property)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        ))
      )
    }

    return baseColumns
  }, [compact, showActions])

  // Calculate metrics
  const metrics = React.useMemo(() => {
    if (!properties) return null

    const total = properties.length
    const active = properties.filter(p => p.status === 'active').length
    const maintenance = properties.filter(p => p.status === 'maintenance').length
    const totalCapacity = properties.reduce((sum, p) => sum + p.totalCapacity, 0)

    return { total, active, maintenance, totalCapacity }
  }, [properties])

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error loading properties: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Metrics */}
      {!compact && metrics && (
        <KPIGrid columns={4} className="mb-6">
          <KPICard
            title="Total Properties"
            value={metrics.total}
            icon={Building}
          />
          <KPICard
            title="Active Properties"
            value={metrics.active}
            variant="success"
          />
          <KPICard
            title="Under Maintenance"
            value={metrics.maintenance}
            variant="warning"
          />
          <KPICard
            title="Total Capacity"
            value={metrics.totalCapacity}
            description="beds available"
          />
        </KPIGrid>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Properties</CardTitle>
              <CardDescription>
                Manage housing properties and their details
              </CardDescription>
            </div>
            {showActions && (
              <Button onClick={createModal.openModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 max-w-sm">
              <SearchInput
                placeholder="Search properties..."
                onValueChange={handleSearch}
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleStatusFilter(value as PropertyStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <DataTable<Property, any>
            columns={columns}
            data={properties || []}
            loading={isLoading}
            searchKey="name"
            onRowClick={onPropertySelect}
            emptyMessage="No properties found. Add your first property to get started."
          />
        </CardContent>
      </Card>

      {/* Create Property Modal */}
      <Modal
        open={createModal.open}
        onOpenChange={createModal.setOpen}
        title="Add New Property"
        description="Create a new housing property"
        size="lg"
      >
        <PropertyForm
          onSuccess={() => {
            createModal.closeModal()
            toast.success('Property created successfully')
          }}
          onCancel={createModal.closeModal}
        />
      </Modal>

      {/* Edit Property Modal */}
      <Modal
        open={editModal.open}
        onOpenChange={editModal.setOpen}
        title="Edit Property"
        description="Update property information"
        size="lg"
      >
        {selectedProperty && (
          <PropertyForm
            property={selectedProperty}
            onSuccess={() => {
              editModal.closeModal()
              toast.success('Property updated successfully')
            }}
            onCancel={editModal.closeModal}
          />
        )}
      </Modal>

      {/* Property Details Modal */}
      <Modal
        open={detailsModal.open}
        onOpenChange={detailsModal.setOpen}
        title="Property Details"
        size="xl"
      >
        {selectedProperty && (
          <PropertyDetails
            property={selectedProperty}
            onEdit={() => {
              detailsModal.closeModal()
              handleEdit(selectedProperty)
            }}
          />
        )}
      </Modal>
//
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModal.open}
        onOpenChange={deleteModal.setOpen}
        title="Delete Property"
        description={`Are you sure you want to delete "${propertyToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  )
}