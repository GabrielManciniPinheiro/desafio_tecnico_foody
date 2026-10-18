const BASE_URL = import.meta.env.VITE_API_URL ?? ''

type ProblemDetail = {
  status?: number
  detail?: string
  errors?: Record<string, string>
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

let authToken: string | null = null
let unauthorizedHandler: (() => void) | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
}

export async function api<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.')
  }

  if (!response.ok) {
    // Token expirado ou inválido: encerra a sessão
    if (response.status === 401 && authToken) unauthorizedHandler?.()

    const problem: ProblemDetail | null = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      problem?.detail ?? 'Ocorreu um erro inesperado. Tente novamente.',
      problem?.errors,
    )
  }

  return (await response.json()) as T
}
