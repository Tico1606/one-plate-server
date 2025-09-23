import { ConflictError, NotFoundError, ValidationError } from '@/errors/index.ts'
import type {
  BaseCategory,
  UpdateCategoryData,
} from '@/interfaces/repositories/category-repository.ts'
import type { CategoryRepository } from '@/interfaces/repositories/index.ts'

export interface UpdateCategoryRequest extends UpdateCategoryData {
  id: string
}

export interface UpdateCategoryResponse {
  category: BaseCategory
}

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    const { id, ...updateData } = request

    // Validações básicas
    if (!id) {
      throw new ValidationError('ID da categoria é obrigatório')
    }

    if (updateData.name !== undefined && !updateData.name?.trim()) {
      throw new ValidationError('Nome da categoria não pode ser vazio')
    }

    // Verificar se a categoria existe
    const existingCategory = await this.categoryRepository.findById(id)

    if (!existingCategory) {
      throw new NotFoundError('Categoria não encontrada')
    }

    // Se o nome está sendo alterado, verificar se já existe outra categoria com o mesmo nome
    if (updateData.name && updateData.name.trim() !== existingCategory.name) {
      const categoryWithSameName = await this.categoryRepository.findByName(
        updateData.name.trim(),
      )

      if (categoryWithSameName) {
        throw new ConflictError('Já existe uma categoria com este nome')
      }
    }

    // Atualizar a categoria
    const category = await this.categoryRepository.update(id, {
      name: updateData.name?.trim(),
    })

    return { category }
  }
}
