import { NotFoundError, ValidationError } from '@/errors/index.ts'
import type { CategoryRepository } from '@/interfaces/repositories/index.ts'

export interface DeleteCategoryRequest {
  id: string
}

export interface DeleteCategoryResponse {
  message: string
}

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: DeleteCategoryRequest): Promise<DeleteCategoryResponse> {
    // Validações básicas
    if (!request.id) {
      throw new ValidationError('ID da categoria é obrigatório')
    }

    // Verificar se a categoria existe
    const existingCategory = await this.categoryRepository.findById(request.id)

    if (!existingCategory) {
      throw new NotFoundError('Categoria não encontrada')
    }

    // Deletar a categoria
    await this.categoryRepository.delete(request.id)

    return { message: 'Categoria deletada com sucesso' }
  }
}
