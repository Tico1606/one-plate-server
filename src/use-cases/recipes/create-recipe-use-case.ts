import { ConflictError, ValidationError } from '@/errors/index.ts'
import type { RecipeRepository } from '@/interfaces/repositories/index.ts'
import type { CreateRecipeData } from '@/interfaces/repositories/recipe-repository.ts'
import { toRecipeDTO } from '@/types/converters.ts'
import type { RecipeDTO } from '@/types/dtos.ts'

export interface CreateRecipeRequest extends CreateRecipeData {}

export interface CreateRecipeResponse {
  recipe: RecipeDTO
}

export class CreateRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(request: CreateRecipeRequest): Promise<CreateRecipeResponse> {
    // Validações básicas
    if (!request.title?.trim()) {
      throw new ValidationError('Título é obrigatório')
    }

    if (!request.authorId) {
      throw new ValidationError('ID do autor é obrigatório')
    }

    if (!request.steps || request.steps.length === 0) {
      throw new ValidationError('Pelo menos um passo é obrigatório')
    }

    if (!request.ingredients || request.ingredients.length === 0) {
      throw new ValidationError('Pelo menos um ingrediente é obrigatório')
    }

    // Verificar se já existe uma receita com o mesmo título do mesmo autor
    const existingRecipes = await this.recipeRepository.list({
      page: 1,
      limit: 1,
      search: request.title,
      authorId: request.authorId,
    })

    if (existingRecipes.recipes.length > 0) {
      throw new ConflictError('Já existe uma receita com este título')
    }

    // Criar a receita
    const recipe = await this.recipeRepository.create(request)

    // Buscar a receita criada com todos os relacionamentos para converter para DTO
    const createdRecipe = await this.recipeRepository.findByIdWithRelations(
      recipe.id,
      request.authorId,
    )
    if (!createdRecipe) {
      throw new Error('Erro ao buscar receita criada')
    }

    return { recipe: toRecipeDTO(createdRecipe) }
  }
}
