const MAX_ORDER_ID = Number.MAX_SAFE_INTEGER

/** Converte o texto digitado na busca ("12", "#12", " 12 ") em um ID válido; retorna null se for inválido. */
export function parseOrderId(value: string): number | null {
  const normalized = value.trim().replace(/^#/, '')
  if (!/^\d+$/.test(normalized)) return null

  const id = Number(normalized)
  return id > 0 && id <= MAX_ORDER_ID ? id : null
}
