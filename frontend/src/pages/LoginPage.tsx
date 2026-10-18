import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { useAuth } from '../auth/auth-context'
import type { AuthResponse } from '../auth/types'
import { ErrorAlert, SlowServerHint } from '../components/Alert'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { api } from '../lib/api'
import { applyApiErrors } from '../lib/form-errors'

const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha.'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { signIn } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginForm) {
    try {
      signIn(await api<AuthResponse>('/api/auth/login', { method: 'POST', body: values }))
    } catch (error) {
      applyApiErrors(error, setError)
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse o painel de pedidos."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-medium text-orange-600 hover:underline">
            Cadastre-se
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <ErrorAlert message={errors.root?.message} />
        <TextField label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Entrar
        </Button>
        <SlowServerHint visible={isSubmitting} />
      </form>
    </AuthLayout>
  )
}
