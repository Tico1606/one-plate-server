import type { PrismaClient } from '@prisma/client'

export abstract class PrismaRepository {
  protected prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }
}
