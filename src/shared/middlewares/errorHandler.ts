import { type Request, type Response, type NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '@shared/errors/AppError'
import { logger } from '@infrastructure/logging/logger'

/**
 * Manejador de errores CENTRALIZADO y GLOBAL.
 *
 * Regla de oro (la vimos en el análisis del Proyecto B): el detalle real del error
 * SOLO se loguea internamente. Al cliente NUNCA se le devuelve el stack trace ni el
 * mensaje interno de errores no controlados, sin importar el entorno (NODE_ENV).
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1) Errores de negocio/validación conocidos -> mensaje seguro y específico
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path }, err.message)
    }
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err instanceof Object && 'details' in err ? { details: (err as any).details } : {})
    })
    return
  }

  // 2) Errores de validación de Zod que se hayan escapado hasta aquí
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: 'Datos inválidos',
      details: err.flatten().fieldErrors
    })
    return
  }

  // 3) Duplicado de índice único en MongoDB (E11000)
  if (typeof err === 'object' && err !== null && 'code' in err && (err as any).code === 11000) {
    const keyPattern = (err as any).keyPattern ?? {}
    const fields = Object.keys(keyPattern).join(', ')
    res.status(409).json({
      success: false,
      message: `Ya existe un registro con ese valor en: ${fields || 'campo único'}`
    })
    return
  }

  // 4) Cualquier otra cosa: error interno NO controlado.
  // Se loguea completo internamente, pero al cliente SIEMPRE se le da un mensaje genérico.
  logger.error({ err, path: req.path }, 'Error interno no controlado')
  res.status(500).json({
    success: false,
    message: 'Ocurrió un error interno. Intenta de nuevo más tarde.'
  })
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.originalUrl}` })
}
