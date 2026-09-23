# Guía de Arquitectura y Desarrollo — API de Fraccionamientos (Accessia)

Documento oficial de referencia sobre la arquitectura, estructura modular y guía paso a paso para extender y crear nuevos módulos en la API (`Node.js` + `TypeScript` + `Express` + `MongoDB`).

---

## 1. Instalación y Arranque

```bash
# 1. Instalar dependencias del proyecto
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita tu .env con la URI de MongoDB apuntando a la base de datos 'accesia'

# 3. Levantar en modo desarrollo con recarga automática
npm run dev
```

---

## 2. Documentación de la API y Pruebas con Swagger UI

### Acceso a Swagger:
 **[http://localhost:3000/docs](http://localhost:3000/docs)**

### ¿Cómo funciona Swagger en este proyecto?
La documentación utiliza una **Arquitectura Modular**:
- Cada módulo maneja su propia especificación OpenAPI en un archivo `<modulo>.swagger.ts` dentro de su carpeta.
- El archivo principal `src/config/swagger.ts` solo une (`...spread`) los paths y schemas de cada módulo, manteniendo la configuración limpia, legible y escalable.

---

## 3. Estructura Completa del Proyecto

```text
fraccionamiento-api/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── src/
    ├── app.ts                          # Composición de Express (Middlewares, Swagger y Rutas)
    ├── server.ts                       # Arranque HTTP, conexión a MongoDB y apagado controlado
    ├── config/
    │   ├── env.ts                      # Validación de variables de entorno con Zod
    │   ├── security.ts                 # CORS, Rate-Limit y Helmet
    │   └── swagger.ts                  # Integración modular de documentación Swagger
    ├── infrastructure/
    │   ├── database/connection.ts      # Conexión a MongoDB Atlas con reintentos
    │   └── logging/logger.ts           # Logger estructurado (Pino)
    ├── shared/
    │   ├── errors/AppError.ts          # Excepciones de negocio (404, 409, 422, etc.)
    │   ├── middlewares/
    │   │   ├── errorHandler.ts         # Manejo global de errores centralizado
    │   │   └── validate.ts             # Middleware generador de validación Zod
    │   └── utils/asyncHandler.ts       # Wrapper para controladores asíncronos
    └── modules/
        └── fraccionamientos/           # MÓDULO DE FRACCIONAMIENTOS
            ├── fraccionamiento.model.ts       # 1. Esquema Mongoose + Interfaz
            ├── fraccionamiento.dto.ts         # 2. DTO de salida / Respuesta limpia
            ├── fraccionamiento.validator.ts   # 3. Esquemas de validación Zod
            ├── fraccionamiento.repository.ts  # 4. Capa de persistencia (Soft Delete)
            ├── fraccionamiento.service.ts     # 5. Casos de uso y reglas de negocio
            ├── fraccionamiento.controller.ts  # 6. Controlador HTTP (req / res)
            ├── fraccionamiento.routes.ts      # 7. Definición de rutas Express
            └── fraccionamiento.swagger.ts     # 8. Documentación OpenAPI del módulo
```

---

## 4. Guía Paso a Paso: Cómo Crear un Nuevo Módulo

Sigue estrictamente este **orden de creación de 8 pasos** para construir cualquier nuevo recurso en el proyecto (por ejemplo `usuarios`, `casas`, `puertas`, etc.).

---

### Paso 1: `[modulo].model.ts` (Modelo de Datos)
Define la interfaz TypeScript de la entidad y el Schema de Mongoose.
- Debe incluir `collection` explícito (ej. `fraccionamientos`).
- Debe implementar **Soft Delete** con el campo `deletedAt?: Date | null`.

```ts
// src/modules/fraccionamientos/fraccionamiento.model.ts
import { Schema, model, type Document, Types } from 'mongoose'

export type EstatusFraccionamiento = 'activo' | 'inactivo'

export interface IFraccionamiento extends Document {
  _id: Types.ObjectId
  slug: string
  nombre: string
  estado: string
  ciudad: string
  direccion: string
  coordenadas?: {
    lat: number
    lng: number
  }
  telefono: string
  correo: string
  estatus: EstatusFraccionamiento
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const fraccionamientoSchema = new Schema<IFraccionamiento>(
  {
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    nombre: { type: String, required: true, trim: true, unique: true, maxlength: 120 },
    estado: { type: String, required: true, trim: true },
    ciudad: { type: String, required: true, trim: true },
    direccion: { type: String, required: true, trim: true },
    coordenadas: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false }
    },
    telefono: { type: String, required: true, trim: true },
    correo: { type: String, required: true, trim: true, lowercase: true },
    estatus: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true, collection: 'fraccionamientos' }
)

fraccionamientoSchema.index({ nombre: 'text', slug: 'text', estado: 'text', ciudad: 'text', direccion: 'text', correo: 'text' })

export const FraccionamientoModel = model<IFraccionamiento>('Fraccionamiento', fraccionamientoSchema, 'fraccionamientos')
```

---

### Paso 2: `[modulo].dto.ts` (DTO de Salida)
Define la forma exacta que se expondrá al cliente. **Nunca expongas el documento directo de Mongoose**.

```ts
// src/modules/fraccionamientos/fraccionamiento.dto.ts
import { type IFraccionamiento, type EstatusFraccionamiento } from './fraccionamiento.model'

export interface FraccionamientoResponseDto {
  id: string
  slug: string
  nombre: string
  estado: string
  ciudad: string
  direccion: string
  coordenadas?: {
    lat: number
    lng: number
  }
  telefono: string
  correo: string
  estatus: EstatusFraccionamiento
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export const toFraccionamientoDto = (doc: IFraccionamiento): FraccionamientoResponseDto => ({
  id: doc._id.toString(),
  slug: doc.slug,
  nombre: doc.nombre,
  estado: doc.estado,
  ciudad: doc.ciudad,
  direccion: doc.direccion,
  coordenadas: doc.coordenadas?.lat !== undefined && doc.coordenadas?.lng !== undefined
    ? { lat: doc.coordenadas.lat, lng: doc.coordenadas.lng }
    : undefined,
  telefono: doc.telefono,
  correo: doc.correo,
  estatus: doc.estatus,
  deletedAt: doc.deletedAt ?? null,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
})
```

---

### Paso 3: `[modulo].validator.ts` (Validación de Entradas con Zod)
Define las reglas de forma para `body`, `params` y `query`.

```ts
// src/modules/fraccionamientos/fraccionamiento.validator.ts
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
```

---

### Paso 4: `[modulo].repository.ts` (Capa de Datos)
Único lugar del sistema que ejecuta queries de Mongoose. Implementa **Soft Delete**.

```ts
// src/modules/fraccionamientos/fraccionamiento.repository.ts
import { FraccionamientoModel, type IFraccionamiento, type EstatusFraccionamiento } from './fraccionamiento.model'

export interface ListFilters {
  page: number
  pageSize: number
  search?: string
  estatus?: EstatusFraccionamiento
}

export class FraccionamientoRepository {
  async create(data: Partial<IFraccionamiento>): Promise<IFraccionamiento> {
    return FraccionamientoModel.create(data)
  }

  async findById(id: string): Promise<IFraccionamiento | null> {
    return FraccionamientoModel.findById(id)
  }

  async findByNombre(nombre: string): Promise<IFraccionamiento | null> {
    return FraccionamientoModel.findOne({ nombre })
  }

  async findBySlug(slug: string): Promise<IFraccionamiento | null> {
    return FraccionamientoModel.findOne({ slug })
  }

  async list(filters: ListFilters): Promise<{ items: IFraccionamiento[]; total: number }> {
    const query: Record<string, unknown> = {}
    query.estatus = filters.estatus ? filters.estatus : 'activo'

    if (filters.search) {
      query.$text = { $search: filters.search }
    }

    const skip = (filters.page - 1) * filters.pageSize
    const [items, total] = await Promise.all([
      FraccionamientoModel.find(query).skip(skip).limit(filters.pageSize).sort({ createdAt: -1 }),
      FraccionamientoModel.countDocuments(query)
    ])

    return { items, total }
  }

  async updateById(id: string, data: Partial<IFraccionamiento>): Promise<IFraccionamiento | null> {
    return FraccionamientoModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  }

  // Soft Delete: Marca inactivo y registra la fecha de borrado
  async deleteById(id: string): Promise<IFraccionamiento | null> {
    return FraccionamientoModel.findByIdAndUpdate(
      id,
      { estatus: 'inactivo', deletedAt: new Date() },
      { new: true }
    )
  }
}
```

---

### Paso 5: `[modulo].service.ts` (Lógica de Negocio)
Contiene las reglas de negocio (autogeneración de `slug`, validación de conflictos por nombre/slug). No conoce Express ni Mongoose.

```ts
// src/modules/fraccionamientos/fraccionamiento.service.ts
import { FraccionamientoRepository, type ListFilters } from './fraccionamiento.repository'
import { toFraccionamientoDto, type FraccionamientoResponseDto } from './fraccionamiento.dto'
import { type CreateFraccionamientoInput, type UpdateFraccionamientoInput } from './fraccionamiento.validator'
import { ConflictError, NotFoundError } from '@shared/errors/AppError'

const slugify = (text: string): string =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

export class FraccionamientoService {
  constructor(private readonly repository = new FraccionamientoRepository()) {}

  async create(input: CreateFraccionamientoInput): Promise<FraccionamientoResponseDto> {
    const slug = input.slug ? slugify(input.slug) : slugify(input.nombre)

    const [existenteNombre, existenteSlug] = await Promise.all([
      this.repository.findByNombre(input.nombre),
      this.repository.findBySlug(slug)
    ])

    if (existenteNombre) throw new ConflictError(`Ya existe un fraccionamiento con el nombre "${input.nombre}"`)
    if (existenteSlug) throw new ConflictError(`Ya existe un fraccionamiento con el slug "${slug}"`)

    const creado = await this.repository.create({ ...input, slug })
    return toFraccionamientoDto(creado)
  }

  async getById(id: string): Promise<FraccionamientoResponseDto> {
    const doc = await this.repository.findById(id)
    if (!doc) throw new NotFoundError('Fraccionamiento no encontrado')
    return toFraccionamientoDto(doc)
  }

  async list(filters: ListFilters) {
    const { items, total } = await this.repository.list(filters)
    return {
      items: items.map(toFraccionamientoDto),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.ceil(total / filters.pageSize) || 1
    }
  }

  async update(id: string, input: UpdateFraccionamientoInput): Promise<FraccionamientoResponseDto> {
    const updateData: Partial<UpdateFraccionamientoInput & { slug?: string }> = { ...input }

    if (input.nombre) {
      const existente = await this.repository.findByNombre(input.nombre)
      if (existente && existente._id.toString() !== id) {
        throw new ConflictError(`Ya existe un fraccionamiento con el nombre "${input.nombre}"`)
      }
      if (!input.slug) updateData.slug = slugify(input.nombre)
    }

    const actualizado = await this.repository.updateById(id, updateData)
    if (!actualizado) throw new NotFoundError('Fraccionamiento no encontrado')
    return toFraccionamientoDto(actualizado)
  }

  async delete(id: string): Promise<void> {
    const eliminado = await this.repository.deleteById(id)
    if (!eliminado) throw new NotFoundError('Fraccionamiento no encontrado')
  }
}
```

---

### Paso 6: `[modulo].controller.ts` (Controlador HTTP)
Traduce HTTP a casos de uso y asigna el status HTTP correspondiente.

```ts
// src/modules/fraccionamientos/fraccionamiento.controller.ts
import { type Request, type Response } from 'express'
import { FraccionamientoService } from './fraccionamiento.service'

export class FraccionamientoController {
  constructor(private readonly service = new FraccionamientoService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.create(req.body)
    res.status(201).json({ success: true, data: result })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getById(req.params.id)
    res.status(200).json({ success: true, data: result })
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const { page, pageSize, search, estatus } = req.query as any
    const result = await this.service.list({ page, pageSize, search, estatus })
    res.status(200).json({ success: true, ...result })
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.update(req.params.id, req.body)
    res.status(200).json({ success: true, data: result })
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(req.params.id)
    res.status(204).send()
  }
}
```

---

### Paso 7: `[modulo].routes.ts` (Rutas de Express)
Define los verbos HTTP y aplica la validación con `validate(...)`.

```ts
// src/modules/fraccionamientos/fraccionamiento.routes.ts
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

const router = Router()
const controller = new FraccionamientoController()

router.get('/', validate(listFraccionamientosSchema), asyncHandler(controller.list))
router.get('/:id', validate(idParamSchema), asyncHandler(controller.getById))
router.post('/', validate(createFraccionamientoSchema), asyncHandler(controller.create))
router.put('/:id', validate(updateFraccionamientoSchema), asyncHandler(controller.update))
router.delete('/:id', validate(idParamSchema), asyncHandler(controller.delete))

export default router
```

---

### Paso 8: `[modulo].swagger.ts` y Registro Global
Crea el archivo `.swagger.ts` dentro de la carpeta del módulo y regístralo en `src/config/swagger.ts` y `src/app.ts`.

```ts
// src/modules/fraccionamientos/fraccionamiento.swagger.ts
export const fraccionamientoPaths = {
  '/api/v1/fraccionamientos': { /* endpoints */ }
}

export const fraccionamientoSchemas = {
  Fraccionamiento: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '680000000000000000000001' },
      slug: { type: 'string', example: 'residencial-los-olivos' },
      nombre: { type: 'string', example: 'Residencial Los Olivos' },
      estado: { type: 'string', example: 'Puebla' },
      ciudad: { type: 'string', example: 'Puebla' },
      direccion: { type: 'string', example: 'Av. Los Olivos #100' },
      coordenadas: {
        type: 'object',
        properties: {
          lat: { type: 'number', example: 19.0437 },
          lng: { type: 'number', example: -98.198 }
        }
      },
      telefono: { type: 'string', example: '2221457800' },
      correo: { type: 'string', example: 'administracion@losolivos.accesia.mx' },
      estatus: { type: 'string', enum: ['activo', 'inactivo'], example: 'activo' },
      deletedAt: { type: 'string', format: 'date-time', nullable: true, example: null },
      createdAt: { type: 'string', format: 'date-time', example: '2026-09-22T22:00:00.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2026-09-22T22:00:00.000Z' }
    }
  }
}
```

Registra el módulo en `src/config/swagger.ts`:
```ts
import { fraccionamientoPaths, fraccionamientoSchemas } from '@modules/fraccionamientos/fraccionamiento.swagger'

export const swaggerDocument = {
  // ...
  paths: { ...fraccionamientoPaths },
  components: { schemas: { ...fraccionamientoSchemas } }
}
```

Y monta las rutas en `src/app.ts`:
```ts
app.use('/api/v1/fraccionamientos', fraccionamientoRoutes)
```

---

## 5. Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con recarga automática (`ts-node-dev`) |
| `npm run build` | Compila TypeScript a JavaScript nativo en la carpeta `dist/` |
| `npm start` | Ejecuta la versión compilada de producción (`dist/server.js`) |
| `npm run lint` | Ejecuta ESLint para mantener la calidad del código |

---

## 6. ¿Por qué la terminal imprime información al recibir peticiones?

Cuando ejecutas `npm run dev` y haces peticiones desde el navegador, Swagger UI o Postman, la consola imprime bloques de texto informativo.

### ¿De qué es esa información?
Es el **Logger Estructurado (`Pino` / `pino-http`)** de la aplicación.

Cada vez que entra una solicitud a la API, `pino-http` registra automáticamente:
1. **`req` (Solicitud):** Método HTTP (`GET`, `POST`, etc.), la URL solicitada, parámetros, IP del cliente y encabezados (`user-agent`, `host`, etc.).
2. **`res` (Respuesta):** Código de estado HTTP (`200 OK`, `304 Not Modified`, `404 Not Found`), tiempo de respuesta en milisegundos (`responseTime`) y encabezados de seguridad de Helmet (`content-security-policy`, `x-frame-options`, etc.).

### ¿Por qué a veces aparecen registros 404 como `/sw.js` o `/favicon.ico`?
Cuando abres la API o la documentación en un navegador web (Chrome, Brave, Firefox, etc.), el navegador busca automáticamente archivos del sistema como `/sw.js` (PWA Service Worker) o `/favicon.ico`. Como el backend es una API REST pura y no sirve esos archivos estáticos, la API responde con `404 Not Found` y Pino registra la petición. **Esto es 100% normal e informativo, no significa que haya un error en tu código.**

