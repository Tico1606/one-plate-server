import { ConflictError, ValidationError } from '@/errors/index.ts'
import type {
  BaseCategory,
  CreateCategoryData,
} from '@/interfaces/repositories/category-repository.ts'
import type { CategoryRepository } from '@/interfaces/repositories/index.ts'

export interface CreateCategoryRequest extends CreateCategoryData {}

export interface CreateCategoryResponse {
  category: BaseCategory
}

export class CreateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    // Validações básicas
    if (!request.name?.trim()) {
      throw new ValidationError('Nome da categoria é obrigatório')
    }

    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategory = await this.categoryRepository.findByName(request.name.trim())

    if (existingCategory) {
      throw new ConflictError('Já existe uma categoria com este nome')
    }

    // Criar a categoria
    const category = await this.categoryRepository.create({
      name: request.name.trim(),
    })

    return { category }
  }
}
