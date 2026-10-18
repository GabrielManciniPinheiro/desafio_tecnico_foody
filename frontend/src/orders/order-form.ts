import { z } from 'zod'
import type { CreateOrderRequest } from './types'

const PRICE_PATTERN = /^\d{1,6}([.,]\d{1,2})?$/

/** Converte o preço digitado ("45,90" ou "45.90") em número; retorna null se for inválido. */
export function parsePrice(value: string): number | null {
  const normalized = value.trim()
  if (!PRICE_PATTERN.test(normalized)) return null
  return Number(normalized.replace(',', '.'))
}

/** Soma os itens em centavos para evitar erros de arredondamento de ponto flutuante. */
export function calculateTotal(items: { quantity?: number; unitPrice?: string }[]): number {
  const cents = items.reduce((total, item) => {
    const price = parsePrice(item.unitPrice ?? '')
    const quantity = item.quantity ?? 0
    if (price === null || !Number.isInteger(quantity) || quantity <= 0) return total
    return total + Math.round(price * 100) * quantity
  }, 0)
  return cents / 100
}

const itemSchema = z.object({
  productName: z.string().trim().min(1, 'Informe o produto.').max(120, 'Máximo de 120 caracteres.'),
  quantity: z
    .number({ error: 'Informe a quantidade.' })
    .int('Informe um número inteiro.')
    .min(1, 'Mínimo de 1.')
    .max(999, 'Máximo de 999.'),
  unitPrice: z
    .string()
    .trim()
    .min(1, 'Informe o preço.')
    .refine((value) => (parsePrice(value) ?? 0) > 0, 'Informe um preço válido.'),
})

export const orderFormSchema = z.object({
  customerName: z.string().trim().min(1, 'Informe o nome do cliente.').max(120, 'Máximo de 120 caracteres.'),
  customerPhone: z.string().trim().max(20, 'Máximo de 20 caracteres.'),
  deliveryAddress: z.object({
    zipCode: z.string().trim().regex(/^\d{5}-?\d{3}$/, 'Informe um CEP válido.'),
    street: z.string().trim().min(1, 'Informe a rua.').max(150, 'Máximo de 150 caracteres.'),
    number: z.string().trim().min(1, 'Informe o número.').max(10, 'Máximo de 10 caracteres.'),
    complement: z.string().trim().max(100, 'Máximo de 100 caracteres.'),
    neighborhood: z.string().trim().min(1, 'Informe o bairro.').max(100, 'Máximo de 100 caracteres.'),
    city: z.string().trim().min(1, 'Informe a cidade.').max(100, 'Máximo de 100 caracteres.'),
    state: z.string().trim().regex(/^[A-Za-z]{2}$/, 'Informe a UF com 2 letras.'),
  }),
  items: z.array(itemSchema).min(1, 'Adicione pelo menos um item.'),
})

export type OrderFormInput = z.input<typeof orderFormSchema>
export type OrderFormOutput = z.output<typeof orderFormSchema>

export const emptyItem: OrderFormInput['items'][number] = { productName: '', quantity: 1, unitPrice: '' }

export const emptyOrderForm: OrderFormInput = {
  customerName: '',
  customerPhone: '',
  deliveryAddress: { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
  items: [emptyItem],
}

export function toCreateOrderRequest(values: OrderFormOutput): CreateOrderRequest {
  const { deliveryAddress: address } = values
  return {
    customerName: values.customerName,
    customerPhone: values.customerPhone || null,
    deliveryAddress: {
      ...address,
      complement: address.complement || null,
      state: address.state.toUpperCase(),
    },
    items: values.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: parsePrice(item.unitPrice)!,
    })),
  }
}
