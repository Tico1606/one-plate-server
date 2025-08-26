// import fastifyJwt from "@fastify/jwt";
// import fastifyCookie from "@fastify/cookie";
import { HTTP_STATUS_CODE, env } from '@/constants/index.ts'
import {
  AppError,
  ConflictError,
  NotAllowedError,
  NotFoundError,
  ValidationError,
} from '@/errors/index.ts'
import type { IServerApp } from '@/interfaces/index.ts'
import fastifyCors from '@fastify/cors'
import fastify, { type FastifyInstance } from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { ZodError } from 'zod'

export class FastifyApp implements IServerApp {
  private readonly app: FastifyInstance

  constructor() {
    this.app = fastify().withTypeProvider<ZodTypeProvider>()
    this.app.setSerializerCompiler(serializerCompiler)
    this.app.setValidatorCompiler(validatorCompiler)

    this.registerCors()
    this.registerRoutes()
    this.setErrorHandler()

    // app.register(fastifyJwt, {
    //   secret: env.JWT_SECRET,
    //   cookie: {
    //     cookieName: 'refreshToken',
    //     signed: false,
    //   },
    //   sign: {
    //     expiresIn: '10m',
    //   },
    // })

    // app.register(fastifyCookie)
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

  private registerCors() {
    this.app.register(fastifyCors, {
      origin: 'http://localhost:5173',
    })
  }

  private registerRoutes() {
    // this.app.register(Routes, { prefix: '/tasks' })
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
        if (env.NODE_ENV !== 'production') {
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

      if (env.NODE_ENV !== 'production') {
        console.error(error)
      }

      return reply.status(HTTP_STATUS_CODE.serverError).send({
        title: 'Server Error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    })
  }
}
