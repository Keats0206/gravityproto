import { AlignJustify, AlignCenter, Table, Calendar, Building2, Activity, Target, DollarSign, Gauge } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

export function FilterBar({ 
  rowHeight, 
  onRowHeightChange,
  dateRange,
  onDateRangeChange,
  co2Range,
  onCo2RangeChange,
  costRange,
  onCostRangeChange,
  ranges,
  siteFilters,
  onSiteFilter,
  statusFilters,
  onStatusFilter,
  scopeFilters,
  onScopeFilter,
  uniqueSites,
  uniqueStatuses,
  uniqueScopes
}) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 py-2">
        <div className="flex items-center gap-2">
          <ToggleGroup 
            type="single" 
            value={rowHeight}
            onValueChange={onRowHeightChange}
          >
            <ToggleGroupItem value="compact" aria-label="Compact View">
              <AlignJustify className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="normal" aria-label="Normal View">
              <AlignCenter className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="relaxed" aria-label="Relaxed View">
              <Table className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="h-6 w-px bg-gray-200" />

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Site
                {siteFilters?.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {siteFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2">
              <div className="flex flex-col gap-1">
                {uniqueSites?.map(site => (
                  <Button
                    key={site}
                    variant={siteFilters?.includes(site) ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => onSiteFilter(site)}
                  >
                    {site}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Status
                {statusFilters?.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {statusFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2">
              <div className="flex flex-col gap-1">
                {uniqueStatuses?.map(status => (
                  <Button
                    key={status}
                    variant={statusFilters?.includes(status) ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => onStatusFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Scope
                {scopeFilters?.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {scopeFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2">
              <div className="flex flex-col gap-1">
                {uniqueScopes?.map(scope => (
                  <Button
                    key={scope}
                    variant={scopeFilters?.includes(scope) ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => onScopeFilter(scope)}
                  >
                    {scope}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Date
                {dateRange?.from && dateRange?.to && (
                  <Badge variant="secondary">Active</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Gauge className="h-4 w-4" />
                CO2e
                {co2Range?.min !== '' && co2Range?.max !== '' && (
                  <Badge variant="secondary">Active</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={co2Range?.min}
                    onChange={(e) => onCo2RangeChange({ ...co2Range, min: e.target.value })}
                    className="w-24"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={co2Range?.max}
                    onChange={(e) => onCo2RangeChange({ ...co2Range, max: e.target.value })}
                    className="w-24"
                  />
                </div>
                <Slider
                  min={ranges?.co2?.min}
                  max={ranges?.co2?.max}
                  step={(ranges?.co2?.max - ranges?.co2?.min) / 100}
                  value={[
                    parseFloat(co2Range?.min || ranges?.co2?.min),
                    parseFloat(co2Range?.max || ranges?.co2?.max)
                  ]}
                  onValueChange={([min, max]) => onCo2RangeChange({ min: min.toString(), max: max.toString() })}
                />
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Cost
                {costRange?.min !== '' && costRange?.max !== '' && (
                  <Badge variant="secondary">Active</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={costRange?.min}
                    onChange={(e) => onCostRangeChange({ ...costRange, min: e.target.value })}
                    className="w-24"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={costRange?.max}
                    onChange={(e) => onCostRangeChange({ ...costRange, max: e.target.value })}
                    className="w-24"
                  />
                </div>
                <Slider
                  min={ranges?.cost?.min}
                  max={ranges?.cost?.max}
                  step={(ranges?.cost?.max - ranges?.cost?.min) / 100}
                  value={[
                    parseFloat(costRange?.min || ranges?.cost?.min),
                    parseFloat(costRange?.max || ranges?.cost?.max)
                  ]}
                  onValueChange={([min, max]) => onCostRangeChange({ min: min.toString(), max: max.toString() })}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
} 