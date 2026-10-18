import { statusLabels } from './status'
import { ORDER_STATUSES, type OrderStatus } from './types'

type StatusFilterProps = {
  selected: OrderStatus | null
  counts: Record<OrderStatus, number>
  total: number
  onChange: (status: OrderStatus | null) => void
}

export function StatusFilter({ selected, counts, total, onChange }: StatusFilterProps) {
  const options: { value: OrderStatus | null; label: string; count: number }[] = [
    { value: null, label: 'Todos', count: total },
    ...ORDER_STATUSES.map((status) => ({ value: status, label: statusLabels[status], count: counts[status] })),
  ]

  return (
    <nav aria-label="Filtrar por status" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-2">
        {options.map((option) => {
          const active = option.value === selected
          return (
            <li key={option.label}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onChange(option.value)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition ${
                  active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {option.label}
                <span className={`text-xs ${active ? 'text-slate-300' : 'text-slate-400'}`}>{option.count}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
