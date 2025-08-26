import { AppError } from './app-error.ts'

export class NotFoundError extends AppError {
  constructor(message?: string) {
    super('Not Found Error', message)
  }
}
