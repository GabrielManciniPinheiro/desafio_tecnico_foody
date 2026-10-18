import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from './api'
import type { CreateOrderRequest, Order, OrderStatus } from './types'

export const orderKeys = {
  all: ['orders'] as const,
  detail: (id: number) => ['orders', id] as const,
}

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn: ordersApi.list,
    // Mantém a lista atualizada com pedidos registrados por outros operadores
    refetchInterval: 30_000,
  })
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.get(id),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (order: CreateOrderRequest) => ordersApi.create(order),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order)
      return queryClient.invalidateQueries({ queryKey: orderKeys.all, exact: true })
    },
  })
}

export function useUpdateOrderStatus(orderId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: OrderStatus) => ordersApi.updateStatus(orderId, status),
    onSuccess: (updated) => {
      // Atualiza o cache direto com a resposta, sem precisar buscar a lista de novo
      queryClient.setQueryData(orderKeys.detail(updated.id), updated)
      queryClient.setQueryData<Order[]>(orderKeys.all, (orders) =>
        orders?.map((order) => (order.id === updated.id ? updated : order)),
      )
    },
    onError: () => {
      // Em caso de conflito (outra pessoa alterou o pedido), recarrega os dados
      return queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
