import { X } from 'lucide-react'

export function GroupingBar({
  grouping,
  onDragOver,
  onDrop,
  onRemoveGrouping,
  getColumnHeader
}) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 py-2">
        <div 
          className="min-h-[40px] border-2 border-dashed border-gray-200 rounded-md p-2 flex gap-2 items-center"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {grouping.length === 0 ? (
            <span className="text-sm text-gray-500">Drag columns here to group by them</span>
          ) : (
            grouping.map(columnId => {
              const header = getColumnHeader(columnId)
              if (!header) return null
              return (
                <div
                  key={columnId}
                  className="bg-gray-100 rounded px-2 py-1 text-sm flex items-center gap-1"
                >
                  <span>{header}</span>
                  <button
                    onClick={() => onRemoveGrouping(columnId)}
                    className="hover:bg-gray-200 rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
} 