import { describe, expect, it } from 'vitest'
import { parseOrderId } from './order-id'

describe('parseOrderId', () => {
  it.each([
    ['12', 12],
    ['#12', 12],
    [' 7 ', 7],
    ['007', 7],
  ])('converte "%s" em %d', (input, expected) => {
    expect(parseOrderId(input)).toBe(expected)
  })

  it.each(['', '0', '-3', '1.5', 'abc', '#', '12a', '99999999999999999999'])('rejeita "%s"', (input) => {
    expect(parseOrderId(input)).toBeNull()
  })
})
