"use client";

import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
  onClear?: () => void;
  onSearch?: (value: string) => void;
  autoFocus?: boolean;
}

export function SearchInput({
  value = "",
  onValueChange,
  placeholder = "Search...",
  disabled = false,
  loading = false,
  debounceMs = 300,
  className,
  showClearButton = true,
  onClear,
  onSearch,
  autoFocus = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = React.useState(value);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  // Update internal value when external value changes
  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced value change
  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (internalValue !== value) {
        onValueChange(internalValue);
        onSearch?.(internalValue);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [internalValue, value, onValueChange, onSearch, debounceMs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleClear = () => {
    setInternalValue("");
    onValueChange("");
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch?.(internalValue);
    }
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="pl-9 pr-9"
      />
      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center space-x-1">
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {internalValue && showClearButton && !loading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-transparent"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// Advanced Search Input with filters
interface SearchFilter {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface AdvancedSearchInputProps {
  value?: string;
  filters?: Record<string, any>;
  onValueChange: (value: string) => void;
  onFiltersChange: (filters: Record<string, any>) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  debounceMs?: number;
  className?: string;
  searchFilters?: SearchFilter[];
  showFilters?: boolean;
}

export function AdvancedSearchInput({
  value = "",
  filters = {},
  onValueChange,
  onFiltersChange,
  placeholder = "Search...",
  disabled = false,
  loading = false,
  debounceMs = 300,
  className,
  searchFilters = [],
  showFilters = false,
}: AdvancedSearchInputProps) {
  const [showFilterPanel, setShowFilterPanel] = React.useState(showFilters);

  const handleFilterChange = (key: string, filterValue: any) => {
    const newFilters = { ...filters };
    if (
      filterValue === "" ||
      filterValue === undefined ||
      filterValue === null
    ) {
      delete newFilters[key];
    } else {
      newFilters[key] = filterValue;
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    onValueChange("");
  };

  const activeFilterCount = Object.keys(filters).length + (value ? 1 : 0);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <SearchInput
            value={value}
            onValueChange={onValueChange}
            placeholder={placeholder}
            disabled={disabled}
            loading={loading}
            debounceMs={debounceMs}
          />
        </div>

        {searchFilters.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="relative"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}

        {activeFilterCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        )}
      </div>

      {showFilterPanel && searchFilters.length > 0 && (
        <div className="rounded-md border p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {searchFilters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium">{filter.label}</label>
                {filter.type === "text" && (
                  <Input
                    type="text"
                    value={filters[filter.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.key, e.target.value)
                    }
                    placeholder={filter.placeholder}
                    disabled={disabled}
                  />
                )}
                {filter.type === "select" && (
                  <select
                    value={filters[filter.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.key, e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disabled}
                  >
                    <option value="">
                      {filter.placeholder || "Select..."}
                    </option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === "number" && (
                  <Input
                    type="number"
                    value={filters[filter.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.key, Number(e.target.value))
                    }
                    placeholder={filter.placeholder}
                    disabled={disabled}
                  />
                )}
                {filter.type === "date" && (
                  <Input
                    type="date"
                    value={filters[filter.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.key, e.target.value)
                    }
                    disabled={disabled}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for managing search state
export function useSearch(initialValue = "", debounceMs = 300) {
  const [value, setValue] = React.useState(initialValue);
  const [debouncedValue, setDebouncedValue] = React.useState(initialValue);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setLoading(false);
    }, debounceMs);

    if (value !== debouncedValue) {
      setLoading(true);
    }

    return () => clearTimeout(timer);
  }, [value, debounceMs, debouncedValue]);

  const clear = React.useCallback(() => {
    setValue("");
    setDebouncedValue("");
    setLoading(false);
  }, []);

  return {
    value,
    debouncedValue,
    loading,
    setValue,
    clear,
  };
}
