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

const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe o nome.').max(120, 'O nome deve ter no máximo 120 caracteres.'),
    email: z.email('Informe um e-mail válido.'),
    password: z.string().min(8, 'A senha deve ter entre 8 e 72 caracteres.').max(72, 'A senha deve ter entre 8 e 72 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { signIn } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  async function onSubmit({ name, email, password }: RegisterForm) {
    try {
      signIn(await api<AuthResponse>('/api/auth/register', { method: 'POST', body: { name, email, password } }))
    } catch (error) {
      applyApiErrors(error, setError)
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se para gerenciar os pedidos."
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <ErrorAlert message={errors.root?.message} />
        <TextField label="Nome" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <TextField label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <TextField
          label="Senha"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirme a senha"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Criar conta
        </Button>
        <SlowServerHint visible={isSubmitting} />
      </form>
    </AuthLayout>
  )
}
