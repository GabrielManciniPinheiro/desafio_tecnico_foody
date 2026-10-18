import { Button } from '../components/Button'
import { useUpdateOrderStatus } from './queries'
import { statusActionLabels } from './status'
import type { Order, OrderStatus } from './types'

type StatusActionsProps = {
  order: Order
  className?: string
}

/** Mostra apenas as transições permitidas pela API para o status atual do pedido. */
export function StatusActions({ order, className = '' }: StatusActionsProps) {
  const updateStatus = useUpdateOrderStatus(order.id)

  if (order.nextStatuses.length === 0) return null

  function handleClick(status: OrderStatus) {
    if (status === 'CANCELADO' && !window.confirm(`Cancelar o pedido #${order.id}?`)) return
    updateStatus.mutate(status)
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {order.nextStatuses.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={status === 'CANCELADO' ? 'danger' : 'primary'}
            loading={updateStatus.isPending && updateStatus.variables === status}
            disabled={updateStatus.isPending}
            onClick={() => handleClick(status)}
          >
            {statusActionLabels[status]}
          </Button>
        ))}
      </div>
      {updateStatus.isError && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {updateStatus.error.message}
        </p>
      )}
    </div>
  )
}
