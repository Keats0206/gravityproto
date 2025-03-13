import { flexRender } from '@tanstack/react-table'
import { ChevronRightIcon, GripHorizontal, MoreHorizontal, ArrowUp, ArrowDown, ChevronDown, EyeOff, Pin, Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check } from "lucide-react"

export function DataTable({ 
  table, 
  rowHeight,
  onRowClick,
  selectedRowId,
  onDragStart,
  grouping,
  onDrop
}) {
  return (
    <div className="flex-1 overflow-x-auto">
      <div className="w-full bg-white">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className={`bg-[#f5f3f0]/50 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap ${
                      rowHeight === 'compact' ? 'py-1' :
                      rowHeight === 'relaxed' ? 'py-3' : 'py-2'
                    }`}
                    draggable={!['select', 'expander'].includes(header.column.id)}
                    onDragStart={(e) => onDragStart(e, header.column.id)}
                  >
                    <div className="flex items-center gap-2">
                      {!['select', 'expander'].includes(header.column.id) && (
                        <GripHorizontal className="h-4 w-4 rounded-xl text-gray-400 cursor-grab" />
                      )}
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className={`p-1 ${header.column.getIsSorted() ? 'text-gray-900' : 'text-gray-400'}`}
                        >
                          {{
                            asc: <ArrowUp className="h-4 w-4" />,
                            desc: <ArrowDown className="h-4 w-4" />,
                          }[header.column.getIsSorted()] ?? <ChevronDown className="h-4 w-4" />}
                        </button>
                      )}
                      {['site', 'status', 'scope'].includes(header.column.id) && (
                        <Popover modal={false}>
                          <PopoverTrigger asChild>
                            <button className="p-1 hover:bg-gray-100 rounded-full">
                              <Filter className="h-4 w-4 text-gray-500" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder={`Search ${header.column.columnDef.header}...`} />
                              <CommandEmpty>No results found.</CommandEmpty>
                              <CommandGroup>
                                {Array.from(new Set(table.getCoreRowModel().rows.map(row => row.getValue(header.column.id)))).map((value) => (
                                  <CommandItem
                                    key={value}
                                    onSelect={() => {
                                      const filterValue = header.column.getFilterValue() || []
                                      const newFilterValue = filterValue.includes(value)
                                        ? filterValue.filter(v => v !== value)
                                        : [...filterValue, value]
                                      header.column.setFilterValue(newFilterValue.length ? newFilterValue : undefined)
                                    }}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span>{value}</span>
                                      {header.column.getFilterValue()?.includes(value) && (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                      {!['select', 'expander', 'actions'].includes(header.column.id) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-gray-100 rounded-full">
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem
                              onClick={() => header.column.toggleSorting(false)}
                              className="flex items-center gap-2"
                            >
                              <ArrowUp className="h-4 w-4" />
                              Sort Ascending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => header.column.toggleSorting(true)}
                              className="flex items-center gap-2"
                            >
                              <ArrowDown className="h-4 w-4" />
                              Sort Descending
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => header.column.toggleVisibility(false)}
                              className="flex items-center gap-2"
                            >
                              <EyeOff className="h-4 w-4" />
                              Hide Column
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const columnId = header.column.id
                                if (!grouping.includes(columnId)) {
                                  onDrop({ preventDefault: () => {}, dataTransfer: { getData: () => columnId } })
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <Pin className="h-4 w-4" />
                              Group by {header.column.columnDef.header}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id} 
                onClick={() => !row.getIsGrouped() && onRowClick(row)}
                className={`transition-colors hover:bg-[#f5f3f0]/50 duration-200 ${
                  !row.getIsGrouped() ? 'cursor-pointer' : ''
                } ${
                  selectedRowId === row.original?.id ? 'bg-[#f5f3f0]' : ''
                }`}
                style={{
                  backgroundColor: row.getIsGrouped() ? '#f5f3f0' : undefined,
                }}
              >
                {row.getVisibleCells().map(cell => {
                  // Handle grouped cells
                  if (cell.getIsGrouped()) {
                    return (
                      <td
                        key={cell.id}
                        colSpan={row.getVisibleCells().length}
                        className={`px-4 py-2 text-sm font-medium ${
                          rowHeight === 'compact' ? 'py-1' :
                          rowHeight === 'relaxed' ? 'py-3' : 'py-2'
                        }`}
                        style={{
                          paddingLeft: `${row.depth * 2}rem`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            {...{
                              onClick: row.getToggleExpandedHandler(),
                              className: 'p-1',
                            }}
                          >
                            <ChevronRightIcon
                              className={`h-4 w-4 transition-transform ${
                                row.getIsExpanded() ? 'rotate-90' : ''
                              }`}
                            />
                          </button>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}{' '}
                          <span className="text-gray-500">
                            ({row.subRows.length} items)
                          </span>
                        </div>
                      </td>
                    )
                  }
                  // Handle aggregated cells
                  if (cell.getIsAggregated()) {
                    return (
                      <td 
                        key={cell.id} 
                        className={`px-4 text-sm font-medium ${
                          rowHeight === 'compact' ? 'py-1' :
                          rowHeight === 'relaxed' ? 'py-3' : 'py-2'
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.aggregatedCell ??
                            cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )
                  }
                  // Skip placeholder cells
                  if (cell.getIsPlaceholder()) {
                    return null
                  }
                  // Regular cells
                  return (
                    <td 
                      key={cell.id} 
                      className={`px-4 text-sm text-gray-800 whitespace-nowrap ${
                        cell.column.id === 'select' ? 'w-[40px]' : ''
                      } ${
                        rowHeight === 'compact' ? 'py-1' :
                        rowHeight === 'relaxed' ? 'py-3' : 'py-2'
                      }`}
                      style={{
                        paddingLeft: cell.column.id === row.getVisibleCells()[0].column.id 
                          ? `${row.depth * 2}rem`
                          : undefined,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 