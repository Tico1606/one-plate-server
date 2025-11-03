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
 * Extrai o userId do JWT token manualmente
 */
function extractUserIdFromJWT(token: string): string | null {
  try {
    // Decodifica o payload do JWT (sem verificar assinatura)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    console.log('🔍 [JWT FALLBACK] Payload decodificado:', payload)

    // Retorna o sub (subject) que é o userId no Clerk
    return payload.sub || null
  } catch (error) {
    console.log('❌ [JWT FALLBACK] Erro ao decodificar JWT:', error)
    return null
  }
}

/**
 * Middleware de desenvolvimento que simula autenticação
 * Usa tokens fixos para facilitar testes OU tokens JWT do Clerk
 */
export async function devAuthMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  console.log('🔍 [DEV AUTH] Iniciando middleware de autenticação')
  console.log('🔍 [DEV AUTH] Headers:', request.headers)

  const authHeader = request.headers.authorization
  console.log('🔍 [DEV AUTH] Authorization header:', authHeader)

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ [DEV AUTH] Token não fornecido ou formato inválido')
    throw new NotAllowedError('Token de autenticação não fornecido')
  }

  const token = authHeader.substring(7)
  console.log('🔍 [DEV AUTH] Token extraído:', token)

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

  console.log('🔍 [DEV AUTH] Tokens disponíveis:', Object.keys(devTokens))
  let user = devTokens[token]
  console.log('🔍 [DEV AUTH] Usuário encontrado nos tokens fixos:', user)

  // Se não encontrou nos tokens fixos, tentar extrair do JWT do Clerk
  if (!user) {
    console.log('🔍 [DEV AUTH] Token não encontrado nos fixos, tentando extrair do JWT')
    const userId = extractUserIdFromJWT(token)

    if (userId) {
      console.log('🔍 [DEV AUTH] UserId extraído do JWT:', userId)
      // Criar usuário simulado baseado no JWT
      user = {
        id: userId,
        email: 'usuario@clerk.com', // Email simulado
        role: 'USER',
      }
      console.log('🔍 [DEV AUTH] Usuário criado a partir do JWT:', user)
    }
  }

  if (!user) {
    console.log('❌ [DEV AUTH] Token inválido - nem nos fixos nem JWT válido')
    throw new NotAllowedError('Token inválido ou expirado')
  }

  request.user = user
  console.log('✅ [DEV AUTH] Usuário autenticado com sucesso:', user)
}

/**
 * Middleware opcional de desenvolvimento
 */
export async function devOptionalAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
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

  let user = devTokens[token]

  // Se não encontrou nos tokens fixos, tentar extrair do JWT do Clerk
  if (!user) {
    const userId = extractUserIdFromJWT(token)

    if (userId) {
      // Criar usuário simulado baseado no JWT
      user = {
        id: userId,
        email: 'usuario@clerk.com', // Email simulado
        role: 'USER',
      }
    }
  }

  if (user) {
    request.user = user
  }
}

/**
 * Função para escolher o middleware baseado no ambiente
 */
import { authMiddleware, optionalAuthMiddleware } from './auth.ts'

export function getAuthMiddleware() {
  console.log('🔍 [MIDDLEWARE SELECTOR] NODE_ENV:', env.NODE_ENV)

  // Usar autenticação real do Clerk em produção e desenvolvimento
  if (env.NODE_ENV === 'prod' || env.NODE_ENV === 'dev') {
    console.log('🔍 [MIDDLEWARE SELECTOR] Usando autenticação real do Clerk')
    return authMiddleware
  }

  // Usar autenticação mockada apenas em testes
  console.log(
    '🔍 [MIDDLEWARE SELECTOR] Usando middleware de desenvolvimento (apenas para testes)',
  )
  return devAuthMiddleware
}

export function getOptionalAuthMiddleware() {
  console.log('🔍 [MIDDLEWARE SELECTOR] NODE_ENV:', env.NODE_ENV)

  // Usar autenticação real do Clerk em produção e desenvolvimento
  if (env.NODE_ENV === 'prod' || env.NODE_ENV === 'dev') {
    console.log('🔍 [MIDDLEWARE SELECTOR] Usando autenticação opcional real do Clerk')
    return optionalAuthMiddleware
  }

  // Usar autenticação mockada apenas em testes
  console.log(
    '🔍 [MIDDLEWARE SELECTOR] Usando middleware opcional de desenvolvimento (apenas para testes)',
  )
  return devOptionalAuthMiddleware
}
