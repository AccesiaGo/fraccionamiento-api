import pino from 'pino'
import { env } from '@config/env'

/**
 * Logger estructurado. En desarrollo se ve "bonito" en consola (pino-pretty);
 * en producción emite JSON plano, ideal para recolectores de logs (CloudWatch, Loki, etc).
 *
 * IMPORTANTE: nunca loguear objetos completos de req/res o de error sin filtrar,
 * ya que pueden contener tokens, contraseñas o datos sensibles. Ver `redact` abajo.
 */
export const logger = pino({
  level: env.isProd ? 'info' : 'debug',
  transport: env.isDev ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'req.body.refreshToken',
      '*.password',
      '*.token',
      '*.secret'
    ],
    censor: '[REDACTED]'
  }
})
