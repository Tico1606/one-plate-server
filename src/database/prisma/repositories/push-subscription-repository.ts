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
        expoPushToken: data.expoPushToken,
        deviceInfo: data.deviceInfo ?? undefined,
      },
    })

    return {
      id: subscription.id,
      userId: subscription.userId,
      expoPushToken: subscription.expoPushToken,
      deviceInfo: subscription.deviceInfo as Record<string, unknown> | null,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    }
  }

  async findByUserId(userId: string): Promise<PushSubscriptionData[]> {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    })

    return subscriptions.map((subscription) => ({
      id: subscription.id,
      userId: subscription.userId,
      expoPushToken: subscription.expoPushToken,
      deviceInfo: subscription.deviceInfo as Record<string, unknown> | null,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    }))
  }

  async findByToken(token: string): Promise<PushSubscriptionData | null> {
    const subscription = await prisma.pushSubscription.findUnique({
      where: { expoPushToken: token },
    })

    if (!subscription) return null

    return {
      id: subscription.id,
      userId: subscription.userId,
      expoPushToken: subscription.expoPushToken,
      deviceInfo: subscription.deviceInfo as Record<string, unknown> | null,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.pushSubscription.delete({
      where: { id },
    })
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.pushSubscription.delete({
      where: { expoPushToken: token },
    })
  }

  async deleteByUserId(userId: string): Promise<number> {
    const result = await prisma.pushSubscription.deleteMany({
      where: { userId },
    })
    return result.count
  }
}
