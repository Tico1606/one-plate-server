import type { Difficulty, RecipeStatus } from '@prisma/client'

// Interface auxiliar para os dados de nutrição, evitando repetição.
interface NutritionParam {
  calories?: number
  proteinGrams?: number
  carbGrams?: number
  fatGrams?: number
}

// Define o formato para um ingrediente quando aninhado na criação da receita
interface NestedIngredientParam {
  ingredientId: string
  amount?: number
  unit?: string
  note?: string
  group?: string
}

// Define o formato para um passo quando aninhado na criação da receita
interface NestedStepParam {
  order: number
  description: string
  durationSec?: number
}

// Parâmetros necessários para CRIAR uma nova receita.
// Note que inclui as relações (ingredientes, passos, etc.) que são criadas junto.
export interface RecipeCreateParams extends NutritionParam {
  title: string
  description?: string
  authorId: string
  difficulty: Difficulty
  prepMinutes: number
  cookMinutes: number
  servings: number
  videoUrl?: string
  source?: string

  // Relações que serão criadas junto com a receita
  ingredients: NestedIngredientParam[]
  steps: NestedStepParam[]
  categoryIds: string[]
}

// Parâmetros que podem ser enviados para ATUALIZAR uma receita existente.
// Todos os campos são opcionais.
export interface RecipeUpdateParams extends NutritionParam {
  title?: string
  description?: string
  difficulty?: Difficulty
  prepMinutes?: number
  cookMinutes?: number
  servings?: number
  videoUrl?: string
  source?: string
  status?: RecipeStatus
}

// Parâmetros disponíveis para FILTRAR a busca de receitas.
export interface RecipeFilterParams {
  title?: string
  authorId?: string
  status?: RecipeStatus
  difficulty?: Difficulty
  minCookTime?: number
  maxPrepTime?: number
  categoryIds?: string[]
  ingredientIds?: string[]
  page?: number
  pageSize?: number
}
