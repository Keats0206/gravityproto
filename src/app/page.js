'use client'

import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, getGroupedRowModel, getExpandedRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import { mockData, columns } from './mockData'
import { Search, Filter, X, ChevronLeft, ChevronRight, Check, ChevronDown, ChevronUp, GripHorizontal, ChevronRight as ChevronRightIcon, MoreHorizontal, MoreVertical, AlignJustify, AlignCenter, Table, ListFilter, Calendar, Sliders, ArrowUp, ArrowDown, EyeOff, Pin, Building2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Slider } from "@/components/ui/slider"
import { format } from "date-fns"
import { TableHeader } from '@/components/table/TableHeader'
import { SearchAndFilters } from '@/components/table/SearchAndFilters'
import { FilterBar } from '@/components/table/FilterBar'
import { DetailPanel } from '@/components/table/DetailPanel'
import { Pagination } from '@/components/table/Pagination'
import { GroupingBar } from '@/components/table/GroupingBar'
import { DataTable } from '@/components/table/DataTable'

const FilterPopoverContent = ({ 
  column, 
  searchValue, 
  onSearchChange, 
  filteredItems, 
  selectedItems, 
  onItemSelect 
}) => {
  return (
    <Command className="w-full">
      <CommandInput 
        placeholder={`Search ${column.id}s...`}
        value={searchValue}
        onValueChange={onSearchChange}
      />
      <CommandList className="max-h-[200px] overflow-auto">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {filteredItems.map(item => (
            <CommandItem
              key={item}
              onSelect={() => onItemSelect(item)}
            >
              <div className="flex items-center justify-between w-full">
                <span>{item}</span>
                {selectedItems.includes(item) && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

const EditableCell = ({ value: initialValue, row, column }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  
  const handleClick = (e) => {
    e.stopPropagation()
    if (!isEditing) {
      e.target.select()
    }
  }

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    // Here you would typically save the value to your data store
    console.log('New value:', value, 'for row:', row.original.id, 'column:', column.id)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
    if (e.key === 'Escape') {
      setValue(initialValue)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        autoFocus
        className="h-7 w-full"
      />
    )
  }

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className="cursor-text h-full w-full px-1"
    >
      {value}
    </div>
  )
}

export default function Home() {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState([])
  const [openSheet, setOpenSheet] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [rowHeight, setRowHeight] = useState('normal')
  const [siteFilters, setSiteFilters] = useState([])
  const [statusFilters, setStatusFilters] = useState([])
  const [scopeFilters, setScopeFilters] = useState([])
  const [grouping, setGrouping] = useState([])
  const [expanded, setExpanded] = useState({})
  const [columnOrder, setColumnOrder] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterCommandOpen, setIsFilterCommandOpen] = useState(false)
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [co2Range, setCo2Range] = useState({ min: '', max: '' })
  const [costRange, setCostRange] = useState({ min: '', max: '' })
  const [sorting, setSorting] = useState([])
  const [siteSearch, setSiteSearch] = useState('')
  const [statusSearch, setStatusSearch] = useState('')
  const [scopeSearch, setScopeSearch] = useState('')

  const handleRowClick = (row) => {
    setSelectedRow(row.original)
    setIsDetailViewOpen(true)
  }

  const handleNextRecord = () => {
    if (!selectedRow) return;
    const currentRows = table.getRowModel().rows;
    const currentIndex = currentRows.findIndex(row => row.original.id === selectedRow.id);
    
    if (currentIndex < currentRows.length - 1) {
      const nextRow = currentRows[currentIndex + 1];
      setSelectedRow(nextRow.original);
    }
  };

  const handlePreviousRecord = () => {
    if (!selectedRow) return;
    const currentRows = table.getRowModel().rows;
    const currentIndex = currentRows.findIndex(row => row.original.id === selectedRow.id);
    
    if (currentIndex > 0) {
      const prevRow = currentRows[currentIndex - 1];
      setSelectedRow(prevRow.original);
    }
  };

  const handleSiteFilter = (site) => {
    setSiteFilters(prev => {
      const newFilters = prev.includes(site) 
        ? prev.filter(s => s !== site)
        : [...prev, site];
      
      table.getColumn('site')?.setFilterValue(newFilters.length ? newFilters : undefined);
      return newFilters;
    });
  };

  const handleStatusFilter = (status) => {
    setStatusFilters(prev => {
      const newFilters = prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status];
      
      table.getColumn('status')?.setFilterValue(newFilters.length ? newFilters : undefined);
      return newFilters;
    });
  };

  const handleScopeFilter = (scope) => {
    setScopeFilters(prev => {
      const newFilters = prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope];
      
      table.getColumn('scope')?.setFilterValue(newFilters.length ? newFilters : undefined);
      return newFilters;
    });
  };

  const handleDateRangeFilter = (range) => {
    setDateRange(range)
    if (range.from && range.to) {
      table.getColumn('startDate')?.setFilterValue([range.from, range.to])
    } else {
      table.getColumn('startDate')?.setFilterValue(undefined)
    }
  }

  const handleCo2RangeFilter = (range) => {
    setCo2Range(range)
    if (range.min !== '' && range.max !== '') {
      const min = parseFloat(range.min)
      const max = parseFloat(range.max)
      table.getColumn('tonsOfCO2e')?.setFilterValue([min, max])
    } else {
      table.getColumn('tonsOfCO2e')?.setFilterValue(undefined)
    }
  }

  const handleCostRangeFilter = (range) => {
    setCostRange(range)
    if (range.min !== '' && range.max !== '') {
      table.getColumn('cost')?.setFilterValue([parseFloat(range.min), parseFloat(range.max)])
    } else {
      table.getColumn('cost')?.setFilterValue(undefined)
    }
  }

  const handleClearFilters = () => {
    setGlobalFilter('')
    setSiteFilters([])
    setStatusFilters([])
    setScopeFilters([])
    setDateRange({ from: null, to: null })
    setCo2Range({ min: '', max: '' })
    setCostRange({ min: '', max: '' })
    table.getColumn('site')?.setFilterValue(undefined)
    table.getColumn('status')?.setFilterValue(undefined)
    table.getColumn('scope')?.setFilterValue(undefined)
    table.getColumn('startDate')?.setFilterValue(undefined)
    table.getColumn('tonsOfCO2e')?.setFilterValue(undefined)
    table.getColumn('cost')?.setFilterValue(undefined)
  }

  // Add drag and drop handlers
  const onDragStart = (e, columnId) => {
    e.dataTransfer.setData('columnId', columnId)
  }

  const onDragOver = (e) => {
    e.preventDefault()
  }

  const onDrop = (e) => {
    e.preventDefault()
    const columnId = e.dataTransfer.getData('columnId')
    if (!grouping.includes(columnId)) {
      setGrouping(prev => [...prev, columnId])
    }
  }

  const removeGrouping = (columnId) => {
    setGrouping(prev => prev.filter(id => id !== columnId))
  }

  // Get min/max values for numeric fields
  const ranges = useMemo(() => ({
    co2: {
      min: Math.min(...mockData.map(item => {
        const value = item.tCO2e?.toString() || '0'
        return parseFloat(value.replace(/,/g, '')) || 0
      })),
      max: Math.max(...mockData.map(item => {
        const value = item.tCO2e?.toString() || '0'
        return parseFloat(value.replace(/,/g, '')) || 0
      }))
    },
    cost: {
      min: Math.min(...mockData.map(item => parseFloat(item.cost?.toString() || '0') || 0)),
      max: Math.max(...mockData.map(item => parseFloat(item.cost?.toString() || '0') || 0))
    }
  }), [])

  const table = useReactTable({
    data: mockData,
    columns: [
      {
        id: 'expander',
        header: '',
        cell: ({ row }) => {
          if (row.getCanExpand()) {
            return (
              <button
                className="p-1"
                onClick={row.getToggleExpandedHandler()}
              >
                <ChevronRightIcon
                  className={`h-4 w-4 transition-transform ${
                    row.getIsExpanded() ? 'rotate-90' : ''
                  }`}
                />
              </button>
            )
          }
          return null
        },
        size: 30,
        enableSorting: false,
      },
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        size: 40,
        enableSorting: false,
      },
      ...columns.map(column => ({
        id: column.accessorKey || column.id,
        ...column,
        enableGrouping: true,
        cell: ({ row, column }) => {
          // Handle grouped rows
          if (row.getIsGrouped()) {
            if (column.id === grouping[row.depth]) {
              return (
                <div className="flex items-center gap-2">
                  {column.id === 'site' ? (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500 stroke-[1.5]" />
                      <span className="font-semibold">{row.getValue(column.id)}</span>
                      <span className="text-gray-500">({row.subRows?.length} items)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {row.getValue(column.id)}
                      <span className="text-gray-500">({row.subRows?.length} items)</span>
                    </div>
                  )}
                </div>
              )
            }
            return null
          }

          // Handle editable cells
          if (column.id === 'tonsOfCO2e' || column.id === 'cost') {
            return (
              <EditableCell
                value={row.getValue(column.id)}
                row={row}
                column={column}
              />
            )
          }

          // Use the column's custom cell renderer if provided
          if (column.cell) {
            return flexRender(column.cell, { row, column })
          }

          // Default cell rendering
          return row.getValue(column.id)
        },
      })),
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <div className="flex items-center justify-end gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(row);
                  }}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    // Add edit handler
                  }}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add delete handler
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 80,
        enableSorting: false,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      globalFilter,
      columnFilters,
      rowSelection,
      grouping,
      expanded,
      columnOrder,
      sorting,
    },
    enableRowSelection: true,
    enableSorting: true,
    enableMultiSort: true,
    enableGrouping: true,
    groupedColumnMode: "reorder",
    manualGrouping: false,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: updater => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize })
        setPageIndex(newState.pageIndex)
        setPageSize(newState.pageSize)
      } else {
        setPageIndex(updater.pageIndex)
        setPageSize(updater.pageSize)
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
  })

  // Get unique values for filter dropdowns
  const uniqueSites = [...new Set(mockData.map(item => item.site))]
  const uniqueStatuses = [...new Set(mockData.map(item => item.status))]
  const uniqueScopes = [...new Set(mockData.map(item => item.scope))]

  // Filter search handlers
  const filteredSites = useMemo(() => {
    return uniqueSites.filter(site => 
      site.toLowerCase().includes(siteSearch.toLowerCase())
    )
  }, [uniqueSites, siteSearch])

  const filteredStatuses = useMemo(() => {
    return uniqueStatuses.filter(status => 
      status.toLowerCase().includes(statusSearch.toLowerCase())
    )
  }, [uniqueStatuses, statusSearch])

  const filteredScopes = useMemo(() => {
    return uniqueScopes.filter(scope => 
      scope.toLowerCase().includes(scopeSearch.toLowerCase())
    )
  }, [uniqueScopes, scopeSearch])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TableHeader title="Table Prototype" />
      
      <SearchAndFilters 
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        hasActiveFilters={globalFilter || siteFilters.length > 0 || statusFilters.length > 0 || scopeFilters.length > 0}
        onClearFilters={handleClearFilters}
        filterCount={siteFilters.length + statusFilters.length + scopeFilters.length}
        isFilterCommandOpen={isFilterCommandOpen}
        onFilterCommandOpenChange={setIsFilterCommandOpen}
      >
        <Command className="rounded-lg border shadow-md mr-4">
          <div className="flex items-center justify-between border-b p-2">
            <div className="flex-1 pr-2">
              <Input
                placeholder="Search filters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="h-8 px-2 lg:px-3 whitespace-nowrap"
            >
              Clear All
            </Button>
          </div>
          <CommandList className="max-h-[600px] overflow-auto pb-4">
            <CommandEmpty>No filters found.</CommandEmpty>
            <CommandGroup heading="Site">
              <div className="px-2 pb-2 pt-1">
                <Input
                  placeholder="Search sites..."
                  value={siteSearch}
                  onChange={(e) => setSiteSearch(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-8 mb-2"
                />
              </div>
              {filteredSites.map(site => (
                <CommandItem
                  key={site}
                  onSelect={() => handleSiteFilter(site)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{site}</span>
                    <div className="flex items-center gap-2">
                      {siteFilters.includes(site) && (
                        <Check className="h-4 w-4" />
                      )}
                      <Badge variant="secondary">
                        {mockData.filter(item => item.site === site).length}
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Status">
              <div className="px-2 pb-2 pt-1">
                <Input
                  placeholder="Search statuses..."
                  value={statusSearch}
                  onChange={(e) => setStatusSearch(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-8 mb-2"
                />
              </div>
              {filteredStatuses.map(status => (
                <CommandItem
                  key={status}
                  onSelect={() => handleStatusFilter(status)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{status}</span>
                    <div className="flex items-center gap-2">
                      {statusFilters.includes(status) && (
                        <Check className="h-4 w-4" />
                      )}
                      <Badge variant="secondary">
                        {mockData.filter(item => item.status === status).length}
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Scope">
              <div className="px-2 pb-2 pt-1">
                <Input
                  placeholder="Search scopes..."
                  value={scopeSearch}
                  onChange={(e) => setScopeSearch(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-8 mb-2"
                />
              </div>
              {filteredScopes.map(scope => (
                <CommandItem
                  key={scope}
                  onSelect={() => handleScopeFilter(scope)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{scope}</span>
                    <div className="flex items-center gap-2">
                      {scopeFilters.includes(scope) && (
                        <Check className="h-4 w-4" />
                      )}
                      <Badge variant="secondary">
                        {mockData.filter(item => item.scope === scope).length}
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Date Range">
              <CommandItem>
                <div className="flex flex-col gap-2 w-full">
                  <CalendarComponent
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateRangeFilter}
                    numberOfMonths={2}
                  />
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="CO2e Range">
              <CommandItem>
                <div className="flex flex-col gap-2 w-full px-2">
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={co2Range.min}
                      onChange={(e) => handleCo2RangeFilter({ ...co2Range, min: e.target.value })}
                      className="w-24"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={co2Range.max}
                      onChange={(e) => handleCo2RangeFilter({ ...co2Range, max: e.target.value })}
                      className="w-24"
                    />
                  </div>
                  <Slider
                    min={ranges.co2.min}
                    max={ranges.co2.max}
                    step={(ranges.co2.max - ranges.co2.min) / 100}
                    value={[
                      parseFloat(co2Range.min || ranges.co2.min),
                      parseFloat(co2Range.max || ranges.co2.max)
                    ]}
                    onValueChange={([min, max]) => handleCo2RangeFilter({ min: min.toString(), max: max.toString() })}
                    className="mt-2"
                  />
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Cost Range">
              <CommandItem>
                <div className="flex flex-col gap-2 w-full px-2">
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={costRange.min}
                      onChange={(e) => handleCostRangeFilter({ ...costRange, min: e.target.value })}
                      className="w-24"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={costRange.max}
                      onChange={(e) => handleCostRangeFilter({ ...costRange, max: e.target.value })}
                      className="w-24"
                    />
                  </div>
                  <Slider
                    min={ranges.cost.min}
                    max={ranges.cost.max}
                    step={(ranges.cost.max - ranges.cost.min) / 100}
                    value={[
                      parseFloat(costRange.min || ranges.cost.min),
                      parseFloat(costRange.max || ranges.cost.max)
                    ]}
                    onValueChange={([min, max]) => handleCostRangeFilter({ min: min.toString(), max: max.toString() })}
                    className="mt-2"
                  />
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </SearchAndFilters>

      <FilterBar
        rowHeight={rowHeight}
        onRowHeightChange={setRowHeight}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeFilter}
        co2Range={co2Range}
        onCo2RangeChange={handleCo2RangeFilter}
        costRange={costRange}
        onCostRangeChange={handleCostRangeFilter}
        ranges={ranges}
        siteFilters={siteFilters}
        onSiteFilter={handleSiteFilter}
        statusFilters={statusFilters}
        onStatusFilter={handleStatusFilter}
        scopeFilters={scopeFilters}
        onScopeFilter={handleScopeFilter}
        uniqueSites={uniqueSites}
        uniqueStatuses={uniqueStatuses}
        uniqueScopes={uniqueScopes}
      />

      <GroupingBar
        grouping={grouping}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onRemoveGrouping={removeGrouping}
        getColumnHeader={(columnId) => {
          const column = table.getColumn(columnId)
          return typeof column?.columnDef?.header === 'function' 
            ? columnId 
            : column?.columnDef?.header || columnId
        }}
      />

      <div className="w-full relative">
        <div className="flex w-full">
          <DataTable
            table={table}
            rowHeight={rowHeight}
            onRowClick={handleRowClick}
            selectedRowId={selectedRow?.id}
            onDragStart={onDragStart}
          />


          {/* Disabled */}
{/* 
          <DetailPanel
            isOpen={isDetailViewOpen}
            onClose={() => setIsDetailViewOpen(false)}
            selectedRow={selectedRow}
            onPrevious={handlePreviousRecord}
            onNext={handleNextRecord}
          /> */}


        </div>
        <Pagination
          table={table}
          pageSize={pageSize}
          onPageSizeChange={size => table.setPageSize(size)}
        />
      </div>
    </div>
  )
}

