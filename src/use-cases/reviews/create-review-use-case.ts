import { notificationRepository, pushSubscriptionRepository } from '@/database/repositories.ts'
import type {
  RecipeRepository,
  ReviewRepository,
  UserRepository,
} from '@/interfaces/repositories/index.ts'
import type { CreateReviewData } from '@/interfaces/repositories/review-repository.ts'
import { NotificationService } from '@/services/notification-service.ts'
import type { BaseReview } from '@/types/base/index.ts'

export interface CreateReviewRequest extends CreateReviewData {
  userId: string
}

export interface CreateReviewResponse extends BaseReview {}

export class CreateReviewUseCase {
  constructor(
    private reviewRepository: ReviewRepository,
    private recipeRepository: RecipeRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(request: CreateReviewRequest): Promise<CreateReviewResponse> {
    // Verificar se o usuario ja avaliou esta receita
    const existingReview = await this.reviewRepository.findOneByUserAndRecipe(
      request.userId,
      request.recipeId,
    )

    if (existingReview) {
      throw new Error('Usuario ja avaliou esta receita')
    }

    const review = await this.reviewRepository.create({
      recipeId: request.recipeId,
      userId: request.userId,
      rating: request.rating,
      comment: request.comment,
    })

    // Enviar notificacao para o autor da receita
    console.log('[NOTIFICATION] Iniciando processo de notificacao para review')
    console.log('[NOTIFICATION] RecipeId:', request.recipeId)
    console.log('[NOTIFICATION] UserId (avaliador):', request.userId)

    try {
      const recipe = await this.recipeRepository.findById(request.recipeId)
      console.log('[NOTIFICATION] Receita encontrada:', recipe ? 'Sim' : 'Nao')

      if (recipe) {
        console.log('[NOTIFICATION] AuthorId da receita:', recipe.authorId)
        console.log('[NOTIFICATION] E o proprio autor?', recipe.authorId === request.userId)
      }

      if (recipe && recipe.authorId !== request.userId) {
        console.log('[NOTIFICATION] Buscando dados do avaliador...')
        const reviewer = await this.userRepository.findById(request.userId)
        console.log('[NOTIFICATION] Avaliador encontrado:', reviewer ? 'Sim' : 'Nao')
        console.log('[NOTIFICATION] Nome do avaliador:', reviewer?.name || 'Usuario')

        const notificationService = NotificationService.getInstance()
        console.log('[NOTIFICATION] NotificationService obtido')

        const payload = notificationService.createRecipeReviewNotification(
          recipe.id,
          recipe.title,
          reviewer?.name || 'Usuario',
          request.rating,
        )
        console.log('[NOTIFICATION] Payload criado:', JSON.stringify(payload, null, 2))

        await notificationRepository.create({
          userId: recipe.authorId,
          type: 'RECIPE_REVIEW',
          title: payload.title,
          body: payload.body,
          data: {
            ...(payload.data || {}),
            recipeId: recipe.id,
            reviewId: review.id,
            reviewerId: reviewer?.id || request.userId,
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
      console.error('[NOTIFICATION] Erro ao enviar notificacao de review:', error)
    }

    return review
  }
}
