import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getAuthMiddleware } from '@/middleware/dev-auth.ts'
import { CloudinaryService } from '@/services/cloudinary-service.ts'

export async function uploadsRoutes(fastify: FastifyInstance) {
  // Upload de foto de receita
  fastify.post(
    '/uploads/recipe-photo',
    {
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
        const data = await request.file()

        if (!data) {
          return reply.status(400).send({
            message: 'Nenhum arquivo foi enviado',
            error: 'NO_FILE',
          })
        }

        // Ler o arquivo para Buffer
        const buffer = await data.toBuffer()

        // Validar arquivo
        CloudinaryService.validateImageFile(
          {
            buffer,
            mimetype: data.mimetype,
            size: buffer.length,
          },
          {
            folder: 'recipes',
            maxBytes: 5 * 1024 * 1024, // 5MB
          },
        )

        // Fazer upload para o Cloudinary
        const uploadResult = await CloudinaryService.uploadImage(buffer, data.mimetype, {
          folder: 'recipes',
          transformations: {
            quality: 'auto',
            fetch_format: 'auto',
            width: 1200,
            crop: 'limit',
          },
        })

        return reply.send({
          success: true,
          data: {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            bytes: uploadResult.bytes,
          },
        })
      } catch (error: any) {
        if (error.statusCode) {
          return reply.status(error.statusCode).send({
            message: error.message,
            error: error.code,
          })
        }

        return reply.status(500).send({
          message: 'Erro interno do servidor',
          error: 'INTERNAL_ERROR',
        })
      }
    },
  )

  // Upload de foto de perfil
  fastify.post(
    '/uploads/profile-photo',
    {
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
        const data = await request.file()

        if (!data) {
          return reply.status(400).send({
            message: 'Nenhum arquivo foi enviado',
            error: 'NO_FILE',
          })
        }

        // Ler o arquivo para Buffer
        const buffer = await data.toBuffer()

        // Validar arquivo
        CloudinaryService.validateImageFile(
          {
            buffer,
            mimetype: data.mimetype,
            size: buffer.length,
          },
          {
            folder: 'profiles',
            maxBytes: 3 * 1024 * 1024, // 3MB para fotos de perfil
          },
        )

        // Fazer upload para o Cloudinary
        const uploadResult = await CloudinaryService.uploadImage(buffer, data.mimetype, {
          folder: 'profiles',
          transformations: {
            quality: 'auto',
            fetch_format: 'auto',
            width: 400,
            height: 400,
            crop: 'fill',
            gravity: 'face',
          },
        })

        return reply.send({
          success: true,
          data: {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            bytes: uploadResult.bytes,
          },
        })
      } catch (error: any) {
        if (error.statusCode) {
          return reply.status(error.statusCode).send({
            message: error.message,
            error: error.code,
          })
        }

        return reply.status(500).send({
          message: 'Erro interno do servidor',
          error: 'INTERNAL_ERROR',
        })
      }
    },
  )

  // Deletar imagem (opcional - para cleanup)
  fastify.delete(
    '/uploads/photo',
    {
      schema: {
        body: z.object({
          url: z.string().url('URL inválida'),
        }),
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
        const { url } = request.body as { url: string }

        // Extrair public_id da URL
        const publicId = CloudinaryService.extractPublicId(url)

        if (!publicId) {
          return reply.status(400).send({
            message: 'URL inválida do Cloudinary',
            error: 'INVALID_URL',
          })
        }

        // Deletar do Cloudinary
        await CloudinaryService.deleteImage(publicId)

        return reply.send({
          success: true,
          message: 'Imagem deletada com sucesso',
        })
      } catch (error: any) {
        if (error.statusCode) {
          return reply.status(error.statusCode).send({
            message: error.message,
            error: error.code,
          })
        }

        return reply.status(500).send({
          message: 'Erro interno do servidor',
          error: 'INTERNAL_ERROR',
        })
      }
    },
  )
}
