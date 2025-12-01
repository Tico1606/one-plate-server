import { Expo } from 'expo-server-sdk'
import { env } from '@/constants/index.ts'

export interface PushNotificationPayload {
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  subtitle?: string
}

export class NotificationService {
  private static instance: NotificationService
  private expo: Expo

  private constructor() {
    this.expo = new Expo({
      accessToken: env.EXPO_ACCESS_TOKEN || undefined,
    })
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private buildMessage(token: string, payload: PushNotificationPayload) {
    return {
      to: token,
      title: payload.title,
      body: payload.body,
      sound: payload.sound ?? 'default',
      subtitle: payload.subtitle,
      data: payload.data ?? {},
    }
  }

  public async sendNotificationToTokens(
    tokens: string[],
    payload: PushNotificationPayload,
  ): Promise<void> {
    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token))
    const invalidTokens = tokens.filter((token) => !Expo.isExpoPushToken(token))

    if (invalidTokens.length > 0) {
      console.warn('[NOTIFICATION][PUSH] Tokens invalidos detectados', {
        tokens: invalidTokens,
      })
    }

    if (validTokens.length === 0) {
      console.log('[NOTIFICATION][PUSH] Nenhum token valido para enviar notificacao')
      return
    }

    console.log('[NOTIFICATION][PUSH] Preparando envio de notificacoes', {
      tokenCount: validTokens.length,
      tokens: validTokens,
      payload,
    })

    const messages = validTokens.map((token) => this.buildMessage(token, payload))
    const chunks = this.expo.chunkPushNotifications(messages)

    for (const chunk of chunks) {
      try {
        console.log('[NOTIFICATION][PUSH] Enviando chunk de notificacoes para Expo', {
          chunkSize: chunk.length,
        })
        const tickets = await this.expo.sendPushNotificationsAsync(chunk)
        tickets.forEach((ticket, index) => {
          if (ticket.status === 'error') {
            console.error('[NOTIFICATION][PUSH] Falha ao enviar notificacao', {
              token: chunk[index]?.to,
              details: ticket.details,
              message: ticket.message,
            })
          }
        })
        console.log('[NOTIFICATION][PUSH] Chunk enviado para Expo com sucesso', {
          chunkSize: chunk.length,
        })
      } catch (error) {
        console.error('[NOTIFICATION][PUSH] Erro ao enviar chunk de notificacoes', error)
      }
    }
  }

  public async sendNotificationToUser(
    userId: string,
    payload: PushNotificationPayload,
    getTokens: (userId: string) => Promise<string[]>,
  ): Promise<void> {
    try {
      const tokens = await getTokens(userId)
      console.log('[NOTIFICATION][PUSH] Tokens carregados', {
        userId,
        count: tokens.length,
      })

      await this.sendNotificationToTokens(tokens, payload)
    } catch (error) {
      console.error('Failed to send notification to user:', error)
      throw error
    }
  }

  public createRecipeReviewNotification(
    recipeId: string,
    recipeTitle: string,
    reviewerName: string,
    rating: number,
  ): PushNotificationPayload {
    return {
      title: 'Nova avaliacao na sua receita!',
      body: `${reviewerName} avaliou "${recipeTitle}" com ${rating} estrelas`,
      data: {
        type: 'recipe_review',
        recipeId,
        recipeTitle,
        reviewerName,
        rating,
      },
    }
  }

  public createRecipeFavoriteNotification(
    recipeId: string,
    recipeTitle: string,
    favoriterName: string,
  ): PushNotificationPayload {
    return {
      title: 'Receita favoritada!',
      body: `${favoriterName} favoritou sua receita "${recipeTitle}"`,
      data: {
        type: 'recipe_favorite',
        recipeId,
        recipeTitle,
        favoriterName,
      },
    }
  }
}

