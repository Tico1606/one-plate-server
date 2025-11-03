import { createClerkClient } from '@clerk/clerk-sdk-node'
import { getAuth } from '@clerk/fastify'
import type { FastifyRequest } from 'fastify'
import { env } from '@/constants/index.ts'
import { userRepository } from '@/database/repositories.ts'

export interface ClerkUser {
  id: string
  email: string
  role?: 'USER' | 'ADMIN'
}

/**
 * Extrai o userId do JWT token manualmente como fallback
 */
function extractUserIdFromJWT(token: string): string | null {
  try {
    // Remove o prefixo "Bearer " se existir
    const cleanToken = token.replace(/^Bearer\s+/, '')

    // Decodifica o payload do JWT (sem verificar assinatura)
    const payload = JSON.parse(Buffer.from(cleanToken.split('.')[1], 'base64').toString())

    console.log('🔍 [JWT FALLBACK] Payload decodificado:', payload)

    // Retorna o sub (subject) que é o userId no Clerk
    return payload.sub || null
  } catch (error) {
    console.log('❌ [JWT FALLBACK] Erro ao decodificar JWT:', error)
    return null
  }
}

/**
 * Obtém os dados do usuário autenticado via Clerk
 */
export async function getClerkUser(request: FastifyRequest): Promise<ClerkUser> {
  try {
    console.log('🔍 [CLERK SERVICE] Iniciando obtenção do usuário')

    // Tentar obter userId do plugin do Clerk
    let userId: string | null = null
    try {
      const authResult = getAuth(request)
      userId = authResult.userId
      console.log('🔍 [CLERK SERVICE] UserId do Clerk (plugin):', userId)
    } catch (error) {
      console.log('⚠️ [CLERK SERVICE] Erro ao usar getAuth:', error)
    }

    // Se não conseguiu pelo plugin, tentar extrair manualmente do JWT
    if (!userId) {
      const authHeader = request.headers.authorization
      if (authHeader?.startsWith('Bearer ')) {
        console.log('🔍 [CLERK SERVICE] Tentando extrair userId do JWT manualmente')
        userId = extractUserIdFromJWT(authHeader)
        console.log('🔍 [CLERK SERVICE] UserId extraído do JWT:', userId)
      }
    }

    if (!userId) {
      console.log('❌ [CLERK SERVICE] Usuário não autenticado - userId é null/undefined')
      throw new Error('Usuário não autenticado')
    }

    // Configurar clerkClient com a secret key
    console.log('🔍 [CLERK SERVICE] Configurando cliente Clerk')
    const clerk = createClerkClient({
      secretKey: env.CLERK_SECRET_KEY,
    })

    // Buscar dados do usuário no Clerk
    console.log('🔍 [CLERK SERVICE] Buscando usuário no Clerk:', userId)
    const clerkUser = await clerk.users.getUser(userId)
    console.log('🔍 [CLERK SERVICE] Usuário encontrado no Clerk:', clerkUser)

    if (!clerkUser.emailAddresses[0]?.emailAddress) {
      console.log('❌ [CLERK SERVICE] Email não encontrado no usuário')
      throw new Error('Email não encontrado no usuário')
    }

    const email = clerkUser.emailAddresses[0].emailAddress
    console.log('🔍 [CLERK SERVICE] Email do usuário:', email)

    // Buscar role do usuário no banco de dados
    console.log('🔍 [CLERK SERVICE] Buscando usuário no banco de dados:', userId)
    const userFromDb = await userRepository.findById(userId)
    console.log('🔍 [CLERK SERVICE] Usuário encontrado no banco:', userFromDb)

    // Se usuário não existe no banco, criar com role USER
    if (!userFromDb) {
      console.log('🔍 [CLERK SERVICE] Criando novo usuário no banco')
      await userRepository.create({
        id: userId,
        email,
        name:
          clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.firstName || null,
        photoUrl: clerkUser.imageUrl || null,
        role: 'USER',
      })
      console.log('✅ [CLERK SERVICE] Usuário criado no banco')
    }

    const result = {
      id: userId,
      email,
      role: userFromDb?.role || 'USER',
    }
    console.log('✅ [CLERK SERVICE] Retornando usuário:', result)
    return result
  } catch (error) {
    console.log('❌ [CLERK SERVICE] Erro na obtenção do usuário:', error)
    throw new Error('Erro: Falha na obtenção dos dados do usuário')
  }
}
