import type {
  FavoriteCreateParams,
  FavoriteFilterParams,
} from '../../types/favorite/index.ts'

export interface IFavoriteRepository {
  findById(favoriteId: string): Promise<any | null>
  findMany(params: FavoriteFilterParams): Promise<any[]>
  create(data: FavoriteCreateParams): Promise<any>
  update(data: any, favoriteId: string): Promise<any>
  delete(favoriteId: string): Promise<void>
}
