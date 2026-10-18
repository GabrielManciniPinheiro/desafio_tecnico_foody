import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ErrorAlert } from '../components/Alert'
import { Button } from '../components/Button'
import { buttonClasses } from '../components/button-styles'
import { OrderCard } from '../orders/OrderCard'
import { useOrders } from '../orders/queries'
import { statusLabels } from '../orders/status'
import { StatusFilter } from '../orders/StatusFilter'
import { ORDER_STATUSES, type OrderStatus } from '../orders/types'

function parseStatus(value: string | null): OrderStatus | null {
  return ORDER_STATUSES.find((status) => status === value) ?? null
}

export function OrdersPage() {
  const { data: orders = [], isPending, isError, error, refetch, isRefetching } = useOrders()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedStatus = parseStatus(searchParams.get('status'))

  const counts = useMemo(() => {
    const result = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<OrderStatus, number>
    orders.forEach((order) => result[order.status]++)
    return result
  }, [orders])

  const visibleOrders = selectedStatus ? orders.filter((order) => order.status === selectedStatus) : orders

  function handleFilterChange(status: OrderStatus | null) {
    setSearchParams(status ? { status } : {}, { replace: true })
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="mt-1 text-sm text-slate-500">Acompanhe e atualize o status dos pedidos.</p>
        </div>
        <Link to="/pedidos/novo" className={buttonClasses('primary')}>
          Novo pedido
        </Link>
      </div>

      <StatusFilter
        selected={selectedStatus}
        counts={counts}
        total={orders.length}
        onChange={handleFilterChange}
      />

      {isPending && <OrdersSkeleton />}

      {isError && (
        <div className="space-y-3">
          <ErrorAlert message={error.message} />
          <Button variant="secondary" loading={isRefetching} onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isPending && !isError && visibleOrders.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-medium">
            {selectedStatus ? `Nenhum pedido com status "${statusLabels[selectedStatus]}".` : 'Nenhum pedido cadastrado ainda.'}
          </p>
          {!selectedStatus && (
            <Link to="/pedidos/novo" className={`${buttonClasses('primary')} mt-4`}>
              Criar o primeiro pedido
            </Link>
          )}
        </div>
      )}

      {visibleOrders.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  )
}

function OrdersSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Carregando pedidos">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white" />
      ))}
    </div>
  )
}
