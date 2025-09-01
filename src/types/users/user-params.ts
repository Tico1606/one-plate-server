import type { Role } from '@prisma/client'

export interface UserCreateParams {
  id: string
  email: string
  name?: string
  photoUrl?: string
}

export interface UserUpdateParams {
  name?: string
  photoUrl?: string
  role?: Role
}

export interface UserFilterParams {
  name?: string
  email?: string
  role?: Role
}
