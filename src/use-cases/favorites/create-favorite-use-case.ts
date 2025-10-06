import { ConflictError, ValidationError } from '@/errors/index.ts'
import type { FavoriteRepository } from '@/interfaces/repositories/favorite-repository.ts'
import type { BaseFavorite } from '@/types/base/index.ts'

export interface CreateFavoriteRequest {
  userId: string
  recipeId: string
}

export interface CreateFavoriteResponse {
  favorite: BaseFavorite
}

export class CreateFavoriteUseCase {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute(request: CreateFavoriteRequest): Promise<CreateFavoriteResponse> {
    // Validações básicas
    if (!request.userId) {
      throw new ValidationError('ID do usuário é obrigatório')
    }

    if (!request.recipeId) {
      throw new ValidationError('ID da receita é obrigatório')
    }

    // Verificar se o favorito já existe
    const existingFavorite = await this.favoriteRepository.findOne(
      request.userId,
      request.recipeId,
    )

    if (existingFavorite) {
      throw new ConflictError('Receita já está nos favoritos')
    }

    // Criar o favorito
    const favorite = await this.favoriteRepository.create({
      userId: request.userId,
      recipeId: request.recipeId,
    })

    return { favorite }
  }
}
