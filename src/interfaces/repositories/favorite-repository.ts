import type { Favorite } from '@prisma/client'
import type {
  FavoriteCreateParams,
  FavoriteFilterParams,
} from '../../types/favorite/index.ts'

export interface IFavoriteRepository {
  find(params: FavoriteFilterParams): Promise<Favorite[]>
  create(data: FavoriteCreateParams): Promise<Favorite>
  delete(userId: string, recipeId: string): Promise<void>
}
