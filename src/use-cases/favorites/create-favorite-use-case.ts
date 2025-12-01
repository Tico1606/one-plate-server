import { notificationRepository, pushSubscriptionRepository } from '@/database/repositories.ts'
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
    // Validacoes basicas
    if (!request.userId) {
      throw new ValidationError('ID do usuario e obrigatorio')
    }

    if (!request.recipeId) {
      throw new ValidationError('ID da receita e obrigatorio')
    }

    // Verificar se o favorito ja existe
    const existingFavorite = await this.favoriteRepository.findOne(
      request.userId,
      request.recipeId,
    )

    if (existingFavorite) {
      throw new ConflictError('Receita ja esta nos favoritos')
    }

    // Criar o favorito
    const favorite = await this.favoriteRepository.create({
      userId: request.userId,
      recipeId: request.recipeId,
    })

    // Enviar notificacao para o autor da receita
    console.log('[NOTIFICATION] Iniciando processo de notificacao para favorito')
    console.log('[NOTIFICATION] RecipeId:', request.recipeId)
    console.log('[NOTIFICATION] UserId (quem favoritou):', request.userId)

    try {
      const recipe = await this.recipeRepository.findById(request.recipeId)
      console.log('[NOTIFICATION] Receita encontrada:', recipe ? 'Sim' : 'Nao')

      if (recipe) {
        console.log('[NOTIFICATION] AuthorId da receita:', recipe.authorId)
        console.log('[NOTIFICATION] E o proprio autor?', recipe.authorId === request.userId)
      }

      if (recipe && recipe.authorId !== request.userId) {
        console.log('[NOTIFICATION] Buscando dados de quem favoritou...')
        const favoriter = await this.userRepository.findById(request.userId)
        console.log('[NOTIFICATION] Usuario encontrado:', favoriter ? 'Sim' : 'Nao')
        console.log('[NOTIFICATION] Nome do usuario:', favoriter?.name || 'Usuario')

        const notificationService = NotificationService.getInstance()
        console.log('[NOTIFICATION] NotificationService obtido')

        const payload = notificationService.createRecipeFavoriteNotification(
          recipe.id,
          recipe.title,
          favoriter?.name || 'Usuario',
        )
        console.log('[NOTIFICATION] Payload criado:', JSON.stringify(payload, null, 2))

        await notificationRepository.create({
          userId: recipe.authorId,
          type: 'RECIPE_FAVORITE',
          title: payload.title,
          body: payload.body,
          data: {
            ...(payload.data || {}),
            recipeId: recipe.id,
            favoritedById: favoriter?.id || request.userId,
          },
        })
        console.log('[NOTIFICATION] Registro salvo para consulta posterior')

        console.log('[NOTIFICATION] Buscando tokens push do autor...')
        const subscriptions = await pushSubscriptionRepository.findByUserId(
          recipe.authorId,
        )
        console.log('[NOTIFICATION] Tokens encontrados:', subscriptions.length)

        if (subscriptions.length === 0) {
          console.log('[NOTIFICATION] Nenhum token encontrado para o autor!')
          console.log('[NOTIFICATION] O autor precisa registrar um Expo push token primeiro')
        } else {
          console.log('[NOTIFICATION] Enviando notificacao...')
          await notificationService.sendNotificationToUser(
            recipe.authorId,
            payload,
            async (userId) => {
              const subscriptions = await pushSubscriptionRepository.findByUserId(userId)
              return subscriptions.map((sub) => sub.expoPushToken)
            },
          )
          console.log('[NOTIFICATION] Notificacao enviada com sucesso!')
        }
      } else {
        console.log('[NOTIFICATION] Nao enviando notificacao - e o proprio autor')
      }
    } catch (error) {
      // Log do erro mas nao falha a operacao principal
      console.error('[NOTIFICATION] Erro ao enviar notificacao de favorito:', error)
    }

    return { favorite }
  }
}
