import { NotAllowedError } from '@/errors/index.ts'
import { validateSupabaseToken } from '@/services/supabase-auth.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

export interface AuthenticatedUser {
  id: string
  email: string
  role?: 'USER' | 'ADMIN'
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser
  }
}

/**
 * Middleware que valida o token JWT do Supabase
 * O frontend envia o token no header Authorization: Bearer <token>
 */
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new NotAllowedError('Token de autenticação não fornecido')
  }

  const token = authHeader.substring(7)

  try {
    const user = await validateSupabaseToken(token)
    request.user = user
  } catch (error) {
    throw new NotAllowedError('Token inválido ou expirado')
  }
}

/**
 * Middleware opcional que valida o token se fornecido
 * Usado para rotas que funcionam com ou sem usuário autenticado
 */
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return // Continua sem usuário autenticado
  }

  const token = authHeader.substring(7)

  try {
    const user = await validateSupabaseToken(token)
    request.user = user
  } catch (error) {
    // Ignora erro para middleware opcional
  }
}
