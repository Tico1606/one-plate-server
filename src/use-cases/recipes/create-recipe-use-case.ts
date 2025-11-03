import { ConflictError, ValidationError } from '@/errors/index.ts'
import type { RecipeRepository } from '@/interfaces/repositories/index.ts'
import type { CreateRecipeData } from '@/interfaces/repositories/recipe-repository.ts'
import { toRecipeDTO } from '@/types/converters.ts'
import type { RecipeDTO } from '@/types/dtos.ts'
import { processNutritionalFields } from '@/utils/nutrition-processor.ts'

export interface CreateRecipeRequest extends CreateRecipeData {}

export interface CreateRecipeResponse {
  recipe: RecipeDTO
}

export class CreateRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(request: CreateRecipeRequest): Promise<CreateRecipeResponse> {
    // Processar campos nutricionais (substituir vazios por "-")
    const processedRequest = processNutritionalFields(request)

    // Validações básicas
    if (!processedRequest.title?.trim()) {
      throw new ValidationError('Título é obrigatório')
    }

    if (!processedRequest.authorId) {
      throw new ValidationError('ID do autor é obrigatório')
    }

    if (!processedRequest.steps || processedRequest.steps.length === 0) {
      throw new ValidationError('Pelo menos um passo é obrigatório')
    }

    if (!processedRequest.ingredients || processedRequest.ingredients.length === 0) {
      throw new ValidationError('Pelo menos um ingrediente é obrigatório')
    }

    // Verificar se já existe uma receita com o mesmo título do mesmo autor
    const existingRecipes = await this.recipeRepository.list({
      page: 1,
      limit: 1,
      search: processedRequest.title,
      authorId: processedRequest.authorId,
    })

    if (existingRecipes.recipes.length > 0) {
      throw new ConflictError('Já existe uma receita com este título')
    }

    // Criar a receita
    const recipe = await this.recipeRepository.create(processedRequest)

    // Buscar a receita criada com todos os relacionamentos para converter para DTO
    const createdRecipe = await this.recipeRepository.findByIdWithRelations(
      recipe.id,
      processedRequest.authorId,
    )
    if (!createdRecipe) {
      throw new Error('Erro ao buscar receita criada')
    }

    return { recipe: toRecipeDTO(createdRecipe) }
  }
}
