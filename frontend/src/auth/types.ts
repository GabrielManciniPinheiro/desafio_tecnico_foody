export type User = {
  id: number
  name: string
  email: string
}

export type AuthResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}
