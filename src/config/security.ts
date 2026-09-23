import { type CorsOptions } from 'cors'
import { type Options as RateLimitOptions } from 'express-rate-limit'
import { env } from '@config/env'

/**
 * CORS con whitelist explícita por entorno.
 * En dev permitimos cualquier origen para facilitar pruebas locales (Postman, frontend en localhost).
 * En producción SOLO se permiten los orígenes declarados en ALLOWED_ORIGINS — cualquier otro
 * origen es rechazado explícitamente (mismo patrón que vimos en tu Proyecto A de referencia).
 */
export const corsOptions: CorsOptions = env.isDev
  ? { origin: '*' }
  : {
      origin: (origin, callback) => {
        // origin === undefined ocurre en llamadas server-to-server / curl / Postman sin header Origin
        if (!origin || env.allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error('No permitido por política de CORS'))
        }
      },
      credentials: true
    }

/**
 * Rate limit GENERAL para toda la API. Los endpoints sensibles (login, refresh, etc.)
 * llevarán su PROPIO limitador más estricto cuando construyamos el módulo de auth.
 */
export const GENERAL_RATE_LIMIT: Partial<RateLimitOptions> = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes, intenta de nuevo más tarde.' }
}

export const HELMET_OPTIONS = {
  xPoweredBy: false as const,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}
