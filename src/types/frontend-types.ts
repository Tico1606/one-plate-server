// =============================================================================
// TIPOS PARA FRONTEND - ONE PLATE APP
// =============================================================================

// Tipos base do sistema
export type Role = 'USER' | 'ADMIN'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type RecipeStatus = 'DRAFT' | 'PUBLISHED'

// =============================================================================
// TIPOS PARA RECEITAS
// =============================================================================

export interface Recipe {
  id: string
  title: string
  description?: string
  authorId: string
  author: User
  difficulty: Difficulty
  prepTime: number // Tempo total de preparo em minutos
  servings: number
  videoUrl?: string
  source?: string
  calories?: number
  proteinGrams?: number
  carbGrams?: number
  fatGrams?: number
  status: RecipeStatus
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date

  // Engajamento (campos calculados pelo backend)
  averageRating: number // Média das avaliações (0-5)
  totalReviews: number // Quantidade de avaliações
  totalFavorites: number // Quantidade de favoritos
  totalViews: number // Quantidade de visualizações
  image: string // Primeira foto ou placeholder

  // Conteúdo
  photos: RecipePhoto[]
  ingredients: RecipeIngredient[]
  instructions: RecipeInstruction[]
  categories: Category[]
  reviews: Review[]
  favorites: Favorite[]
  views: RecipeView[]
}

export interface RecipePhoto {
  id: string
  recipeId: string
  url: string
  order: number
}

export interface RecipeIngredient {
  id: string
  name: string
  amount?: number
  unit?: string
}

export interface RecipeInstruction {
  id: string
  order: number
  description: string
  durationSec?: number
}

export interface Review {
  id: string
  user: User
  rating: number // Rating de 1-5
  comment?: string
  createdAt: Date
  updatedAt: Date
}

export interface Favorite {
  userId: string
  recipeId: string
  createdAt: Date
}

export interface RecipeView {
  id: string
  userId?: string
  recipeId: string
  createdAt: Date
}

// =============================================================================
// TIPOS PARA CATEGORIAS
// =============================================================================

export interface Category {
  id: string
  name: string
}

// =============================================================================
// TIPOS PARA USUÁRIO
// =============================================================================

export interface User {
  id: string
  email: string
  name?: string
  photoUrl?: string
  role: Role
  createdAt: Date
  updatedAt: Date

  // Estatísticas (campos calculados pelo backend)
  stats?: UserStats
}

export interface UserStats {
  recipes: number
  favorites: number
  reviews: number
  views: number
  followers?: number
  following?: number
}

// =============================================================================
// TIPOS PARA AUTENTICAÇÃO
// =============================================================================

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// =============================================================================
// TIPOS PARA RESPOSTAS DA API
// =============================================================================

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// =============================================================================
// TIPOS PARA FILTROS E BUSCA
// =============================================================================

export interface RecipeFilters {
  // Filtros básicos
  search?: string
  category?: string
  difficulty?: Difficulty
  prepTime?: number // Tempo de preparo em minutos
  servings?: number // Número de porções

  // Filtros nutricionais
  maxCalories?: number
  minProtein?: number

  // Filtros de engajamento
  minRating?: number
  minFavorites?: number

  // Filtros de autor
  authorId?: string

  // Filtros de status
  status?: RecipeStatus
  featured?: boolean

  // Paginação
  page?: number
  limit?: number

  // Ordenação
  sortBy?:
    | 'createdAt'
    | 'title'
    | 'prepTime'
    | 'calories'
    | 'averageRating'
    | 'favorites'
    | 'servings'
    | 'difficulty'
  sortOrder?: 'asc' | 'desc'
}

// =============================================================================
// TIPOS PARA CRIAÇÃO E EDIÇÃO
// =============================================================================

export interface CreateRecipeRequest {
  title: string
  description?: string
  difficulty: Difficulty
  prepTime: number
  servings: number
  videoUrl?: string
  source?: string
  calories?: number
  proteinGrams?: number
  carbGrams?: number
  fatGrams?: number

  // Conteúdo
  images: string[] // URLs das imagens
  ingredients: Array<{
    name: string
    amount?: number
    unit?: string
  }>
  instructions: Array<{
    description: string
    durationSec?: number
  }>
  categories: string[] // IDs das categorias
}

