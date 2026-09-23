import swaggerUi from 'swagger-ui-express'
import { fraccionamientoPaths, fraccionamientoSchemas } from '@modules/fraccionamientos/fraccionamiento.swagger'

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API de Fraccionamientos (Accessia)',
    version: '1.0.0',
    description: 'Documentación interactiva de la API para la gestión de fraccionamientos'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de Desarrollo'
    }
  ],
  paths: {
    '/api/healthcheck': {
      get: {
        summary: 'Verificar estado de la API',
        tags: ['Healthcheck'],
        responses: {
          '200': {
            description: 'API en ejecución',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', example: '2026-09-22T22:00:00.000Z' }
                  }
                }
              }
            }
          }
        }
      }
    },
    ...fraccionamientoPaths
  },
  components: {
    schemas: {
      ...fraccionamientoSchemas
    }
  }
}

export { swaggerUi }
