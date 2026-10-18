import { Link, Navigate, useLocation, useParams } from 'react-router'
import { ErrorAlert } from '../components/Alert'
import { ApiError } from '../lib/api'
import { formatCurrency, formatDateTime } from '../lib/format'
import { useOrder } from '../orders/queries'
import { StatusActions } from '../orders/StatusActions'
import { StatusBadge } from '../orders/StatusBadge'
import type { Order } from '../orders/types'

export function OrderDetailPage() {
  const id = Number(useParams().id)
  if (!Number.isInteger(id) || id <= 0) return <Navigate to="/" replace />

  return <OrderDetail key={id} id={id} />
}

function OrderDetail({ id }: { id: number }) {
  const { data: order, isPending, isError, error } = useOrder(id)
  const justCreated = (useLocation().state as { created?: boolean } | null)?.created

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
        ← Voltar para pedidos
      </Link>

      {isPending && <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />}

      {isError && (
        <ErrorAlert
          message={error instanceof ApiError && error.status === 404 ? `Pedido #${id} não encontrado.` : error.message}
        />
      )}

      {order && (
        <>
          {justCreated && (
            <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Pedido criado com sucesso.
            </div>
          )}
          <OrderDetails order={order} />
        </>
      )}
    </section>
  )
}

function OrderDetails({ order }: { order: Order }) {
  const address = order.deliveryAddress

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedido #{order.id}</h1>
          <p className="mt-1 text-xs text-slate-500">
            Criado em {formatDateTime(order.createdAt)} · Atualizado em {formatDateTime(order.updatedAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <StatusActions order={order} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Cliente</h2>
          <p className="mt-2 font-medium">{order.customerName}</p>
          {order.customerPhone && <p className="text-sm text-slate-600">{order.customerPhone}</p>}
        </div>
        <div>
          <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Endereço de entrega</h2>
          <p className="mt-2 text-sm text-slate-700">
            {address.street}, {address.number}
            {address.complement && ` · ${address.complement}`}
            <br />
            {address.neighborhood} · {address.city}/{address.state}
            <br />
            CEP {address.zipCode}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Itens</h2>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="py-2 font-medium">Produto</th>
              <th className="py-2 text-right font-medium">Qtd.</th>
              <th className="py-2 text-right font-medium">Preço unit.</th>
              <th className="py-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-2">{item.productName}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2 text-right">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="pt-3 text-right font-medium">
                Total
              </td>
              <td className="pt-3 text-right text-base font-semibold">{formatCurrency(order.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
