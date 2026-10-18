export const ORDER_STATUSES = ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type DeliveryAddress = {
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export type OrderItem = {
  id: number
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type Order = {
  id: number
  customerName: string
  customerPhone: string | null
  deliveryAddress: DeliveryAddress
  status: OrderStatus
  nextStatuses: OrderStatus[]
  totalAmount: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export type CreateOrderRequest = {
  customerName: string
  customerPhone: string | null
  deliveryAddress: DeliveryAddress
  items: { productName: string; quantity: number; unitPrice: number }[]
}
