import type { OrderStatus } from './types'

export const statusLabels: Record<OrderStatus, string> = {
  RECEBIDO: 'Recebido',
  EM_PREPARO: 'Em preparo',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

/** Texto do botão que leva o pedido para cada status. */
export const statusActionLabels: Record<OrderStatus, string> = {
  RECEBIDO: 'Receber',
  EM_PREPARO: 'Iniciar preparo',
  SAIU_PARA_ENTREGA: 'Enviar para entrega',
  ENTREGUE: 'Confirmar entrega',
  CANCELADO: 'Cancelar',
}

export const statusStyles: Record<OrderStatus, string> = {
  RECEBIDO: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  EM_PREPARO: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  SAIU_PARA_ENTREGA: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  ENTREGUE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  CANCELADO: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}
