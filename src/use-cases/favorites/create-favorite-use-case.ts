import { pushSubscriptionRepository } from '@/database/repositories.ts'
import { ConflictError, ValidationError } from '@/errors/index.ts'
import type {
  FavoriteRepository,
  RecipeRepository,
  UserRepository,
} from '@/interfaces/repositories/index.ts'
import { NotificationService } from '@/services/notification-service.ts'
import type { BaseFavorite } from '@/types/base/index.ts'

export interface CreateFavoriteRequest {
  userId: string
  recipeId: string
}

export interface CreateFavoriteResponse {
  favorite: BaseFavorite
}

export class CreateFavoriteUseCase {
  constructor(
    private favoriteRepository: FavoriteRepository,
    private recipeRepository: RecipeRepository,
    private userRepository: UserRepository,
  ) {}

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

    // Enviar notificação para o autor da receita
    console.log('🔔 [NOTIFICATION] Iniciando processo de notificação para favorito')
    console.log('🔔 [NOTIFICATION] RecipeId:', request.recipeId)
    console.log('🔔 [NOTIFICATION] UserId (quem favoritou):', request.userId)

    try {
      const recipe = await this.recipeRepository.findById(request.recipeId)
      console.log('🔔 [NOTIFICATION] Receita encontrada:', recipe ? 'Sim' : 'Não')

      if (recipe) {
        console.log('🔔 [NOTIFICATION] AuthorId da receita:', recipe.authorId)
        console.log(
          '🔔 [NOTIFICATION] É o próprio autor?',
          recipe.authorId === request.userId,
        )
      }

      if (recipe && recipe.authorId !== request.userId) {
        console.log('🔔 [NOTIFICATION] Buscando dados de quem favoritou...')
        const favoriter = await this.userRepository.findById(request.userId)
        console.log('🔔 [NOTIFICATION] Usuário encontrado:', favoriter ? 'Sim' : 'Não')
        console.log('🔔 [NOTIFICATION] Nome do usuário:', favoriter?.name || 'Usuário')

        const notificationService = NotificationService.getInstance()
        console.log('🔔 [NOTIFICATION] NotificationService obtido')

        const payload = notificationService.createRecipeFavoriteNotification(
          recipe.title,
          favoriter?.name || 'Usuário',
        )
        console.log('🔔 [NOTIFICATION] Payload criado:', JSON.stringify(payload, null, 2))

        console.log('🔔 [NOTIFICATION] Buscando subscriptions do autor...')
        const subscriptions = await pushSubscriptionRepository.findByUserId(
          recipe.authorId,
        )
        console.log('🔔 [NOTIFICATION] Subscriptions encontradas:', subscriptions.length)

        if (subscriptions.length === 0) {
          console.log('⚠️ [NOTIFICATION] Nenhuma subscription encontrada para o autor!')
          console.log(
            '💡 [NOTIFICATION] O autor precisa registrar uma push subscription primeiro',
          )
        } else {
          console.log('🔔 [NOTIFICATION] Enviando notificação...')
          await notificationService.sendNotificationToUser(
            recipe.authorId,
            payload,
            async (userId) => {
              const subscriptions = await pushSubscriptionRepository.findByUserId(userId)
              return subscriptions.map((sub) => ({
                endpoint: sub.endpoint,
                keys: sub.keys,
              }))
            },
          )
          console.log('✅ [NOTIFICATION] Notificação enviada com sucesso!')
        }
      } else {
        console.log('ℹ️ [NOTIFICATION] Não enviando notificação - é o próprio autor')
      }
    } catch (error) {
      // Log do erro mas não falha a operação principal
      console.error('❌ [NOTIFICATION] Erro ao enviar notificação de favorito:', error)
      console.error('❌ [NOTIFICATION] Stack trace:', error.stack)
    }

    return { favorite }
  }
}
