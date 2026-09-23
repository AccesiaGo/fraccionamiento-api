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
    slug: {
      type: String,
      required: [true, 'El slug del fraccionamiento es requerido'],
      trim: true,
      unique: true,
      lowercase: true
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del fraccionamiento es requerido'],
      trim: true,
      unique: true,
      maxlength: [120, 'El nombre no puede exceder 120 caracteres']
    },
    estado: {
      type: String,
      required: [true, 'El estado es requerido'],
      trim: true
    },
    ciudad: {
      type: String,
      required: [true, 'La ciudad es requerida'],
      trim: true
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es requerida'],
      trim: true
    },
    coordenadas: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false }
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es requerido'],
      trim: true
    },
    correo: {
      type: String,
      required: [true, 'El correo electrónico es requerido'],
      trim: true,
      lowercase: true
    },
    estatus: {
      type: String,
      enum: ['activo', 'inactivo'],
      default: 'activo'
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true, collection: 'fraccionamientos' }
)

fraccionamientoSchema.index({ nombre: 'text', slug: 'text', estado: 'text', ciudad: 'text', direccion: 'text', correo: 'text' })


export const FraccionamientoModel = model<IFraccionamiento>('Fraccionamiento', fraccionamientoSchema, 'fraccionamientos')


