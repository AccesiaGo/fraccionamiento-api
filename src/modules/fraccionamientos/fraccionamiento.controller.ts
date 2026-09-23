import { type Request, type Response } from 'express'
import { FraccionamientoService } from './fraccionamiento.service'

/**
 * CONTROLLER: solo traduce HTTP <-> caso de uso.
 * Extrae input ya validado (gracias al middleware `validate`), llama al service,
 * y traduce el resultado a un status HTTP. Cero lógica de negocio aquí.
 */
export class FraccionamientoController {
  private readonly service: FraccionamientoService

  constructor(service = new FraccionamientoService()) {
    this.service = service
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.create(req.body)
    res.status(201).json({ success: true, data: result })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getById(req.params.id)
    res.status(200).json({ success: true, data: result })
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const { page, pageSize, search, estatus } = req.query as unknown as {
      page: number
      pageSize: number
      search?: string
      estatus?: 'activo' | 'inactivo'
    }
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

