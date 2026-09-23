import 'dotenv/config'
import { z } from 'zod'

/**
 * Validamos las variables de entorno AL ARRANCAR la app.
 * Si falta algo o tiene el formato incorrecto, el proceso truena de inmediato
 * en vez de fallar silenciosamente en medio de una petición en producción.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI es requerido'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET debe tener al menos 32 caracteres'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET debe tener al menos 32 caracteres'),
  ALLOWED_ORIGINS: z.string().default('')
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Variables de entorno inválidas:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === 'production',
  isDev: parsed.data.NODE_ENV === 'development',
  allowedOrigins: parsed.data.ALLOWED_ORIGINS.split(',').filter(Boolean)
}
