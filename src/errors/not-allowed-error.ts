import { AppError } from './app-error.ts'

export class NotAllowedError extends AppError {
  constructor(message?: string) {
    super('Auth Error', message)
  }
}
