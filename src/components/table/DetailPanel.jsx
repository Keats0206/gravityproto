import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export function DetailPanel({
  isOpen,
  onClose,
  selectedRow,
  onPrevious,
  onNext
}) {
  return (
    <div className={`absolute z-10 w-[500px] bg-white border-l border-gray-200 sticky top-12 h-auto overflow-y-scroll transition-all duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-full hidden'
    }`}>
      <div>
        <div className="p-2 flex justify-between items-center mb-2 bg-[#f5f3f0]/50">
          <h2 className="text-base font-semibold">
            {selectedRow ? selectedRow.description : 'Detail View'}
          </h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={onPrevious}
              className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={onNext}
              className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button 
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {selectedRow ? (
          <dl className="space-y-2 px-2 pb-2">
            {Object.entries(selectedRow).map(([key, value]) => {
              return (
                <div key={key} className="flex justify-between py-1 border-b border-gray-100">
                  <dt className="text-xs text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </dt>
                  <dd className="text-xs font-medium">
                    {key === 'status' ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        value === 'Pending Gravity QA' 
                          ? 'bg-sky-50 text-sky-700 border-sky-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {value}
                      </span>
                    ) : value?.toString() || '-'}
                  </dd>
                </div>
              );
            })}
          </dl>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a row to view details
          </div>
        )}
      </div>
    </div>
  )
} 