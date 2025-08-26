import { AppError } from './app-error.ts'

export class ValidationError extends AppError {
  constructor(message?: string) {
    super('Validation Error', message)
  }
}
