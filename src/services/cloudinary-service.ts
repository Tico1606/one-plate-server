import { v2 as cloudinary } from 'cloudinary'
import { env } from '@/constants/env.ts'
import { ApiError } from '@/errors/index.ts'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

export interface UploadOptions {
  folder: 'recipes' | 'profiles'
  maxBytes?: number
  allowedFormats?: string[]
  transformations?: Record<string, any>
}

const DEFAULT_OPTIONS: Required<UploadOptions> = {
  folder: 'recipes',
  maxBytes: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  transformations: {
    quality: 'auto',
    fetch_format: 'auto',
  },
}

export class CloudinaryService {
  /**
   * Faz upload de uma imagem para o Cloudinary
   */
  static async uploadImage(
    file: Buffer,
    mimetype: string,
    options: Partial<UploadOptions> = {},
  ): Promise<UploadResult> {
    const config = { ...DEFAULT_OPTIONS, ...options }

    try {
      // Usar o tipo MIME real do arquivo passado como parâmetro
      const mimeType = mimetype || 'image/jpeg'
      const dataUrl = `data:${mimeType};base64,${file.toString('base64')}`

      const result = await cloudinary.uploader.upload(dataUrl, {
        folder: config.folder,
        resource_type: 'image',
        transformation: config.transformations,
      })

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      }
    } catch (error) {
      throw new ApiError(
        `Erro ao fazer upload da imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        500,
      )
    }
  }

  /**
   * Deleta uma imagem do Cloudinary usando o public_id
   */
  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId)
    } catch (error) {
      throw new ApiError(
        `Erro ao deletar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        500,
      )
    }
  }

  /**
   * Extrai o public_id de uma URL do Cloudinary
   */
  static extractPublicId(url: string): string | null {
    try {
      const urlParts = url.split('/')
      const filename = urlParts[urlParts.length - 1]
      const publicId = filename.split('.')[0]

      // Verificar se é uma URL válida do Cloudinary
      if (url.includes('cloudinary.com') && publicId) {
        return publicId
      }
      return null
    } catch {
      return null
    }
  }

  /**
   * Valida se o arquivo é uma imagem válida
   */
  static validateImageFile(
    file: { buffer: Buffer; mimetype: string; size: number },
    options: Partial<UploadOptions> = {},
  ): void {
    const config = { ...DEFAULT_OPTIONS, ...options }

    // Verificar tamanho
    if (file.size > config.maxBytes) {
      throw new ApiError(
        `Arquivo muito grande. Tamanho máximo permitido: ${config.maxBytes / (1024 * 1024)}MB`,
        400,
      )
    }

    // Verificar tipo MIME
    const allowedMimeTypes = config.allowedFormats.map(
      (format) => `image/${format === 'jpg' ? 'jpeg' : format}`,
    )

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiError(
        `Tipo de arquivo não permitido. Formatos aceitos: ${config.allowedFormats.join(', ')}`,
        400,
      )
    }
  }
}