export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {
  id: string
}

export interface CreateCategoryRequest {
  name: string
}

export interface UpdateCategoryRequest {
  id: string
  name: string
}

// =============================================================================
// TIPOS PARA INTERAÇÕES
// =============================================================================

export interface CreateReviewRequest {
  recipeId: string
  rating: number // Rating de 1-5
  comment?: string
}

export interface UpdateReviewRequest {
  id: string
  rating?: number // Rating de 1-5
  comment?: string
}

export interface ToggleFavoriteRequest {
  recipeId: string
}

// Removido: ToggleHelpfulRequest - não há mais sistema de "útil"

// =============================================================================
// TIPOS PARA DASHBOARD E ESTATÍSTICAS
// =============================================================================

export interface DashboardStats {
  totalRecipes: number
  totalFavorites: number
  totalViews: number
  totalReviews: number
  recentRecipes: Recipe[]
  popularRecipes: Recipe[]
  recentReviews: Review[]
}

export interface UserProfile {
  user: User
  recipes: Recipe[]
  favorites: Recipe[]
  reviews: Review[]
  stats: UserStats
}

// =============================================================================
// TIPOS PARA FORMULÁRIOS
// =============================================================================

export interface RecipeFormData {
  title: string
  description: string
  difficulty: Difficulty
  prepTime: number
  servings: number
  videoUrl: string
  source: string
  calories: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  images: File[] | string[]
  ingredients: Array<{
    name: string
    amount: number
    unit: string
  }>
  instructions: Array<{
    description: string
    durationSec: number
  }>
  categories: string[]
}

export interface UserFormData {
  name: string
  email: string
  photoUrl: File | string
}

// =============================================================================
// TIPOS PARA COMPONENTES UI
// =============================================================================

export interface RecipeCard {
  id: string
  title: string
  description?: string
  image: string
  author: {
    id: string
    name: string
    photoUrl?: string
  }
  difficulty: Difficulty
  prepTime: number
  servings: number
  averageRating: number
  totalReviews: number
  totalFavorites: number
  categories: string[]
  createdAt: Date
}

export interface CategoryCard {
  id: string
  name: string
}

export interface ReviewCard {
  id: string
  user: {
    id: string
    name: string
    photoUrl?: string
  }
  rating: number
  comment?: string
  createdAt: Date
  updatedAt: Date
}

// =============================================================================
// TIPOS PARA ESTADOS DE LOADING
// =============================================================================

export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// =============================================================================
// TIPOS PARA CONTEXTOS
// =============================================================================

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  updateProfile: (data: UserFormData) => Promise<void>
}

export interface RecipeContextType {
  recipes: Recipe[]
  loading: boolean
  error?: string
  filters: RecipeFilters
  pagination: PaginationState
  setFilters: (filters: RecipeFilters) => void
  loadRecipes: () => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

// =============================================================================
// TIPOS PARA HOOKS
// =============================================================================

export interface UseRecipesReturn {
  recipes: Recipe[]
  loading: boolean
  error?: string
  pagination: PaginationState
  filters: RecipeFilters
  setFilters: (filters: RecipeFilters) => void
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

export interface UseRecipeReturn {
  recipe: Recipe | null
  loading: boolean
  error?: string
  toggleFavorite: () => Promise<void>
  addReview: (data: CreateReviewRequest) => Promise<void>
  updateReview: (data: UpdateReviewRequest) => Promise<void>
  deleteReview: (id: string) => Promise<void>
}

// =============================================================================
// TIPOS PARA UTILITÁRIOS
// =============================================================================

export interface SearchResult {
  recipes: Recipe[]
  categories: Category[]
  users: User[]
  total: number
}

export interface SortOption {
  value: string
  label: string
  direction: 'asc' | 'desc'
}

export interface FilterOption {
  value: string
  label: string
  count?: number
}

// =============================================================================
// TIPOS PARA CONFIGURAÇÕES
// =============================================================================

export interface AppConfig {
  apiUrl: string
  uploadUrl: string
  maxFileSize: number
  allowedImageTypes: string[]
  pagination: {
    defaultLimit: number
    maxLimit: number
  }
  difficulty: {
    [key in Difficulty]: {
      label: string
      color: string
      icon: string
    }
  }
}
