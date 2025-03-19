'use client'

import { X, Filter, ChevronDown, ChevronRight, Check, Plus, Search, Settings2, Save, PlusCircle, GripHorizontal, ChevronLeft, CalendarIcon, ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { mockData } from './mockData'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Image from 'next/image'
import { format } from "date-fns"
import { CommandDialog } from "@/components/ui/command"

// Define types
interface FilterGroupProps {
  type: string;
  values: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  onRemove: () => void;
}

interface Column {
  id: string;
  name: string;
  visible: boolean;
  align?: 'right' | 'left';
  editable?: boolean;
  sortable?: boolean;
}

interface Row {
  id: number;
  site: string;
  description: string;
  measurement: string;
  tonsOfCO2e: number;
  startDate: string;
  endDate: string;
  status: string;
  assignedTo: string;
  tags: string;
  cost: number | null;
  scope: string;
  organization: string;
  progress: number;
  trend: number[];
  quality: number;
  team: { name: string; avatar: string }[];
  [key: string]: string | number | null | number[] | { name: string; avatar: string }[] | undefined;
}

interface View {
  name: string;
  filters: {
    [key: string]: string[];  // Match the Filters interface
  };
}

interface EditingCell {
  rowId: string;
  columnId: string;
}

interface HoveredCell {
  rowId: string;
  columnId: string;
}

interface Filters {
  [key: string]: string[];  // Simplify to just use string arrays for all filters
}

// Add new interface for column filters
interface ColumnFilters {
  [columnId: string]: Set<string | number>;
}

function ActiveFilterGroup({ type, values, selectedValues, onChange, onRemove }: FilterGroupProps) {
  const displayCount = 2 // Number of values to display before showing +N
  const selected = selectedValues || []
  const additionalCount = Math.max(0, selected.length - displayCount)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="px-2 border border-gray-200 rounded-md flex items-center gap-1 hover:bg-gray-50 p-1 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <button onClick={onRemove} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      ) : (
        <Filter className="h-4 w-4 text-gray-500" />
      )}
      <span className="text-sm font-medium">{type}</span>
      <span className="text-gray-500">is</span>
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              {selected.slice(0, displayCount).map(value => (
                <span key={value} className="bg-gray-100 px-2 py-0.5 rounded-md text-sm">
                  {value}
                </span>
              ))}
              {additionalCount > 0 && (
                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-sm">
                  +{additionalCount}
                </span>
              )}
              <ChevronDown className="h-3 w-3 text-gray-500" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder={`Search ${type.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {values.map(value => (
                  <CommandItem
                    key={value}
                    onSelect={() => {
                      if (selected.includes(value)) {
                        onChange(selected.filter(v => v !== value))
                      } else {
                        onChange([...selected, value])
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                        {selected.includes(value) && (
                          <Check className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <span>{value}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Add new components for data visualization
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-stone-100 rounded-full h-2">
      <div 
        className="bg-blue-300 h-2 rounded-full transition-all" 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

function QualityIndicator({ value }: { value: number }) {
  const dots = Array.from({ length: 10 }, (_, i) => {
    const color = i < value 
      ? i < 4 ? 'bg-red-300'
      : i < 7 ? 'bg-yellow-300'
      : 'bg-green-300'
      : 'bg-stone-200'
    return <div key={i} className={`w-2 h-2 rounded-full ${color}`} />
  })
  
  return (
    <div className="flex items-center gap-1">
      {dots}
      <span className="ml-2 text-sm text-stone-600">{value}</span>
    </div>
  )
}

function SparkLine({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min
  const points = data.map((value, index) => {
    const xCoord = (index / (data.length - 1)) * 100
    const yCoord = ((value - min) / range) * 100
    return `${xCoord},${yCoord}`
  }).join(' ')

  return (
    <div className="w-24 h-8">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-300"
        />
      </svg>
    </div>
  )
}

function TeamAvatars({ team }: { team: { name: string; avatar: string }[] }) {
  return (
    <div className="flex items-center -space-x-2">
      {team.map((member) => (
        <div 
          key={member.name}
          className="relative rounded-full w-8 h-8 border-2 border-white bg-stone-100 flex items-center justify-center overflow-hidden hover:z-10"
          title={member.name}
        >
          {member.avatar ? (
            <Image 
              src={member.avatar} 
              alt={member.name} 
              width={32} 
              height={32} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span className="text-xs font-medium text-stone-600">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [viewName, setViewName] = useState<string>('Default View')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isCreateViewOpen, setIsCreateViewOpen] = useState<boolean>(false)
  const [newViewName, setNewViewName] = useState<string>('')
  const [isCreatingView, setIsCreatingView] = useState<boolean>(false)
  const [commandOpen, setCommandOpen] = useState<boolean>(false)
  const [savedViews, setSavedViews] = useState<View[]>([
    { 
      name: 'Default View', 
      filters: {
        site: [],
        status: [],
        scope: [],
        organization: [],
        description: [],
        measurement: [],
        tonsOfCO2e: [],
        progress: [],
        quality: [],
        assignedTo: []
      }
    },
    { 
      name: 'High Emissions', 
      filters: {
        site: [],
        status: [],
        scope: ['Scope 1'],
        organization: [],
        description: [],
        measurement: [],
        tonsOfCO2e: [],
        progress: [],
        quality: [],
        assignedTo: []
      }
    },
    { 
      name: 'Site Overview', 
      filters: {
        site: ['Site A'],
        status: [],
        scope: [],
        organization: [],
        description: [],
        measurement: [],
        tonsOfCO2e: [],
        progress: [],
        quality: [],
        assignedTo: []
      }
    }
  ])
  const [filters, setFilters] = useState<Filters>({
    site: [],
    status: [],
    scope: [],
    organization: [],
    description: [],
    measurement: [],
    tonsOfCO2e: [],
    progress: [],
    quality: [],
    assignedTo: [],
  })

  // Get unique values for filter options
  const filterOptions = {
    site: [...new Set((mockData || []).map(d => d?.site || ''))].filter(Boolean),
    status: [...new Set((mockData || []).map(d => d?.status || ''))].filter(Boolean),
    scope: [...new Set((mockData || []).map(d => d?.scope || ''))].filter(Boolean),
    organization: [...new Set((mockData || []).map(d => d?.organization || ''))].filter(Boolean)
  }

  // State variables
  const [modifiedData, setModifiedData] = useState<Row[]>(mockData as Row[])
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [activeDateCell, setActiveDateCell] = useState<{ rowId: string; columnId: string } | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  // Start editing
  const startEditing = (rowId: string, columnId: string) => {
    const column = columns.find(col => col.id === columnId)
    if (!column?.editable) return
    
    if (columnId === 'startDate' || columnId === 'endDate') {
      // Toggle the date picker if clicking the same cell
      if (showDatePicker && activeDateCell?.rowId === rowId && activeDateCell?.columnId === columnId) {
        setShowDatePicker(false)
        setActiveDateCell(null)
      } else {
        setShowDatePicker(true)
        setActiveDateCell({ rowId, columnId })
      }
    } else {
      setEditingCell({ rowId, columnId })
    }
  }

  // Update save edit function
  const saveEdit = (rowId: string, columnId: string, value: string | number | null) => {
    setModifiedData(currentData => 
      currentData.map(row => 
        row.id.toString() === rowId ? { ...row, [columnId]: value } : row
      )
    )
    setEditingCell(null)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, rowId: string, columnId: string, value: string) => {
    if (e.key === 'Enter') {
      saveEdit(rowId, columnId, value)
    } else if (e.key === 'Escape') {
      setEditingCell(null)
    }
  }

  // Add sorting function
  const sortData = (data: Row[]) => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

      // Handle different types of values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }

      // Convert to strings for string comparison
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (aString < bString) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aString > bString) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Update filtered data logic
  const filteredData = sortData(modifiedData.filter(row => {
    // Check all active filters
    for (const [columnId, activeFilters] of Object.entries(filters)) {
      if (activeFilters.length > 0) {
        const value = row[columnId];
        if (value !== undefined && value !== null) {
          if (!activeFilters.includes(value.toString())) return false;
        }
      }
    }
    return true;
  }));

  // Handle column sort
  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;

    setSortConfig(current => {
      if (current?.key === columnId) {
        if (current.direction === 'asc') {
          return { key: columnId, direction: 'desc' };
        }
        return null;
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0)

  // Remove a filter group
  const removeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      [type.toLowerCase()]: []
    }))
  }

  // Toggle a filter value
  const toggleFilter = (type: string, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [type.toLowerCase()]: checked 
        ? [...prev[type.toLowerCase()], value]
        : prev[type.toLowerCase()].filter(v => v !== value)
    }))
  }

  // Check if current filters differ from the saved view
  const hasUnsavedChanges = () => {
    const currentView = savedViews.find(view => view.name === viewName)
    if (!currentView) return true
    return JSON.stringify(currentView.filters) !== JSON.stringify(filters)
  }

  // Save current view
  const saveCurrentView = () => {
    setSavedViews(views => views.map(view => 
      view.name === viewName ? { ...view, filters: { ...filters } } : view
    ))
  }

  // Create new view
  const createNewView = () => {
    if (!newViewName.trim()) return
    setSavedViews(views => [...views, { name: newViewName, filters: { ...filters } }])
    setViewName(newViewName)
    setNewViewName('')
    setCommandOpen(false)
  }

  // Load view
  const loadView = (view: View) => {
    setViewName(view.name)
    setFilters(view.filters)
  }

  // Add column configuration state
  const [columns, setColumns] = useState<Column[]>([
    { id: 'description', name: 'Description', visible: true, editable: false, sortable: true },
    { id: 'measurement', name: 'Measurement', visible: true, align: 'right', editable: true, sortable: true },
    { id: 'tonsOfCO2e', name: 'Emissions (tCO2e)', visible: true, align: 'right', editable: true, sortable: true },
    { id: 'progress', name: 'Progress', visible: true, editable: false, sortable: true },
    { id: 'trend', name: 'Trend', visible: true, editable: false, sortable: false },
    { id: 'quality', name: 'Quality', visible: true, editable: false, sortable: true },
    { id: 'team', name: 'Team', visible: true, editable: false, sortable: false },
    { id: 'status', name: 'Status', visible: true, editable: true, sortable: true },
    { id: 'startDate', name: 'Start Date', visible: true, editable: true, sortable: true },
    { id: 'endDate', name: 'End Date', visible: true, editable: true, sortable: true },
    { id: 'assignedTo', name: 'Email', visible: true, editable: true, sortable: true }
  ])

  // Column drag state
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)

  // Handle column drag start
  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId)
  }

  // Handle column drag over
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    if (!draggedColumn || draggedColumn === columnId) return

    const draggedIdx = columns.findIndex(col => col.id === draggedColumn)
    const targetIdx = columns.findIndex(col => col.id === columnId)

    if (draggedIdx === targetIdx) return

    const newColumns = [...columns]
    const [draggedCol] = newColumns.splice(draggedIdx, 1)
    newColumns.splice(targetIdx, 0, draggedCol)
    setColumns(newColumns)
  }

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnId: string) => {
    setColumns(cols => cols.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ))
  }

  // Cell editor component
  const CellEditor = ({ row, column }: { row: Row; column: Column }) => {
    const value = row[column.id]
    const stringValue = typeof value === 'string' ? value : value?.toString() || ''
    
    switch (column.id) {
      case 'status':
        const statusStyles: Record<string, string> = {
          'Needs Attention': 'bg-red-100 text-red-500 hover:bg-red-200',
          'Needs Review': 'bg-red-100 text-red-500 hover:bg-red-200',
          'Pending Gravity QA': 'bg-blue-100 text-blue-400 hover:bg-blue-200',
          'Healthy Data': 'bg-green-100 text-green-500 hover:bg-green-200'
        }
        const defaultStyle = 'bg-stone-100 text-stone-900 hover:bg-stone-200'
        const pillStyle = statusStyles[row.status] || defaultStyle
        
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant="secondary"
                  className={`cursor-pointer ${pillStyle}`}
                >
                  {row.status}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[200px]">
                {Object.keys(statusStyles).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onSelect={() => {
                      saveEdit(row.id.toString(), column.id, status)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={statusStyles[status]}>
                        {status}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      
      case 'startDate':
      case 'endDate':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-8",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value as string), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value as string) : undefined}
                onSelect={(date) => {
                  if (date) {
                    saveEdit(row.id.toString(), column.id, date.toISOString())
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )
      
      case 'measurement':
      case 'tonsOfCO2e':
        const numValue = typeof value === 'number' ? value : parseFloat(value as string) || 0
        return (
          <Input
            type="number"
            defaultValue={numValue}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, row.id.toString(), column.id, e.currentTarget.value)}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => saveEdit(row.id.toString(), column.id, parseFloat(e.target.value) || 0)}
            className="h-8"
            autoFocus
          />
        )
      
      default:
        return (
          <Input
            defaultValue={stringValue}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, row.id.toString(), column.id, e.currentTarget.value)}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => saveEdit(row.id.toString(), column.id, e.target.value)}
            className="h-8"
            autoFocus
          />
        )
    }
  }

  // Enhanced cell renderer
  const renderCell = (row: Row, column: Column) => {
    const isEditing = editingCell?.rowId === row.id.toString() && editingCell?.columnId === column.id
    const isHovered = hoveredCell?.rowId === row.id.toString() && hoveredCell?.columnId === column.id
    const value = row[column.id]
    const isSortedColumn = sortConfig?.key === column.id
    
    const handleCellClick = () => {
      if (!isEditing && column.editable) {
        startEditing(row.id.toString(), column.id)
      }
    }
    
    const cellContent = () => {
      if (isEditing && column.editable) {
        return <CellEditor row={row} column={column} />
      }

      switch (column.id) {
        case 'status':
          const statusStyles: Record<string, string> = {
            'Needs Attention': 'bg-red-100 text-red-500 hover:bg-red-200',
            'Needs Review': 'bg-red-100 text-red-500 hover:bg-red-200',
            'Pending Gravity QA': 'bg-blue-100 text-blue-500 hover:bg-blue-200',
            'Healthy Data': 'bg-green-100 text-green-500 hover:bg-green-200'
          }
          const defaultStyle = 'bg-stone-100 text-stone-900 hover:bg-stone-200'
          const pillStyle = statusStyles[row.status] || defaultStyle
          
          return (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge
                    variant="secondary"
                    className={`cursor-pointer ${pillStyle}`}
                  >
                    {row.status}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[200px]">
                  {Object.keys(statusStyles).map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onSelect={() => {
                        saveEdit(row.id.toString(), column.id, status)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={statusStyles[status]}>
                          {status}
                        </Badge>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        case 'progress':
          return <ProgressBar value={row.progress} />
        case 'trend':
          return <SparkLine data={row.trend} />
        case 'quality':
          return <QualityIndicator value={row.quality} />
        case 'team':
          return <TeamAvatars team={row.team} />
        case 'startDate':
        case 'endDate':
          return (
            <Popover open={showDatePicker && activeDateCell?.rowId === row.id.toString() && activeDateCell?.columnId === column.id}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-normal h-8",
                    !value && "text-muted-foreground",
                    "hover:bg-transparent"
                  )}
                  onClick={() => startEditing(row.id.toString(), column.id)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value as string), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value as string) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      saveEdit(row.id.toString(), column.id, date.toISOString())
                      setShowDatePicker(false)
                      setActiveDateCell(null)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )
        case 'measurement':
        case 'tonsOfCO2e':
          return <div className="text-right font-medium">{(value as number).toLocaleString()}</div>
        case 'description':
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-stone-600">
                  {row.assignedTo.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium">{row.description}</div>
                <div className="text-sm text-stone-500">{row.organization}</div>
              </div>
            </div>
          )
        default:
          if (typeof value === 'string' || typeof value === 'number') {
            return value.toString()
          }
          return ''
      }
    }

    return (
      <div 
        className={cn(
          "relative overflow-hidden",
          column.editable ? "cursor-pointer" : "cursor-default",
          isHovered && column.editable ? "p-2 -m-2 rounded bg-stone-200 transition-all duration-300" : "p-0 m-0",
          column.align === 'right' ? "text-right font-medium" : "text-left",
          isSortedColumn && "bg-blue-50/50",
          column.id === 'description' && "min-w-[300px]",
          column.id === 'status' && "min-w-[150px]",
          column.id === 'team' && "min-w-[180px]",
          column.id === 'trend' && "min-w-[120px]",
          column.id === 'quality' && "min-w-[180px]",
          column.id === 'progress' && "min-w-[150px]"
        )}
        onMouseEnter={() => column.editable && setHoveredCell({ rowId: row.id.toString(), columnId: column.id })}
        onMouseLeave={() => setHoveredCell(null)}
        onClick={handleCellClick}
      >
        {cellContent()}
      </div>
    )
  }

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const pageSizeOptions = [10, 20, 50, 100]

  // Calculate pagination
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const currentData = filteredData.slice(startIndex, endIndex)

  // Navigation helpers
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  return (
    <main className="p-4">
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold">Table Prototype</span>
            <span className="text-sm text-gray-500">Showing {filteredData.length} of {mockData.length} rows</span>
          </div>

          {/* Table Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border rounded-lg px-2 py-1.5">
              <span className="text-sm text-gray-500">View</span>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm">
                  {viewName}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {savedViews.map(view => (
                    <DropdownMenuItem key={view.name} onClick={() => loadView(view)}>
                      {view.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    setCommandOpen(true)
                    setIsCreatingView(true)
                  }}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {hasUnsavedChanges() && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={saveCurrentView}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Settings2 className="h-4 w-4" />
                  Modify Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col gap-1 p-2">
                  <div className="flex items-center justify-between px-2 py-1 text-sm text-stone-600">
                    <span>Column Order & Visibility</span>
                  </div>
                  {columns.map((column, index) => (
                    <div
                      key={column.id}
                      className={cn(
                        "text-sm flex items-center justify-between gap-2 px-2 py-1.5 rounded-md",
                        draggedColumn === column.id && "opacity-50",
                        "hover:bg-stone-100"
                      )}
                    >
                      <div 
                        className="flex items-center gap-2 flex-1"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleColumnVisibility(column.id)
                        }}
                      >
                        <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white cursor-pointer">
                          {column.visible && <Check className="h-3 w-3 text-primary" />}
                        </div>
                        <span className="cursor-pointer">{column.name}</span>
                      </div>
                      <div
                        className="cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={() => handleDragStart(column.id)}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragEnd={() => setDraggedColumn(null)}
                      >
                        <GripHorizontal className="h-4 w-4 text-stone-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>Show Row Numbers</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>Compact Mode</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                    </div>
                    <span>Wrap Text</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                    </div>
                    <span>Show Grid Lines</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>Sticky Header</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Command Palette */}
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <CommandInput 
            placeholder={isCreatingView ? "Enter view name..." : "Search views..."} 
            value={isCreatingView ? newViewName : ""}
            onValueChange={(value) => isCreatingView ? setNewViewName(value) : null}
            onKeyDown={(e) => {
              if (isCreatingView && e.key === 'Enter') {
                createNewView()
              }
            }}
          />
          <CommandList>
            {isCreatingView ? (
              <div className="flex items-center justify-end gap-2 p-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsCreatingView(false)
                    setNewViewName('')
                    setCommandOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={createNewView}
                >
                  Create View
                </Button>
              </div>
            ) : (
              <>
                <CommandEmpty>No views found.</CommandEmpty>
                {savedViews.map(view => (
                  <CommandItem
                    key={view.name}
                    onSelect={() => {
                      loadView(view)
                      setCommandOpen(false)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                        {view.name === viewName && <Check className="h-3 w-3 text-primary" />}
                      </div>
                      <span>{view.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </CommandDialog>

        <div className="flex flex-wrap items-center gap-3 rounded-lg min-h-12">
          {/* Filter Menu */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md">
                <Plus className="h-4 w-4" />
                Filter
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {/* Site Filter */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Site</span>
                      {filters.site.length > 0 && (
                        <span className="text-xs bg-gray-100 px-1.5 rounded-full">{filters.site.length}</span>
                      )}
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search sites..." />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {filterOptions.site.map(option => (
                          <CommandItem
                            key={option}
                            onSelect={() => {
                              if (filters.site.includes(option)) {
                                toggleFilter('site', option, false)
                              } else {
                                toggleFilter('site', option, true)
                              }
                            }}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                                {filters.site.includes(option) && (
                                  <Check className="h-3 w-3 text-primary" />
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Status Filter */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Status</span>
                      {filters.status.length > 0 && (
                        <span className="text-xs bg-gray-100 px-1.5 rounded-full">{filters.status.length}</span>
                      )}
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search status..." />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {filterOptions.status.map(option => (
                          <CommandItem
                            key={option}
                            onSelect={() => {
                              if (filters.status.includes(option)) {
                                toggleFilter('status', option, false)
                              } else {
                                toggleFilter('status', option, true)
                              }
                            }}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                                {filters.status.includes(option) && (
                                  <Check className="h-3 w-3 text-primary" />
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Scope Filter */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Scope</span>
                      {filters.scope.length > 0 && (
                        <span className="text-xs bg-gray-100 px-1.5 rounded-full">{filters.scope.length}</span>
                      )}
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search scope..." />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {filterOptions.scope.map(option => (
                          <CommandItem
                            key={option}
                            onSelect={() => {
                              if (filters.scope.includes(option)) {
                                toggleFilter('scope', option, false)
                              } else {
                                toggleFilter('scope', option, true)
                              }
                            }}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                                {filters.scope.includes(option) && (
                                  <Check className="h-3 w-3 text-primary" />
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Organization Filter */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Organization</span>
                      {filters.organization.length > 0 && (
                        <span className="text-xs bg-gray-100 px-1.5 rounded-full">{filters.organization.length}</span>
                      )}
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search organizations..." />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {filterOptions.organization.map(option => (
                          <CommandItem
                            key={option}
                            onSelect={() => {
                              if (filters.organization.includes(option)) {
                                toggleFilter('organization', option, false)
                              } else {
                                toggleFilter('organization', option, true)
                              }
                            }}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                                {filters.organization.includes(option) && (
                                  <Check className="h-3 w-3 text-primary" />
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters */}
          {filters.site.length > 0 && (
            <ActiveFilterGroup
              type="Site"
              values={filterOptions.site}
              selectedValues={filters.site}
              onChange={(values) => setFilters(prev => ({ ...prev, site: values }))}
              onRemove={() => removeFilter('site')}
            />
          )}
          {filters.status.length > 0 && (
            <ActiveFilterGroup
              type="Status"
              values={filterOptions.status}
              selectedValues={filters.status}
              onChange={(values) => setFilters(prev => ({ ...prev, status: values }))}
              onRemove={() => removeFilter('status')}
            />
          )}
          {filters.scope.length > 0 && (
            <ActiveFilterGroup
              type="Scope"
              values={filterOptions.scope}
              selectedValues={filters.scope}
              onChange={(values) => setFilters(prev => ({ ...prev, scope: values }))}
              onRemove={() => removeFilter('scope')}
            />
          )}
          {filters.organization.length > 0 && (
            <ActiveFilterGroup
              type="Organization"
              values={filterOptions.organization}
              selectedValues={filters.organization}
              onChange={(values) => setFilters(prev => ({ ...prev, organization: values }))}
              onRemove={() => removeFilter('organization')}
            />
          )}
          {/* Column Filters */}
          {columns.filter(col => col.visible).map(column => {
            const columnFilters = filters[column.id] || [];
            if (columnFilters.length === 0) return null;

            const options = Array.from(new Set(modifiedData.map(row => {
              const value = row[column.id];
              return value !== undefined && value !== null ? value.toString() : null;
            }).filter(Boolean)));

            return (
              <ActiveFilterGroup
                key={column.id}
                type={column.name}
                values={options}
                selectedValues={columnFilters}
                onChange={(values) => setFilters(prev => ({ ...prev, [column.id]: values }))}
                onRemove={() => setFilters(prev => ({ ...prev, [column.id]: [] }))}
              />
            );
          })}
          {hasActiveFilters && (
            <button
              onClick={() => setFilters({
                site: [],
                status: [],
                scope: [],
                organization: [],
                description: [],
                measurement: [],
                tonsOfCO2e: [],
                progress: [],
                quality: [],
                assignedTo: []
              })}
              className="flex items-center gap-1.5 text-xs text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
            >
              Clear all
            </button>
          )}
        </div>

      </div>

      <div className="text-sm overflow-x-auto bg-sand-0 border border-stone-200">
        <table className="w-full rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-stone-200 border-b border-stone-300">
              {columns.filter(col => col.visible).map(column => (
                <th
                  key={column.id}
                  className={cn(
                    "uppercase py-2 px-4 text-xs font-medium text-stone-600",
                    column.align === 'right' ? 'text-right' : 'text-left',
                    "min-w-[200px] group relative",
                    column.sortable && "cursor-pointer hover:bg-stone-200",
                    sortConfig?.key === column.id ? "bg-blue-100" : "bg-stone-200",
                    column.id === 'description' && "min-w-[300px]",
                    column.id === 'status' && "min-w-[150px]",
                    column.id === 'team' && "min-w-[180px]",
                    column.id === 'trend' && "min-w-[120px]",
                    column.id === 'quality' && "min-w-[180px]",
                    column.id === 'progress' && "min-w-[150px]"
                  )}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.filter-dropdown')) return;
                    handleSort(column.id);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{column.name}</span>
                    <div className="flex items-center gap-1">
                      {column.sortable && (
                        <div className={cn(
                          sortConfig?.key === column.id ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                          "transition-opacity",
                          "hover:bg-stone-300 rounded p-0.5 w-5 h-5 flex items-center justify-center"
                        )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSort(column.id);
                          }}
                        >
                          {sortConfig?.key === column.id ? (
                            <div className="text-blue-500 text-sm">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </div>
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-stone-500" />
                          )}
                        </div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className={cn(
                            "filter-dropdown",
                            filters[column.id]?.length > 0 
                              ? "opacity-100 bg-gray-200 border border-gray-300" 
                              : "opacity-0 group-hover:opacity-100",
                            "transition-opacity",
                            "hover:bg-stone-300 rounded p-0.5",
                            "data-[state=open]:opacity-100 data-[state=open]:bg-stone-300"
                          )}>
                            <div className="flex items-center gap-1">
                              <Filter className={cn(
                                "h-3 w-3",
                                filters[column.id]?.length > 0 ? "text-gray-700" : "text-stone-600"
                              )} />
                              {filters[column.id]?.length > 0 && (
                                <span className="text-xs bg-gray-100 px-1 rounded-full text-gray-700">
                                  {filters[column.id].length}
                                </span>
                              )}
                            </div>
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder={`Search ${column.name.toLowerCase()}...`} />
                            <CommandList>
                              <CommandEmpty>No results found.</CommandEmpty>
                              {Array.from(new Set(modifiedData.map(row => {
                                const value = row[column.id];
                                return value !== undefined && value !== null ? value.toString() : null;
                              }).filter(Boolean))).map((value) => (
                                <CommandItem
                                  key={value}
                                  onSelect={() => {
                                    const currentFilters = filters[column.id] || [];
                                    if (currentFilters.includes(value)) {
                                      setFilters(prev => ({
                                        ...prev,
                                        [column.id]: currentFilters.filter(v => v !== value)
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        [column.id]: [...currentFilters, value]
                                      }));
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                                      {filters[column.id]?.includes(value) && (
                                        <Check className="h-3 w-3 text-primary" />
                                      )}
                                    </div>
                                    <span>{value}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandList>
                          </Command>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className={cn(
                            "opacity-0 group-hover:opacity-100 transition-opacity",
                            "hover:bg-stone-300 rounded p-0.5",
                            "data-[state=open]:opacity-100 data-[state=open]:bg-stone-300"
                          )}>
                            <MoreHorizontal className="h-4 w-4 text-stone-600" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px]">
                          <DropdownMenuItem>
                            <div className="flex items-center gap-2">
                              <span>Hide Column</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <div className="flex items-center gap-2">
                              <span>Group by {column.name}</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <div className="flex items-center gap-2">
                              <span>Pin Column</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <div className="flex items-center gap-2">
                              <span>Add Column Left</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <div className="flex items-center gap-2">
                              <span>Add Column Right</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <div className="flex items-center gap-2">
                              <span>Duplicate Column</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">
                            <div className="flex items-center gap-2">
                              <span>Delete Column</span>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr key={row.id} className="hover:bg-stone-100">
                {columns.filter(col => col.visible).map(column => (
                  <td 
                    key={column.id} 
                    className={cn(
                      "py-3 px-4 whitespace-nowrap overflow-hidden",
                      sortConfig?.key === column.id && "bg-blue-50/50"
                    )}
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="border-t border-stone-200 px-4 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-sand-900">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="border border-sand-500 rounded px-2 py-1 bg-sand-0"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>
              {startIndex + 1}-{endIndex} of {totalItems}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={!canGoPrevious}
              className="px-2 border-sand-500 text-sand-900 hover:bg-sand-100"
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-2" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={!canGoPrevious}
              className="px-2 border-sand-500 text-sand-900 hover:bg-sand-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-2">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => goToPage(Number(e.target.value))}
                className="w-16 h-8"
              />
              <span className="text-gray-500">of {totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={!canGoNext}
              className="px-2 border-sand-500 text-sand-900 hover:bg-sand-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              disabled={!canGoNext}
              className="px-2 border-sand-500 text-sand-900 hover:bg-sand-100"
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}