import { AppError } from './app-error.ts'

export class EnvError extends AppError {
  constructor(errors: Record<string, string[] | undefined>) {
    let errorMessage = ''

    for (const [key, messages] of Object.entries(errors)) {
      errorMessage += `${key}: ${messages?.join(', ')}; `
    }

    super('Env error', errorMessage)
  }
}
