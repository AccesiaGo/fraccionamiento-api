import { type Request, type Response, type NextFunction } from 'express'
import { type ZodSchema } from 'zod'

/**
 * Middleware genérico de validación: valida body/query/params contra un schema de Zod
 * y, si pasa, REEMPLAZA req.body/query/params con la versión ya parseada y tipada
 * (con valores por defecto aplicados, coerciones de tipo, trims, etc).
 * Si falla, delega al errorHandler global vía next(error) -> lo captura como ZodError.
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params })

    if (!result.success) {
      next(result.error)
      return
    }

    const parsed = result.data as { body?: unknown; query?: unknown; params?: unknown }
    if (parsed.body !== undefined) req.body = parsed.body
    if (parsed.query !== undefined) Object.assign(req.query, parsed.query)
    if (parsed.params !== undefined) Object.assign(req.params, parsed.params)

    next()
  }
