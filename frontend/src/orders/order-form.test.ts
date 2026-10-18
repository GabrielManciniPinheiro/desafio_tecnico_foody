import { describe, expect, it } from 'vitest'
import { calculateTotal, emptyOrderForm, orderFormSchema, parsePrice, toCreateOrderRequest } from './order-form'

describe('parsePrice', () => {
  it.each([
    ['45,90', 45.9],
    ['45.90', 45.9],
    ['12', 12],
    [' 7,5 ', 7.5],
  ])('converte "%s" em %d', (input, expected) => {
    expect(parsePrice(input)).toBe(expected)
  })

  it.each(['', 'abc', '10,999', '-5', '1.000,00'])('rejeita "%s"', (input) => {
    expect(parsePrice(input)).toBeNull()
  })
})

describe('calculateTotal', () => {
  it('soma quantidade x preço de cada item', () => {
    const total = calculateTotal([
      { quantity: 2, unitPrice: '45,90' },
      { quantity: 1, unitPrice: '12,00' },
    ])
    expect(total).toBe(103.8)
  })

  it('não acumula erro de ponto flutuante', () => {
    // Em ponto flutuante, 0.1 * 3 resultaria em 0.30000000000000004
    expect(calculateTotal([{ quantity: 3, unitPrice: '0,10' }])).toBe(0.3)
  })

  it('ignora itens ainda incompletos', () => {
    expect(calculateTotal([{ quantity: 2, unitPrice: '' }, { quantity: Number.NaN, unitPrice: '10' }])).toBe(0)
  })
})

describe('orderFormSchema', () => {
  const validForm = {
    customerName: ' João Souza ',
    customerPhone: '',
    deliveryAddress: {
      zipCode: '01000-000',
      street: 'Rua das Flores',
      number: '123',
      complement: '',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'sp',
    },
    items: [{ productName: 'Pizza', quantity: 2, unitPrice: '45,90' }],
  }

  it('converte o formulário no corpo esperado pela API', () => {
    const request = toCreateOrderRequest(orderFormSchema.parse(validForm))

    expect(request).toEqual({
      customerName: 'João Souza',
      customerPhone: null,
      deliveryAddress: {
        zipCode: '01000-000',
        street: 'Rua das Flores',
        number: '123',
        complement: null,
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
      },
      items: [{ productName: 'Pizza', quantity: 2, unitPrice: 45.9 }],
    })
  })

  it('aponta os campos inválidos com o mesmo caminho usado pela API', () => {
    const result = orderFormSchema.safeParse({
      ...emptyOrderForm,
      items: [{ productName: '', quantity: 0, unitPrice: 'abc' }],
    })

    expect(result.success).toBe(false)
    const paths = result.error!.issues.map((issue) => issue.path.join('.'))
    expect(paths).toEqual(
      expect.arrayContaining([
        'customerName',
        'deliveryAddress.zipCode',
        'items.0.productName',
        'items.0.quantity',
        'items.0.unitPrice',
      ]),
    )
  })

  it('exige pelo menos um item', () => {
    const result = orderFormSchema.safeParse({ ...validForm, items: [] })
    expect(result.error?.issues[0].message).toBe('Adicione pelo menos um item.')
  })
})
