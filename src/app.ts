import express, { type Application, type Request, type Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import pinoHttp from 'pino-http'

import { env } from '@config/env'
import { corsOptions, GENERAL_RATE_LIMIT, HELMET_OPTIONS } from '@config/security'
import { swaggerUi, swaggerDocument } from '@config/swagger'
import { logger } from '@infrastructure/logging/logger'
import { errorHandler, notFoundHandler } from '@shared/middlewares/errorHandler'

import fraccionamientoRoutes from '@modules/fraccionamientos/fraccionamiento.routes'

export const createApp = (): Application => {
  const app = express()

  // Si en producción vas detrás de un load balancer / proxy (Nginx, ALB, Cloudflare),
  // esto es necesario para que rate-limit y logs usen la IP real del cliente.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(helmet(HELMET_OPTIONS))
  app.use(cors(corsOptions))
  app.use(express.json({ limit: '1mb' }))
  app.use(compression())
  app.use(mongoSanitize()) // previene inyección de operadores $ / . en body/query/params
  app.use(hpp()) // previene HTTP Parameter Pollution

  if (!env.isDev) {
    app.use(rateLimit(GENERAL_RATE_LIMIT))
  }

  app.use(pinoHttp({ logger }))

  // Documentación interactiva Swagger
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.get('/api/healthcheck', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Rutas de negocio, versionadas desde el día 1.
  app.use('/api/v1/fraccionamientos', fraccionamientoRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

