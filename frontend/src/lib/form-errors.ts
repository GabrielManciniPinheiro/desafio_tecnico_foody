import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from './api'

/**
 * Exibe os erros retornados pela API no formulário: erros de campo vão para
 * o campo correspondente e os demais para o erro geral (root).
 */
export function applyApiErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
  if (!(error instanceof ApiError)) {
    setError('root', { message: 'Ocorreu um erro inesperado. Tente novamente.' })
    return
  }

  const fieldErrors = Object.entries(error.fieldErrors)
  if (fieldErrors.length === 0) {
    setError('root', { message: error.message })
    return
  }

  for (const [field, message] of fieldErrors) {
    // A API usa a notação items[0].quantity; o react-hook-form usa items.0.quantity
    setError(field.replace(/\[(\d+)\]/g, '.$1') as Path<T>, { message })
  }
}
