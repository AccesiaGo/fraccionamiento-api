import { type Request, type Response, type NextFunction, type RequestHandler } from 'express'

/**
 * Envuelve controllers async para que cualquier excepción (incluidas promesas rechazadas)
 * caiga automáticamente en el errorHandler global, sin necesidad de try/catch repetido
 * en cada controller.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next)
  }
