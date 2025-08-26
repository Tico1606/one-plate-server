import { AppError } from './app-error.ts'

export class ConflictError extends AppError {
  constructor(message?: string) {
    super('Conflict Error', message)
  }
}
