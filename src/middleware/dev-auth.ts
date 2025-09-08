import type { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '@/constants/index.ts'
import { NotAllowedError } from '@/errors/index.ts'

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
 * Middleware de desenvolvimento que simula autenticação
 * Usa tokens fixos para facilitar testes
 */
export async function devAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new NotAllowedError('Token de autenticação não fornecido')
  }

  const token = authHeader.substring(7)

  // Tokens de desenvolvimento fixos
  const devTokens: Record<string, AuthenticatedUser> = {
    'dev-user-token': {
      id: 'dev-user-123',
      email: 'usuario@teste.com',
      role: 'USER',
    },
    'dev-admin-token': {
      id: 'dev-admin-456',
      email: 'admin@teste.com',
      role: 'ADMIN',
    },
  }

  const user = devTokens[token]

  if (!user) {
    throw new NotAllowedError('Token inválido ou expirado')
  }

  request.user = user
}

/**
 * Middleware opcional de desenvolvimento
 */
export async function devOptionalAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return // Continua sem usuário autenticado
  }

  const token = authHeader.substring(7)

  // Tokens de desenvolvimento fixos
  const devTokens: Record<string, AuthenticatedUser> = {
    'dev-user-token': {
      id: 'dev-user-123',
      email: 'usuario@teste.com',
      role: 'USER',
    },
    'dev-admin-token': {
      id: 'dev-admin-456',
      email: 'admin@teste.com',
      role: 'ADMIN',
    },
  }

  const user = devTokens[token]

  if (user) {
    request.user = user
  }
}

/**
 * Função para escolher o middleware baseado no ambiente
 */
export function getAuthMiddleware() {
  return env.NODE_ENV === 'dev' ? devAuthMiddleware : require('./auth.ts').authMiddleware
}

export function getOptionalAuthMiddleware() {
  return env.NODE_ENV === 'dev'
    ? devOptionalAuthMiddleware
    : require('./auth.ts').optionalAuthMiddleware
}
