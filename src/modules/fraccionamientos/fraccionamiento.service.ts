import { FraccionamientoRepository, type ListFilters } from './fraccionamiento.repository'
import { toFraccionamientoDto, type FraccionamientoResponseDto } from './fraccionamiento.dto'
import { type CreateFraccionamientoInput, type UpdateFraccionamientoInput } from './fraccionamiento.validator'
import { ConflictError, NotFoundError } from '@shared/errors/AppError'

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export class FraccionamientoService {
  private readonly repository: FraccionamientoRepository

  constructor(repository = new FraccionamientoRepository()) {
    this.repository = repository
  }

  async create(input: CreateFraccionamientoInput): Promise<FraccionamientoResponseDto> {
    const slug = input.slug ? slugify(input.slug) : slugify(input.nombre)

    const [existenteNombre, existenteSlug] = await Promise.all([
      this.repository.findByNombre(input.nombre),
      this.repository.findBySlug(slug)
    ])

    if (existenteNombre) {
      throw new ConflictError(`Ya existe un fraccionamiento con el nombre "${input.nombre}"`)
    }
    if (existenteSlug) {
      throw new ConflictError(`Ya existe un fraccionamiento con el slug "${slug}"`)
    }

    const creado = await this.repository.create({
      ...input,
      slug
    })
    return toFraccionamientoDto(creado)
  }

  async getById(id: string): Promise<FraccionamientoResponseDto> {
    const doc = await this.repository.findById(id)
    if (!doc) {
      throw new NotFoundError('Fraccionamiento no encontrado')
    }
    return toFraccionamientoDto(doc)
  }

  async list(filters: ListFilters): Promise<{
    items: FraccionamientoResponseDto[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }> {
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
      if (!input.slug) {
        updateData.slug = slugify(input.nombre)
      }
    }

    if (input.slug) {
      const slugified = slugify(input.slug)
      const existente = await this.repository.findBySlug(slugified)
      if (existente && existente._id.toString() !== id) {
        throw new ConflictError(`Ya existe un fraccionamiento con el slug "${slugified}"`)
      }
      updateData.slug = slugified
    }

    const actualizado = await this.repository.updateById(id, updateData)
    if (!actualizado) {
      throw new NotFoundError('Fraccionamiento no encontrado')
    }
    return toFraccionamientoDto(actualizado)
  }

  async delete(id: string): Promise<void> {
    const eliminado = await this.repository.deleteById(id)
    if (!eliminado) {
      throw new NotFoundError('Fraccionamiento no encontrado')
    }
  }
}

