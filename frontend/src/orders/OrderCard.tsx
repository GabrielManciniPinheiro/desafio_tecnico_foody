import { Link } from 'react-router'
import { formatCurrency, formatDateTime } from '../lib/format'
import { StatusActions } from './StatusActions'
import { StatusBadge } from './StatusBadge'
import type { Order } from './types'

export function OrderCard({ order }: { order: Order }) {
  const itemsSummary = order.items.map((item) => `${item.quantity}× ${item.productName}`).join(', ')

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/pedidos/${order.id}`} className="font-semibold hover:text-orange-600">
            Pedido #{order.id}
          </Link>
          <p className="truncate text-sm text-slate-600">{order.customerName}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{itemsSummary}</p>

      <div className="mt-3 flex items-end justify-between gap-3 text-sm">
        <span className="text-xs text-slate-500">
          {formatDateTime(order.createdAt)} · {order.deliveryAddress.neighborhood}
        </span>
        <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
      </div>

      <StatusActions order={order} className="mt-4 border-t border-slate-100 pt-4" />
    </article>
  )
}
