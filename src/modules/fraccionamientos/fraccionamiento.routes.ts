import { Router } from 'express'
import { FraccionamientoController } from './fraccionamiento.controller'
import { validate } from '@shared/middlewares/validate'
import { asyncHandler } from '@shared/utils/asyncHandler'
import {
  createFraccionamientoSchema,
  updateFraccionamientoSchema,
  idParamSchema,
  listFraccionamientosSchema
} from './fraccionamiento.validator'

/**
 * NOTA: estas rutas hoy están abiertas (sin auth) a propósito, porque todavía
 * no construimos el módulo de autenticación/roles. En el siguiente paso agregamos
 * aquí mismo el middleware `verifyToken` + `requireRole([...])`, igual que hicimos
 * en el análisis (equivalente a [Authorize(Policy = "Role:Admin")] del proyecto .NET).
 */
const router = Router()
const controller = new FraccionamientoController()

router.get('/', validate(listFraccionamientosSchema), asyncHandler(controller.list))
router.get('/:id', validate(idParamSchema), asyncHandler(controller.getById))
router.post('/', validate(createFraccionamientoSchema), asyncHandler(controller.create))
router.put('/:id', validate(updateFraccionamientoSchema), asyncHandler(controller.update))
router.delete('/:id', validate(idParamSchema), asyncHandler(controller.delete))

export default router
