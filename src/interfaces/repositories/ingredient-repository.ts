import type { BaseIngredient } from '@/types/base/index.ts'

export interface ListIngredientsParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateIngredientData {
  name: string
  description?: string
  imageUrl?: string
}

export interface UpdateIngredientData {
  name?: string
  description?: string
  imageUrl?: string
}

export interface IngredientRepository {
  findById(id: string): Promise<BaseIngredient | null>
  findByName(name: string): Promise<BaseIngredient | null>
  list(
    params: ListIngredientsParams,
  ): Promise<{ ingredients: BaseIngredient[]; total: number }>
  create(data: CreateIngredientData): Promise<BaseIngredient>
  update(id: string, data: UpdateIngredientData): Promise<BaseIngredient>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
}
