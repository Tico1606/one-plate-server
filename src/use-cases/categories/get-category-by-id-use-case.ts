import { NotFoundError, ValidationError } from '@/errors/index.ts'
import type { BaseCategory } from '@/interfaces/repositories/category-repository.ts'
import type { CategoryRepository } from '@/interfaces/repositories/index.ts'

export interface GetCategoryByIdRequest {
  id: string
}

export interface GetCategoryByIdResponse {
  category: BaseCategory
}

export class GetCategoryByIdUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: GetCategoryByIdRequest): Promise<GetCategoryByIdResponse> {
    // Validações básicas
    if (!request.id) {
      throw new ValidationError('ID da categoria é obrigatório')
    }

    // Buscar a categoria
    const category = await this.categoryRepository.findById(request.id)

    if (!category) {
      throw new NotFoundError('Categoria não encontrada')
    }

    return { category }
  }
}
