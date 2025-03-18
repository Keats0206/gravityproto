'use client'

import { Building2, X, Filter, ChevronDown, ChevronRight, Check, Plus, Search, Settings2, Save, PlusCircle, GripHorizontal, ChevronLeft, ChevronLastIcon, Pencil, CalendarIcon } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

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
  [key: string]: string | number | null | any[];
}

interface View {
  name: string;
  filters: {
    site: string[];
    status: string[];
    scope: string[];
    organization: string[];
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
  site: string[];
  status: string[];
  scope: string[];
  organization: string[];
  [key: string]: string[];
}

// Add date formatter helper
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
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
              {selected.slice(0, displayCount).map((value, i) => (
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
        className="bg-blue-500 h-2 rounded-full transition-all" 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

function QualityIndicator({ value }: { value: number }) {
  const dots = Array.from({ length: 10 }, (_, i) => {
    const color = i < value 
      ? i < 4 ? 'bg-red-400'
      : i < 7 ? 'bg-yellow-400'
      : 'bg-green-400'
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
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = ((value - min) / range) * 100
  }).join(' ')

  return (
    <div className="w-24 h-8">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-500"
        />
      </svg>
    </div>
  )
}

function TeamAvatars({ team }: { team: { name: string; avatar: string }[] }) {
  return (
    <div className="flex items-center -space-x-2">
      {team.map((member, i) => (
        <div 
          key={member.name}
          className="relative rounded-full w-8 h-8 border-2 border-white bg-stone-100 flex items-center justify-center overflow-hidden hover:z-10"
          title={member.name}
        >
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
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
  const [savedViews, setSavedViews] = useState<View[]>([
    { name: 'Default View', filters: { site: [], status: [], scope: [], organization: [] } },
    { name: 'High Emissions', filters: { site: [], status: [], scope: ['Scope 1'], organization: [] } },
    { name: 'Site Overview', filters: { site: ['Site A'], status: [], scope: [], organization: [] } }
  ])
  const [filters, setFilters] = useState<Filters>({
    site: [],
    status: [],
    scope: [],
    organization: []
  })

  // Get unique values for filter options
  const filterOptions = {
    site: [...new Set(mockData.map(d => d.site))],
    status: [...new Set(mockData.map(d => d.status))],
    scope: [...new Set(mockData.map(d => d.scope))],
    organization: [...new Set(mockData.map(d => d.organization))]
  }

  // Add modified data state
  const [modifiedData, setModifiedData] = useState<Row[]>(mockData as Row[])

  // Update save edit function
  const saveEdit = (rowId: string, columnId: string, value: any) => {
    setModifiedData(currentData => 
      currentData.map(row => 
        row.id.toString() === rowId ? { ...row, [columnId]: value } : row
      )
    )
    setEditingCell(null)
    setEditValue(null)
  }

  // Update filtered data to use modified data
  const filteredData = modifiedData.filter(row => {
    if (filters.site.length && !filters.site.includes(row.site)) return false
    if (filters.status.length && !filters.status.includes(row.status)) return false
    if (filters.scope.length && !filters.scope.includes(row.scope)) return false
    if (filters.organization.length && !filters.organization.includes(row.organization)) return false
    return true
  })

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
    setIsCreateViewOpen(false)
  }

  // Load view
  const loadView = (view: View) => {
    setViewName(view.name)
    setFilters(view.filters)
  }

  // Add column configuration state
  const [columns, setColumns] = useState<Column[]>([
    { id: 'description', name: 'Description', visible: true, editable: false },
    { id: 'measurement', name: 'Measurement', visible: true, align: 'right', editable: true },
    { id: 'tonsOfCO2e', name: 'Emissions (tCO2e)', visible: true, align: 'right', editable: true },
    { id: 'progress', name: 'Progress', visible: true, editable: false },
    { id: 'trend', name: 'Trend', visible: true, editable: false },
    { id: 'quality', name: 'Quality', visible: true, editable: false },
    { id: 'team', name: 'Team', visible: true, editable: false },
    { id: 'status', name: 'Status', visible: true, editable: true },
    { id: 'startDate', name: 'Start Date', visible: true, editable: true },
    { id: 'endDate', name: 'End Date', visible: true, editable: true },
    { id: 'assignedTo', name: 'Email', visible: true, editable: true }
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

  // Add edit state
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [editValue, setEditValue] = useState<any>(null)
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null)

  // Start editing
  const startEditing = (rowId: string, columnId: string, value: any) => {
    const column = columns.find(col => col.id === columnId)
    if (!column?.editable) return
    
    if (columnId === 'startDate' || columnId === 'endDate') {
      setDatePickerOpen({ rowId, columnId })
    } else {
      setEditingCell({ rowId, columnId })
      setEditValue(value)
    }
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue(null)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, rowId: string, columnId: string, value: string) => {
    if (e.key === 'Enter') {
      saveEdit(rowId, columnId, value)
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  // Add new state for date picker
  const [datePickerOpen, setDatePickerOpen] = useState<{ rowId: string; columnId: string } | null>(null)

  // Cell editor component
  const CellEditor = ({ row, column }: { row: Row; column: Column }) => {
    const value = row[column.id]
    
    switch (column.id) {
      case 'status':
        const statusStyles: Record<string, string> = {
          'Needs Attention': 'bg-red-100 text-red-600 hover:bg-red-200',
          'Needs Review': 'bg-red-100 text-red-600 hover:bg-red-200',
          'Pending Gravity QA': 'bg-blue-100 text-blue-600 hover:bg-blue-200',
          'Healthy Data': 'bg-green-100 text-green-600 hover:bg-green-200'
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
                variant={editingCell?.rowId === row.id.toString() && editingCell?.columnId === column.id ? "outline" : "ghost"}
                className={cn(
                  "w-full justify-start text-left font-normal h-8",
                  !value && "text-muted-foreground",
                  !editingCell && "hover:bg-transparent"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? formatDate(value as string) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={new Date(value as string)}
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
        return (
          <Input
            type="number"
            defaultValue={value?.toString() || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, row.id.toString(), column.id, e.currentTarget.value)}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => saveEdit(row.id.toString(), column.id, e.target.value)}
            className="h-8"
            autoFocus
          />
        )
      
      default:
        return (
          <Input
            defaultValue={value?.toString() || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
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
    
    const cellContent = () => {
      if (isEditing && column.editable) {
        return <CellEditor row={row} column={column} />
      }

      switch (column.id) {
        case 'status':
          const statusStyles: Record<string, string> = {
            'Needs Attention': 'bg-red-100 text-red-600 hover:bg-red-200',
            'Needs Review': 'bg-red-100 text-red-600 hover:bg-red-200',
            'Pending Gravity QA': 'bg-blue-100 text-blue-600 hover:bg-blue-200',
            'Healthy Data': 'bg-green-100 text-green-600 hover:bg-green-200'
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={isEditing ? "outline" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-8",
                    !row[column.id] && "text-muted-foreground",
                    !isEditing && "hover:bg-transparent"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {row[column.id] ? formatDate(row[column.id] as string) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(row[column.id] as string)}
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
          return <div className="text-right font-medium">{(row[column.id] as number).toLocaleString()}</div>
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
          return row[column.id]
      }
    }

    return (
      <div 
        className={cn(
          "relative overflow-hidden",
          column.editable ? "cursor-pointer" : "cursor-default",
          isHovered && column.editable ? "p-2 -m-2 rounded bg-gray-50" : "p-0 m-0",
          column.align === 'right' ? "text-right font-medium" : "text-left"
        )}
        onMouseEnter={() => column.editable && setHoveredCell({ rowId: row.id.toString(), columnId: column.id })}
        onMouseLeave={() => setHoveredCell(null)}
        onClick={() => !isEditing && column.editable && startEditing(row.id.toString(), column.id, row[column.id])}
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
                  <DropdownMenuItem onClick={() => setIsCreateViewOpen(true)}>
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
                <DropdownMenuItem>Show All Columns</DropdownMenuItem>
                <DropdownMenuItem>Hide All Columns</DropdownMenuItem>
                <DropdownMenuSeparator />
                {columns.map(column => (
                  <DropdownMenuItem
                    key={column.id}
                    onSelect={(e) => {
                      e.preventDefault()
                      toggleColumnVisibility(column.id)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-4 h-4 border rounded border-gray-300 bg-white">
                        {column.visible && <Check className="h-3 w-3 text-primary" />}
                      </div>
                      <span>{column.name}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
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

        {/* Create View Dialog */}
        <Dialog open={isCreateViewOpen} onOpenChange={setIsCreateViewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New View</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="viewName">View Name</Label>
              <Input
                id="viewName"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="Enter view name..."
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateViewOpen(false)}>Cancel</Button>
              <Button onClick={createNewView}>Create View</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                  {hasActiveFilters && (
              <button
                onClick={() => setFilters({ site: [], status: [], scope: [], organization: [] })}
                className="flex items-center gap-1.5 text-xs text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
              >
                Clear all
              </button>
            )}
        </div>

      </div>

      <div className="text-sm overflow-x-auto bg-sand-0">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-200 border-t border-b border-stone-300">
              {columns.filter(col => col.visible).map(column => (
                <th
                  key={column.id}
                  className={`uppercase py-2 px-4 text-xs font-medium text-stone-600 ${
                    column.align === 'right' ? 'text-right' : 'text-left'
                  } min-w-[150px] group cursor-move relative bg-stone-100`}
                  draggable
                  onDragStart={() => handleDragStart(column.id)}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragEnd={() => setDraggedColumn(null)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{column.name}</span>
                    <GripHorizontal className="h-4 w-4 text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr key={row.id} className="hover:bg-stone-100">
                {columns.filter(col => col.visible).map(column => (
                  <td key={column.id} className="py-3 px-4 whitespace-nowrap overflow-hidden">
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="border-sand-500 px-4 py-2 flex items-center justify-between gap-2">
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