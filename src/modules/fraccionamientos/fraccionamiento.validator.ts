import { z } from 'zod'

const coordenadasSchema = z.object({
  lat: z.number({ required_error: 'La latitud debe ser un número' }),
  lng: z.number({ required_error: 'La longitud debe ser un número' })
})

export const createFraccionamientoSchema = z.object({
  body: z.object({
    slug: z.string().trim().min(2).max(120).optional(),
    nombre: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(120),
    estado: z.string().trim().min(2, 'El estado es requerido').max(120),
    ciudad: z.string().trim().min(2, 'La ciudad es requerida').max(120),
    direccion: z.string().trim().min(3, 'La dirección es requerida').max(250),
    coordenadas: coordenadasSchema.optional(),
    telefono: z.string().trim().min(7, 'Teléfono inválido').max(20),
    correo: z.string().trim().email('Correo electrónico inválido'),
    estatus: z.enum(['activo', 'inactivo']).optional().default('activo')
  })
})

export const updateFraccionamientoSchema = z.object({
  body: createFraccionamientoSchema.shape.body.partial(),
  params: z.object({ id: z.string().min(1) })
})

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1, 'id es requerido') })
})

export const listFraccionamientosSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(100).optional(),
    estatus: z.enum(['activo', 'inactivo']).optional()
  })
})

export type CreateFraccionamientoInput = z.infer<typeof createFraccionamientoSchema>['body']
export type UpdateFraccionamientoInput = z.infer<typeof updateFraccionamientoSchema>['body']


