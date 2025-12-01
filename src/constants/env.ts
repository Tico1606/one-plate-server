import { EnvError } from '@/errors/index.ts'
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']).or(z.literal('')).default('dev'),
  PORT: z.coerce.number().default(3000),
  FRONTEND_DOMAIN: z.coerce.string().default('http://localhost:8081'),
  DATABASE_URL: z.string(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_PUBLISHABLE_KEY: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  EXPO_ACCESS_TOKEN: z.string().optional(),
})

const validation = envSchema.safeParse(process.env)

if (validation.success === false) {
  throw new EnvError(validation.error.flatten().fieldErrors)
}

export const env = validation.data
