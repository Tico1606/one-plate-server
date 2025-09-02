// Tipos base extraídos do schema Prisma
export type Role = 'USER' | 'ADMIN'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type RecipeStatus = 'DRAFT' | 'PUBLISHED'
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

// Interfaces base das entidades
export interface BaseUser {
  id: string
  email: string
  name?: string | null
  photoUrl?: string | null
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface BaseRecipe {
  id: string
  title: string
  description?: string | null
  authorId: string
  difficulty: Difficulty
  prepMinutes: number
  cookMinutes: number
  servings: number
  videoUrl?: string | null
  source?: string | null
  calories?: number | null
  proteinGrams?: number | null
  carbGrams?: number | null
  fatGrams?: number | null
  status: RecipeStatus
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface BaseRecipePhoto {
  id: string
  recipeId: string
  url: string
  order: number
}

export interface BaseStep {
  id: string
  recipeId: string
  order: number
  description: string
  durationSec?: number | null
}

export interface BaseCategory {
  id: string
  name: string
}

export interface BaseIngredient {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
}

export interface BaseRecipeIngredient {
  recipeId: string
  ingredientId: string
  amount?: number | null
  unit?: string | null
  note?: string | null
  group?: string | null
}

export interface BaseReview {
  id: string
  recipeId: string
  userId: string
  rating: number
  comment?: string | null
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
}

export interface BaseFavorite {
  userId: string
  recipeId: string
  createdAt: Date
}

export interface BaseRecipeView {
  id: string
  userId?: string | null
  recipeId: string
  createdAt: Date
}

export interface BaseShoppingList {
  id: string
  userId: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export interface BaseShoppingListItem {
  id: string
  listId: string
  ingredientId?: string | null
  recipeId?: string | null
  customText?: string | null
  amount?: number | null
  unit?: string | null
  isChecked: boolean
}

// Interfaces com relacionamentos
export interface RecipeWithRelations extends BaseRecipe {
  author: BaseUser
  photos: BaseRecipePhoto[]
  steps: BaseStep[]
  categories: Array<{
    category: BaseCategory
  }>
  ingredients: Array<{
    ingredient: BaseIngredient
    amount?: number | null
    unit?: string | null
    note?: string | null
    group?: string | null
  }>
  reviews: BaseReview[]
  favorites: BaseFavorite[]
  views: BaseRecipeView[]
  _count?: {
    reviews: number
    favorites: number
    views: number
  }
}

export interface UserWithRelations extends BaseUser {
  recipes: BaseRecipe[]
  reviews: BaseReview[]
  favorites: Array<{
    recipe: BaseRecipe
    createdAt: Date
  }>
  shoppingLists: BaseShoppingList[]
  recipeViews: BaseRecipeView[]
}

export interface ReviewWithRelations extends BaseReview {
  recipe: BaseRecipe
  user: BaseUser
}

export interface FavoriteWithRelations extends BaseFavorite {
  recipe: RecipeWithRelations
  user: BaseUser
}

export interface ShoppingListWithRelations extends BaseShoppingList {
  user: BaseUser
  items: Array<{
    id: string
    ingredientId?: string | null
    recipeId?: string | null
    customText?: string | null
    amount?: number | null
    unit?: string | null
    isChecked: boolean
    ingredient?: BaseIngredient | null
    recipe?: BaseRecipe | null
  }>
}
