const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatDateTime(isoDate: string) {
  return dateTimeFormatter.format(new Date(isoDate))
}
