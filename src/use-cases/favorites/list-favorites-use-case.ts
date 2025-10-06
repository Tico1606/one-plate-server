import { ValidationError } from '@/errors/index.ts'
import type { FavoriteRepository } from '@/interfaces/repositories/favorite-repository.ts'
import type { FavoriteWithRelations } from '@/types/base/index.ts'

export interface ListFavoritesRequest {
  userId?: string
  recipeId?: string
  page: number
  limit: number
}

export interface ListFavoritesResponse {
  favorites: FavoriteWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ListFavoritesUseCase {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute(request: ListFavoritesRequest): Promise<ListFavoritesResponse> {
    // Validações básicas
    if (!request.page || request.page < 1) {
      throw new ValidationError('Página deve ser maior que 0')
    }

    if (!request.limit || request.limit < 1 || request.limit > 100) {
      throw new ValidationError('Limite deve estar entre 1 e 100')
    }

    // Se não há filtros, retornar lista vazia
    if (!request.userId && !request.recipeId) {
      return {
        favorites: [],
        total: 0,
        page: request.page,
        limit: request.limit,
        totalPages: 0,
      }
    }

    let result: { favorites: FavoriteWithRelations[]; total: number }

    if (request.userId) {
      // Listar favoritos do usuário
      result = await this.favoriteRepository.findByUser(request.userId, {
        page: request.page,
        limit: request.limit,
      })
    } else if (request.recipeId) {
      // Listar usuários que favoritaram a receita
      result = await this.favoriteRepository.findByRecipe(request.recipeId, {
        page: request.page,
        limit: request.limit,
      })
    } else {
      // Fallback - não deveria acontecer devido à validação acima
      result = { favorites: [], total: 0 }
    }

    const totalPages = Math.ceil(result.total / request.limit)

    return {
      favorites: result.favorites,
      total: result.total,
      page: request.page,
      limit: request.limit,
      totalPages,
    }
  }
}
