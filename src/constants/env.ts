import { EnvError } from '@/errors/index.ts'
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).or(z.literal('')).default('dev'),
  PORT: z.coerce.number().default(3333),
  FRONTEND_DOMAIN: z.coerce.string().default('http://localhost:5173'),
  DATABASE_URL: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
})

const validation = envSchema.safeParse(process.env)

if (validation.success === false) {
  throw new EnvError(validation.error.flatten().fieldErrors)
}

export const env = validation.data
