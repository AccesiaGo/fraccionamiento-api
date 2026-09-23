import mongoose from 'mongoose'
import { env } from '@config/env'
import { logger } from '@infrastructure/logging/logger'

/**
 * Conexión a MongoDB usando el URI que ya tienes (Atlas u on-premise).
 * - Reintenta la conexión inicial si falla (útil en arranque de contenedores/orquestadores).
 * - Loguea eventos de conexión perdida/reconexión, clave para diagnosticar problemas
 *   de concurrencia o de red en producción.
 * - Si tu URI apunta a un REPLICA SET (Atlas siempre lo es), esto ya te habilita
 *   transacciones multi-documento más adelante (necesarias para operaciones
 *   compuestas, ej. crear un Fraccionamiento y su registro de auditoría en una sola transacción).
 */
export const connectToDatabase = async (retries = 5, delayMs = 3000): Promise<void> => {
  mongoose.set('strictQuery', true)

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB conectado')
  })

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'Error en la conexión de MongoDB')
  })

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB desconectado')
  })

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI)
      return
    } catch (error) {
      logger.error({ error, attempt }, `Intento ${attempt}/${retries} de conexión a MongoDB falló`)
      if (attempt === retries) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

export const disconnectFromDatabase = async (): Promise<void> => {
  await mongoose.disconnect()
}
