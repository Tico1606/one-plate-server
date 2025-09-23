import { ValidationError } from '@/errors/index.ts'
import type {
  BaseCategory,
  ListCategoriesParams,
} from '@/interfaces/repositories/category-repository.ts'
import type { CategoryRepository } from '@/interfaces/repositories/index.ts'

export interface ListCategoriesRequest extends ListCategoriesParams {}

export interface ListCategoriesResponse {
  categories: BaseCategory[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ListCategoriesUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: ListCategoriesRequest): Promise<ListCategoriesResponse> {
    // Validações básicas
    if (!request.page || request.page < 1) {
      throw new ValidationError('Página deve ser maior que 0')
    }

    if (!request.limit || request.limit < 1 || request.limit > 100) {
      throw new ValidationError('Limite deve estar entre 1 e 100')
    }

    // Buscar as categorias
    const { categories, total } = await this.categoryRepository.list(request)

    const totalPages = Math.ceil(total / request.limit)

    return {
      categories,
      total,
      page: request.page,
      limit: request.limit,
      totalPages,
    }
  }
}
