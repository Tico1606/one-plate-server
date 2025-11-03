import type {
  CreatePushSubscriptionData,
  IPushSubscriptionRepository,
  PushSubscriptionData,
} from '@/interfaces/repositories/push-subscription-repository.ts'
import { prisma } from '../prisma-client.ts'

export class PrismaPushSubscriptionRepository implements IPushSubscriptionRepository {
  async create(data: CreatePushSubscriptionData): Promise<PushSubscriptionData> {
    const subscription = await prisma.pushSubscription.create({
      data: {
        userId: data.userId,
        endpoint: data.endpoint,
        keys: data.keys,
      },
    })

    return {
      id: subscription.id,
      userId: subscription.userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys as { p256dh: string; auth: string },
      createdAt: subscription.createdAt,
    }
  }

  async findByUserId(userId: string): Promise<PushSubscriptionData[]> {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    })

    return subscriptions.map((subscription) => ({
      id: subscription.id,
      userId: subscription.userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys as { p256dh: string; auth: string },
      createdAt: subscription.createdAt,
    }))
  }

  async findByEndpoint(endpoint: string): Promise<PushSubscriptionData | null> {
    const subscription = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    })

    if (!subscription) return null

    return {
      id: subscription.id,
      userId: subscription.userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys as { p256dh: string; auth: string },
      createdAt: subscription.createdAt,
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.pushSubscription.delete({
      where: { id },
    })
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    await prisma.pushSubscription.delete({
      where: { endpoint },
    })
  }
}
