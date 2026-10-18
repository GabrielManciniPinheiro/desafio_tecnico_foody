import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { ErrorAlert, SlowServerHint } from '../components/Alert'
import { Button } from '../components/Button'
import { buttonClasses } from '../components/button-styles'
import { TextField } from '../components/TextField'
import { applyApiErrors } from '../lib/form-errors'
import { formatCurrency } from '../lib/format'
import {
  calculateTotal,
  emptyItem,
  emptyOrderForm,
  orderFormSchema,
  toCreateOrderRequest,
  type OrderFormInput,
  type OrderFormOutput,
} from '../orders/order-form'
import { useCreateOrder } from '../orders/queries'
import { lookupZipCode } from '../orders/viacep'

export function NewOrderPage() {
  const navigate = useNavigate()
  const createOrder = useCreateOrder()
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormInput, unknown, OrderFormOutput>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: emptyOrderForm,
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = useWatch({ control, name: 'items' })
  const total = calculateTotal(items)

  async function fillAddressFromZipCode(zipCode: string) {
    const address = await lookupZipCode(zipCode)
    if (!address) return

    const options = { shouldValidate: true, shouldDirty: true }
    setValue('deliveryAddress.street', address.street, options)
    setValue('deliveryAddress.neighborhood', address.neighborhood, options)
    setValue('deliveryAddress.city', address.city, options)
    setValue('deliveryAddress.state', address.state, options)
    setFocus('deliveryAddress.number')
  }

  async function onSubmit(values: OrderFormOutput) {
    try {
      const order = await createOrder.mutateAsync(toCreateOrderRequest(values))
      navigate(`/pedidos/${order.id}`, { state: { created: true } })
    } catch (error) {
      applyApiErrors(error, setError)
    }
  }

  const addressErrors = errors.deliveryAddress

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Voltar para pedidos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Novo pedido</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <ErrorAlert message={errors.root?.message} />

        <FormSection title="Cliente">
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <TextField label="Nome" autoComplete="off" error={errors.customerName?.message} {...register('customerName')} />
            <TextField
              label="Telefone (opcional)"
              type="tel"
              autoComplete="off"
              placeholder="(11) 99999-9999"
              error={errors.customerPhone?.message}
              {...register('customerPhone')}
            />
          </div>
        </FormSection>

        <FormSection title="Endereço de entrega">
          <div className="grid gap-4 sm:grid-cols-6">
            <TextField
              label="CEP"
              inputMode="numeric"
              placeholder="00000-000"
              className="sm:col-span-2"
              error={addressErrors?.zipCode?.message}
              {...register('deliveryAddress.zipCode', {
                onBlur: (event) => fillAddressFromZipCode(event.target.value),
              })}
            />
            <TextField
              label="Rua"
              className="sm:col-span-4"
              error={addressErrors?.street?.message}
              {...register('deliveryAddress.street')}
            />
            <TextField
              label="Número"
              className="sm:col-span-2"
              error={addressErrors?.number?.message}
              {...register('deliveryAddress.number')}
            />
            <TextField
              label="Complemento (opcional)"
              className="sm:col-span-4"
              error={addressErrors?.complement?.message}
              {...register('deliveryAddress.complement')}
            />
            <TextField
              label="Bairro"
              className="sm:col-span-2"
              error={addressErrors?.neighborhood?.message}
              {...register('deliveryAddress.neighborhood')}
            />
            <TextField
              label="Cidade"
              className="sm:col-span-3"
              error={addressErrors?.city?.message}
              {...register('deliveryAddress.city')}
            />
            <TextField
              label="UF"
              maxLength={2}
              className="uppercase sm:col-span-1"
              error={addressErrors?.state?.message}
              {...register('deliveryAddress.state')}
            />
          </div>
        </FormSection>

        <FormSection title="Itens">
          <ul className="space-y-4">
            {fields.map((field, index) => {
              const itemErrors = errors.items?.[index]
              return (
                <li key={field.id} className="grid items-start gap-3 sm:grid-cols-[1fr_6rem_8rem_auto]">
                  <TextField
                    label="Produto"
                    error={itemErrors?.productName?.message}
                    {...register(`items.${index}.productName`)}
                  />
                  <TextField
                    label="Qtd."
                    type="number"
                    min={1}
                    max={999}
                    error={itemErrors?.quantity?.message}
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                  <TextField
                    label="Preço unit."
                    inputMode="decimal"
                    placeholder="0,00"
                    error={itemErrors?.unitPrice?.message}
                    {...register(`items.${index}.unitPrice`)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="sm:mt-6"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    aria-label={`Remover item ${index + 1}`}
                  >
                    Remover
                  </Button>
                </li>
              )
            })}
          </ul>
          <ErrorAlert message={errors.items?.root?.message ?? errors.items?.message} />
          <Button type="button" variant="secondary" className="mt-4" onClick={() => append({ ...emptyItem })}>
            + Adicionar item
          </Button>
        </FormSection>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-sm text-slate-600">
            Total do pedido <span className="ml-2 text-lg font-semibold text-slate-900">{formatCurrency(total)}</span>
          </p>
          <div className="flex gap-3">
            <Link to="/" className={buttonClasses('secondary')}>
              Cancelar
            </Link>
            <Button type="submit" loading={isSubmitting}>
              Criar pedido
            </Button>
          </div>
        </div>
        <SlowServerHint visible={isSubmitting} />
      </form>
    </section>
  )
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <legend className="sr-only">{title}</legend>
      <h2 className="mb-4 text-sm font-semibold text-slate-900">{title}</h2>
      {children}
    </fieldset>
  )
}
