import { clerkPlugin } from '@clerk/fastify'
import fastifyCors from '@fastify/cors'
import fastify, { type FastifyInstance } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { ZodError } from 'zod'
import { env, HTTP_STATUS_CODE } from '@/constants/index.ts'
import {
  AppError,
  ConflictError,
  NotAllowedError,
  NotFoundError,
  ValidationError,
} from '@/errors/index.ts'
import type { IServerApp } from '@/interfaces/index.ts'

export class FastifyApp implements IServerApp {
  private readonly app: FastifyInstance

  constructor() {
    this.app = fastify().withTypeProvider<ZodTypeProvider>()
    this.app.setSerializerCompiler(serializerCompiler)
    this.app.setValidatorCompiler(validatorCompiler)

    this.registerClerk()
    this.registerCors()
    this.registerRoutes()
    this.setErrorHandler()
  }

  async startServer() {
    await this.app
      .listen({
        host: '0.0.0.0',
        port: env.PORT,
      })
      .then(() => {
        console.log('༼ つ ◕_◕ ༽つ HTTP Server Running')
      })
  }

  stopServer() {}

  private registerClerk() {
    this.app.register(clerkPlugin, {
      publishableKey: env.CLERK_PUBLISHABLE_KEY,
      secretKey: env.CLERK_SECRET_KEY,
    })
  }

  private registerCors() {
    this.app.register(fastifyCors, {
      origin: env.NODE_ENV === 'prod' ? env.FRONTEND_DOMAIN : '*',
    })
  }

  private registerRoutes() {
    this.app.register(async (fastify) => {
      const {
        categoriesRoutes,
        favoritesRoutes,
        ingredientsRoutes,
        recipesRoutes,
        usersRoutes,
        reviewsRoutes,
      } = await import('@/controllers/index.ts')

      fastify.register(categoriesRoutes, { prefix: '/api' })
      fastify.register(favoritesRoutes, { prefix: '/api' })
      fastify.register(ingredientsRoutes, { prefix: '/api' })
      fastify.register(recipesRoutes, { prefix: '/api' })
      fastify.register(usersRoutes, { prefix: '/api' })
      fastify.register(reviewsRoutes, { prefix: '/api' })
    })
  }

  private setErrorHandler() {
    this.app.setErrorHandler((error, _, reply) => {
      if (error instanceof ZodError) {
        return reply.status(HTTP_STATUS_CODE.badRequest).send({
          message: 'Erro de validação.',
          issues: error.format(),
        })
      }

      if (error instanceof AppError) {
        if (env.NODE_ENV !== 'prod') {
          console.error('Error title:', error.title)
          console.error('Error message:', error.message)
        }

        const response = {
          title: error.title,
          message: error.message,
        }

        if (error instanceof NotAllowedError) {
          return reply.status(HTTP_STATUS_CODE.unauthorized).send(response)
        }

        if (error instanceof NotFoundError) {
          return reply.status(HTTP_STATUS_CODE.notFound).send(response)
        }

        if (error instanceof ConflictError) {
          return reply.status(HTTP_STATUS_CODE.conflict).send(response)
        }

        if (error instanceof ValidationError) {
          return reply.status(HTTP_STATUS_CODE.badRequest).send(response)
        }

        return reply.status(HTTP_STATUS_CODE.serverError).send(response)
      }

      if (env.NODE_ENV !== 'prod') {
        console.error(error)
      }

      return reply.status(HTTP_STATUS_CODE.serverError).send({
        title: 'Server Error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    })
  }
}
