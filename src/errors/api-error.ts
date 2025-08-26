import { HTTP_STATUS_CODE } from '@/constants/index.ts'
import { AppError } from './app-error.ts'

export class ApiError extends AppError {
  readonly statusCode: number

  constructor(message: string, statusCode?: number) {
    super('Api error', message)
    this.statusCode = statusCode ?? HTTP_STATUS_CODE.serverError
  }
}
