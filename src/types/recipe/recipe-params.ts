import type { Difficulty, RecipeStatus } from '@prisma/client'

interface NestedIngredientParam {
  ingredientId: string
  amount?: number
  unit?: string
  note?: string
  group?: string
}

interface NestedStepParam {
  order: number
  description: string
  durationSec?: number
}

export interface RecipeCreateParams {
  title: string
  description?: string
  authorId: string
  difficulty: Difficulty
  prepMinutes: number
  cookMinutes: number
  servings: number
  videoUrl?: string
  source?: string
  nutrition?: any
  ingredients: NestedIngredientParam[]
  steps: NestedStepParam[]
  categoryIds: string[]
}

export interface RecipeUpdateParams {
  title?: string
  description?: string
  difficulty?: Difficulty
  prepMinutes?: number
  cookMinutes?: number
  servings?: number
  videoUrl?: string
  source?: string
  nutrition?: any
  status?: RecipeStatus
  moderationNotes?: string
}

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
