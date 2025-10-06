import { NotFoundError, ValidationError } from '@/errors/index.ts'
import type { FavoriteRepository } from '@/interfaces/repositories/favorite-repository.ts'

export interface DeleteFavoriteRequest {
  userId: string
  recipeId: string
}

export interface DeleteFavoriteResponse {
  message: string
}

export class DeleteFavoriteUseCase {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute(request: DeleteFavoriteRequest): Promise<DeleteFavoriteResponse> {
    // Validações básicas
    if (!request.userId) {
      throw new ValidationError('ID do usuário é obrigatório')
    }

    if (!request.recipeId) {
      throw new ValidationError('ID da receita é obrigatório')
    }

    // Verificar se o favorito existe
    const existingFavorite = await this.favoriteRepository.findOne(
      request.userId,
      request.recipeId,
    )

    if (!existingFavorite) {
      throw new NotFoundError('Favorito não encontrado')
    }

    // Remover o favorito
    await this.favoriteRepository.delete(request.userId, request.recipeId)

    return { message: 'Favorito removido com sucesso' }
  }
}
