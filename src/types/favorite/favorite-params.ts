import type {
  CreateFavoriteData,
  ListFavoritesParams,
} from '@/interfaces/repositories/favorite-repository.ts'

export interface FavoriteCreateParams extends CreateFavoriteData {}
export interface FavoriteFilterParams extends ListFavoritesParams {}
