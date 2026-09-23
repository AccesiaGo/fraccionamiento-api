/**
 * Error de dominio/aplicación con código HTTP explícito.
 * Cualquier error "esperado" (no encontrado, validación, conflicto) debe lanzarse
 * como AppError para que el errorHandler global sepa exactamente qué status devolver
 * SIN exponer detalles internos del sistema.
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404)
  }
}

export class ValidationError extends AppError {
  public readonly details?: unknown
  constructor(message = 'Datos inválidos', details?: unknown) {
    super(message, 422)
    this.details = details
  }
}

export class ConflictError extends AppError {
  constructor(message = 'El recurso ya existe o está en conflicto') {
    super(message, 409)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No tienes permisos para esta acción') {
    super(message, 403)
  }
}
