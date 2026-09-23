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

    if (filters.estatus) {
      query.estatus = filters.estatus
    } else {
      query.estatus = 'activo'
    }

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

  /**
   * Soft Delete: Marca el registro como inactivo y registra la fecha de borrado.
   * El registro NUNCA se elimina físicamente de la base de datos.
   */
  async deleteById(id: string): Promise<IFraccionamiento | null> {
    return FraccionamientoModel.findByIdAndUpdate(
      id,
      {
        estatus: 'inactivo',
        deletedAt: new Date()
      },
      { new: true }
    )
  }
}


