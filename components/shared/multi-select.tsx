'use client'

import * as React from 'react'
import { Check, ChevronDown, X, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

export interface MultiSelectOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  maxSelected?: number
  className?: string
  showSearch?: boolean
  showSelectAll?: boolean
  showClearAll?: boolean
  variant?: 'default' | 'secondary' | 'outline'
}

export function MultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = 'Select items...',
  searchPlaceholder = 'Search...',
  emptyText = 'No items found.',
  disabled = false,
  maxSelected,
  className,
  showSearch = true,
  showSelectAll = true,
  showClearAll = true,
  variant = 'outline',
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => selected.includes(option.value))
  }, [options, selected])

  const isSelected = (value: string) => selected.includes(value)

  const handleSelect = (value: string) => {
    if (isSelected(value)) {
      onSelectionChange(selected.filter((item) => item !== value))
    } else {
      if (maxSelected && selected.length >= maxSelected) {
        return
      }
      onSelectionChange([...selected, value])
    }
  }

  const handleSelectAll = () => {
    const availableOptions = filteredOptions.filter((option) => !option.disabled)
    const allValues = availableOptions.map((option) => option.value)
    const newSelected = [...new Set([...selected, ...allValues])]
    
    if (maxSelected) {
      onSelectionChange(newSelected.slice(0, maxSelected))
    } else {
      onSelectionChange(newSelected)
    }
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  const handleRemoveItem = (value: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelectionChange(selected.filter((item) => item !== value))
  }

  const isAllSelected = filteredOptions.length > 0 && 
    filteredOptions.every((option) => option.disabled || isSelected(option.value))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between min-h-10 h-auto',
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {option.icon && (
                    <option.icon className="mr-1 h-3 w-3" />
                  )}
                  {option.label}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRemoveItem(option.value, e as any)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => handleRemoveItem(option.value, e)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          {showSearch && (
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchValue}
                onValueChange={setSearchValue}
              />
            </div>
          )}
          
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            
            {(showSelectAll || showClearAll) && filteredOptions.length > 0 && (
              <>
                <CommandGroup>
                  {showSelectAll && (
                    <CommandItem
                      onSelect={handleSelectAll}
                      disabled={isAllSelected || (maxSelected && selected.length >= maxSelected)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isAllSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      Select All
                    </CommandItem>
                  )}
                  
                  {showClearAll && selected.length > 0 && (
                    <CommandItem onSelect={handleClearAll}>
                      <X className="mr-2 h-4 w-4" />
                      Clear All
                    </CommandItem>
                  )}
                </CommandGroup>
                <Separator />
              </>
            )}
            
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  disabled={option.disabled || (maxSelected && selected.length >= maxSelected && !isSelected(option.value))}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      isSelected(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.icon && (
                    <option.icon className="mr-2 h-4 w-4" />
                  )}
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Async MultiSelect for large datasets
interface AsyncMultiSelectProps extends Omit<MultiSelectProps, 'options'> {
  loadOptions: (search: string) => Promise<MultiSelectOption[]>
  defaultOptions?: MultiSelectOption[]
  loadingText?: string
  minSearchLength?: number
}

export function AsyncMultiSelect({
  loadOptions,
  defaultOptions = [],
  loadingText = 'Loading...',
  minSearchLength = 0,
  searchPlaceholder = 'Type to search...',
  ...props
}: AsyncMultiSelectProps) {
  const [options, setOptions] = React.useState<MultiSelectOption[]>(defaultOptions)
  const [loading, setLoading] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  const loadOptionsDebounced = React.useMemo(
    () => {
      let timeoutId: NodeJS.Timeout
      return (search: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(async () => {
          if (search.length >= minSearchLength) {
            setLoading(true)
            try {
              const newOptions = await loadOptions(search)
              setOptions(newOptions)
            } catch (error) {
              console.error('Failed to load options:', error)
            } finally {
              setLoading(false)
            }
          } else {
            setOptions(defaultOptions)
          }
        }, 300)
      }
    },
    [loadOptions, minSearchLength, defaultOptions]
  )

  React.useEffect(() => {
    loadOptionsDebounced(searchValue)
  }, [searchValue, loadOptionsDebounced])

  return (
    <MultiSelect
      {...props}
      options={options}
      searchPlaceholder={searchPlaceholder}
      emptyText={loading ? loadingText : props.emptyText}
    />
  )
}

// Hook for managing multi-select state
export function useMultiSelect(initialSelected: string[] = []) {
  const [selected, setSelected] = React.useState<string[]>(initialSelected)

  const add = React.useCallback((value: string) => {
    setSelected((prev) => [...prev, value])
  }, [])

  const remove = React.useCallback((value: string) => {
    setSelected((prev) => prev.filter((item) => item !== value))
  }, [])

  const toggle = React.useCallback((value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }, [])

  const clear = React.useCallback(() => {
    setSelected([])
  }, [])

  const selectAll = React.useCallback((values: string[]) => {
    setSelected(values)
  }, [])

  const isSelected = React.useCallback(
    (value: string) => selected.includes(value),
    [selected]
  )

  return {
    selected,
    setSelected,
    add,
    remove,
    toggle,
    clear,
    selectAll,
    isSelected,
  }
}