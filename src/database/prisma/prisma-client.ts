import { PrismaClient } from '@prisma/client'
import { env } from '@/constants/env.ts'

export const prisma = new PrismaClient({
  log: (env.NODE_ENV === 'dev' || env.NODE_ENV === 'test') ? [] : [],
})
