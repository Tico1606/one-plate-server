import { getAuth } from '@clerk/fastify'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotAllowedError } from '@/errors/index.ts'
import { getClerkUser } from '@/services/clerk-auth.ts'

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
 * Middleware que valida a autenticação via Clerk
 * O frontend envia o token no header Authorization: Bearer <token>
 */
export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  console.log('🔍 [CLERK AUTH] Iniciando middleware de autenticação')
  console.log('🔍 [CLERK AUTH] Headers:', request.headers)

  try {
    const user = await getClerkUser(request)
    console.log('✅ [CLERK AUTH] Usuário autenticado com sucesso:', user)
    request.user = user
  } catch (error) {
    console.log('❌ [CLERK AUTH] Erro na autenticação:', error)
    throw new NotAllowedError('Usuário não autenticado ou token inválido')
  }
}

/**
 * Middleware opcional que valida a autenticação se fornecida
 * Usado para rotas que funcionam com ou sem usuário autenticado
 */
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return // Continua sem usuário autenticado
    }

    const user = await getClerkUser(request)
    request.user = user
  } catch (_error) {
    // Ignora erro para middleware opcional
  }
}
