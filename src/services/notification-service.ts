import webpush from 'web-push'
import { env } from '@/constants/index.ts'

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, any>
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export class NotificationService {
  private static instance: NotificationService
  private isInitialized = false

  private constructor() {
    this.initialize()
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private initialize() {
    if (this.isInitialized) return

    try {
      webpush.setVapidDetails(
        'mailto:admin@oneplate.com',
        env.VAPID_PUBLIC_KEY,
        env.VAPID_PRIVATE_KEY,
      )
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize VAPID keys:', error)
      throw error
    }
  }

  public async sendNotification(
    subscription: PushSubscriptionData,
    payload: PushNotificationPayload,
  ): Promise<void> {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      }

      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/badge-72x72.png',
        data: payload.data || {},
      })

      await webpush.sendNotification(pushSubscription, notificationPayload)
    } catch (error) {
      console.error('Failed to send notification:', error)
      throw error
    }
  }

  public async sendNotificationToUser(
    userId: string,
    payload: PushNotificationPayload,
    getSubscriptions: (userId: string) => Promise<PushSubscriptionData[]>,
  ): Promise<void> {
    try {
      const subscriptions = await getSubscriptions(userId)

      const sendPromises = subscriptions.map((subscription) =>
        this.sendNotification(subscription, payload).catch((error) => {
          console.error(
            `Failed to send notification to subscription ${subscription.endpoint}:`,
            error,
          )
          // Don't throw here to avoid failing all notifications if one fails
        }),
      )

      await Promise.allSettled(sendPromises)
    } catch (error) {
      console.error('Failed to send notification to user:', error)
      throw error
    }
  }

  public createRecipeReviewNotification(
    recipeTitle: string,
    reviewerName: string,
    rating: number,
  ): PushNotificationPayload {
    return {
      title: 'Nova avaliação na sua receita!',
      body: `${reviewerName} avaliou "${recipeTitle}" com ${rating} estrelas`,
      data: {
        type: 'recipe_review',
        recipeTitle,
        reviewerName,
        rating,
      },
    }
  }

  public createRecipeFavoriteNotification(
    recipeTitle: string,
    favoriterName: string,
  ): PushNotificationPayload {
    return {
      title: 'Receita favoritada!',
      body: `${favoriterName} favoritou sua receita "${recipeTitle}"`,
      data: {
        type: 'recipe_favorite',
        recipeTitle,
        favoriterName,
      },
    }
  }
}

