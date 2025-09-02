import { env } from '@/constants/index.ts'
import { userRepository } from '@/database/repositories.ts'
import { createClient } from '@supabase/supabase-js'

// Cliente Supabase para validação de tokens
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

export interface SupabaseUser {
  id: string
  email: string
  role?: 'USER' | 'ADMIN'
}

/**
 * Valida o token JWT do Supabase e retorna os dados do usuário
 */
export async function validateSupabaseToken(token: string): Promise<SupabaseUser> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      throw new Error('Token inválido')
    }

    // Buscar role do usuário no banco de dados
    const userFromDb = await userRepository.findById(user.id)

    // Se usuário não existe no banco, criar com role USER
    if (!userFromDb) {
      await userRepository.create({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || null,
        photoUrl: user.user_metadata?.avatar_url || null,
        role: 'USER',
      })
    }

    return {
      id: user.id,
      email: user.email || '',
      role: userFromDb?.role || 'USER',
    }
  } catch (error) {
    throw new Error('Falha na validação do token')
  }
}
