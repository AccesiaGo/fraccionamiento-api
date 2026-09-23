import 'tsconfig-paths/register'
import { createApp } from './app'
import { env } from '@config/env'
import { connectToDatabase, disconnectFromDatabase } from '@infrastructure/database/connection'
import { logger } from '@infrastructure/logging/logger'

const start = async (): Promise<void> => {
  await connectToDatabase()

  const app = createApp()

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Servidor corriendo en http://localhost:${env.PORT} (${env.NODE_ENV})`)
  })

  // Apagado ordenado: importante en producción (K8s, ECS, etc.) para no cortar
  // peticiones en curso ni dejar conexiones a Mongo colgadas al reiniciar/desplegar.
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Recibido ${signal}, cerrando servidor...`)
    server.close(async () => {
      await disconnectFromDatabase()
      logger.info('Servidor cerrado correctamente.')
      process.exit(0)
    })
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
}

start().catch((error) => {
  logger.error({ error }, 'Error fatal al arrancar el servidor')
  process.exit(1)
})
