import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { ApiError } from '../lib/api'
import { parseOrderId } from './order-id'
import { orderQuery } from './queries'

/** Busca um pedido pelo número usando GET /api/orders/{id} e abre o detalhe quando encontrado. */
export function OrderSearch() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string>()
  const [searching, setSearching] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const id = parseOrderId(value)
    if (id === null) {
      setError('Informe um número de pedido válido.')
      return
    }

    setError(undefined)
    setSearching(true)
    try {
      // O resultado fica em cache, então a página de detalhe abre sem nova requisição
      await queryClient.fetchQuery(orderQuery(id))
      navigate(`/pedidos/${id}`)
    } catch (fetchError) {
      setError(
        fetchError instanceof ApiError && fetchError.status === 404
          ? `Pedido #${id} não encontrado.`
          : fetchError instanceof Error
            ? fetchError.message
            : 'Não foi possível buscar o pedido.',
      )
      setSearching(false)
    }
  }

  return (
    <form role="search" onSubmit={handleSubmit} noValidate className="flex w-full items-start gap-2 sm:w-auto">
      <TextField
        label="Buscar pedido por número"
        hideLabel
        inputMode="numeric"
        placeholder="Nº do pedido"
        autoComplete="off"
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          setError(undefined)
        }}
        error={error}
        className="w-full sm:w-44"
      />
      <Button type="submit" variant="secondary" loading={searching}>
        Buscar
      </Button>
    </form>
  )
}
