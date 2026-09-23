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



