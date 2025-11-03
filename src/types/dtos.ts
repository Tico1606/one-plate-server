// Data Transfer Objects (DTOs) para a camada de API

// ============================================================================
// DTOs Base (sem relacionamentos)
// ============================================================================

export type UserDTO = {
  id: string
  email: string
  name: string | null | undefined
  description: string | null | undefined
  photoUrl: string | null | undefined
  role: 'USER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

export type RecipeDTO = {
  id: string
  title: string
  description: string | null | undefined
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  prepTime: number // Tempo total de preparo em minutos
  servings: number
  videoUrl: string | null | undefined
  source: string | null | undefined
  calories: number | null | undefined
  proteinGrams: number | null | undefined
  carbGrams: number | null | undefined
  fatGrams: number | null | undefined
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt: Date | null | undefined
  createdAt: Date
  updatedAt: Date
  // Campos calculados
  averageRating: number
  totalReviews: number
  totalFavorites: number
  totalViews: number
  image: string // Primeira foto ou placeholder
  // Relacionamentos
  author: UserDTO
  photos: RecipePhotoDTO[]
  steps: RecipeStepDTO[]
  categories: RecipeCategoryDTO[]
  ingredients: RecipeIngredientDTO[]
  reviews: ReviewDTO[]
  favorites: FavoriteDTO[]
  views: RecipeViewDTO[]
}

export type RecipePhotoDTO = {
  id: string
  recipeId: string
  url: string
  order: number
}

export type RecipeStepDTO = {
  id: string
  recipeId: string
  order: number
  description: string
  durationSec: number | null | undefined
}

export type CategoryDTO = {
  id: string
  name: string
}

export type IngredientDTO = {
  id: string
  name: string
  description: string | null | undefined
  imageUrl: string | null | undefined
}

export type ReviewDTO = {
  id: string
  recipeId: string
  userId: string
  rating: number
  comment: string | null | undefined
  createdAt: Date
  updatedAt: Date
  // Relacionamentos
  user: UserDTO
  recipe?: RecipeDTO // Opcional para evitar recursão infinita
}

export type FavoriteDTO = {
  userId: string
  recipeId: string
  createdAt: Date
  // Relacionamentos
  recipe: RecipeDTO
  user: UserDTO
}

export type RecipeViewDTO = {
  id: string
  userId: string | null | undefined
  recipeId: string
  createdAt: Date
}

export type ShoppingListDTO = {
  id: string
  userId: string
  title: string
  createdAt: Date
  updatedAt: Date
  // Relacionamentos
  user: UserDTO
  items: ShoppingListItemDTO[]
}

export type ShoppingListItemDTO = {
  id: string
  listId: string
  ingredientId: string | null | undefined
  recipeId: string | null | undefined
  customText: string | null | undefined
  amount: number | null | undefined
  unit: string | null | undefined
  isChecked: boolean
  // Relacionamentos opcionais
  ingredient?: IngredientDTO | null
  recipe?: RecipeDTO | null
}

// ============================================================================
// DTOs para relacionamentos específicos
// ============================================================================

export type RecipeCategoryDTO = {
  id: string
  name: string
}

export type RecipeIngredientDTO = {
  id: string
  name: string
  amount: number | null | undefined
  unit: string | null | undefined
}

// ============================================================================
// DTOs para listagens (sem todos os relacionamentos)
// ============================================================================

export type RecipeListItemDTO = {
  id: string
  title: string
  description: string | null | undefined
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  prepTime: number // Tempo total de preparo em minutos
  servings: number
  calories: number | null | undefined
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt: Date | null | undefined
  createdAt: Date
  updatedAt: Date
  // Campos calculados
  averageRating: number
  totalReviews: number
  totalFavorites: number
  totalViews: number
  image: string // Primeira foto ou placeholder
  // Relacionamentos mínimos
  author: UserDTO
  photos: RecipePhotoDTO[]
  categories: RecipeCategoryDTO[]
  ingredients: RecipeIngredientDTO[]
}

export type ReviewListItemDTO = {
  id: string
  recipeId: string
  userId: string
  rating: number
  comment: string | null | undefined
  createdAt: Date
  updatedAt: Date
  // Relacionamentos mínimos
  user: UserDTO
}

// ============================================================================
// DTOs para criação/atualização (sem campos calculados)
// ============================================================================

export type CreateRecipeDTO = {
  title: string
  description?: string | null
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  prepMinutes: number
  cookMinutes: number
  servings: number
  videoUrl?: string | null
  source?: string | null
  calories?: number | null
  proteinGrams?: number | null
  carbGrams?: number | null
  fatGrams?: number | null
  photos?: Array<{
    url: string
    order: number
  }>
  steps: Array<{
    order: number
    description: string
    durationSec?: number | null
  }>
  ingredients: Array<{
    ingredientId: string
    amount?: number | null
    unit?: string | null
    note?: string | null
    group?: string | null
  }>
  categories?: string[]
}

export type UpdateRecipeDTO = Partial<CreateRecipeDTO>

export type CreateReviewDTO = {
  recipeId: string
  rating: number
  comment?: string | null
}

export type UpdateReviewDTO = {
  rating?: number
  comment?: string | null
}

export type CreateShoppingListDTO = {
  title: string
}

export type UpdateShoppingListDTO = {
  title?: string
}

export type CreateShoppingListItemDTO = {
  ingredientId?: string | null
  recipeId?: string | null
  customText?: string | null
  amount?: number | null
  unit?: string | null
}

export type UpdateShoppingListItemDTO = {
  ingredientId?: string | null
  recipeId?: string | null
  customText?: string | null
  amount?: number | null
  unit?: string | null
  isChecked?: boolean
}

// ============================================================================
// DTOs para respostas de API
// ============================================================================

export type PaginatedResponseDTO<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type RecipeListResponseDTO = PaginatedResponseDTO<RecipeListItemDTO>
export type ReviewListResponseDTO = PaginatedResponseDTO<ReviewListItemDTO>
export type ShoppingListResponseDTO = PaginatedResponseDTO<ShoppingListDTO>

// ============================================================================
// DTOs para estatísticas
// ============================================================================

export type RecipeStatsDTO = {
  averageRating: number
  totalReviews: number
  totalFavorites: number
  totalViews: number
  ratingDistribution: {
    rating: number
    count: number
  }[]
}

export type UserStatsDTO = {
  totalRecipes: number
  totalReviews: number
  totalFavorites: number
  averageRecipeRating: number
}
