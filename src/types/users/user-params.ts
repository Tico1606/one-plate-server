import type {
  CreateUserData,
  ListUsersParams,
  UpdateUserData,
} from '@/interfaces/repositories/user-repository.ts'

export interface UserCreateParams extends CreateUserData {}
export interface UserUpdateParams extends UpdateUserData {}
export interface UserFilterParams extends ListUsersParams {}
