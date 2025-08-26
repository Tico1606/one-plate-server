import { AppError } from './app-error.ts'

export class DatabaseError extends AppError {
  constructor(message?: string) {
    super('Database Error', message)
  }
}
