import { Search, X, ListFilter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function SearchAndFilters({ 
  globalFilter, 
  onGlobalFilterChange,
  hasActiveFilters,
  onClearFilters,
  filterCount,
  isFilterCommandOpen,
  onFilterCommandOpenChange,
  children 
}) {
  return (
    <div className="bg-white border-b border-gray-200 w-full">
      <div className="max-w-full mx-auto py-4 px-4">
        <div className="flex flex-col gap-4">
          {/* Global Search */}
          <div className="relative w-full flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                value={globalFilter ?? ''}
                onChange={e => onGlobalFilterChange(e.target.value)}
                className="pl-10 w-full"
                placeholder="Search all columns..."
              />
            </div>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                className="h-9 px-3 flex items-center gap-2" 
                onClick={onClearFilters}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
            <Popover open={isFilterCommandOpen} onOpenChange={onFilterCommandOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 px-3 flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  Filter
                  {filterCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-1 rounded-sm px-1 font-normal"
                    >
                      {filterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0" align="start">
                {children}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  )
} 