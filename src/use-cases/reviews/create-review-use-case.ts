import { pushSubscriptionRepository } from '@/database/repositories.ts'
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
    // Verificar se o usuário já avaliou esta receita
    const existingReview = await this.reviewRepository.findOneByUserAndRecipe(
      request.userId,
      request.recipeId,
    )

    if (existingReview) {
      throw new Error('Usuário já avaliou esta receita')
    }

    const review = await this.reviewRepository.create({
      recipeId: request.recipeId,
      userId: request.userId,
      rating: request.rating,
      comment: request.comment,
    })

    // Enviar notificação para o autor da receita
    console.log('🔔 [NOTIFICATION] Iniciando processo de notificação para review')
    console.log('🔔 [NOTIFICATION] RecipeId:', request.recipeId)
    console.log('🔔 [NOTIFICATION] UserId (avaliador):', request.userId)

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
        console.log('🔔 [NOTIFICATION] Buscando dados do avaliador...')
        const reviewer = await this.userRepository.findById(request.userId)
        console.log('🔔 [NOTIFICATION] Avaliador encontrado:', reviewer ? 'Sim' : 'Não')
        console.log('🔔 [NOTIFICATION] Nome do avaliador:', reviewer?.name || 'Usuário')

        const notificationService = NotificationService.getInstance()
        console.log('🔔 [NOTIFICATION] NotificationService obtido')

        const payload = notificationService.createRecipeReviewNotification(
          recipe.title,
          reviewer?.name || 'Usuário',
          request.rating,
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
      console.error('❌ [NOTIFICATION] Erro ao enviar notificação de review:', error)
      console.error('❌ [NOTIFICATION] Stack trace:', error.stack)
    }

    return review
  }
}
