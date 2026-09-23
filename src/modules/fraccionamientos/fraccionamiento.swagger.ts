export const fraccionamientoPaths = {
  '/api/v1/fraccionamientos': {
    get: {
      summary: 'Listar fraccionamientos',
      tags: ['Fraccionamientos'],
      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', default: 1 },
          description: 'Número de página'
        },
        {
          name: 'pageSize',
          in: 'query',
          schema: { type: 'integer', default: 10 },
          description: 'Cantidad de elementos por página'
        },
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string' },
          description: 'Búsqueda por texto (nombre, slug, dirección, correo)'
        },
        {
          name: 'estatus',
          in: 'query',
          schema: { type: 'string', enum: ['activo', 'inactivo'] },
          description: 'Filtrar por estatus'
        }
      ],
      responses: {
        '200': {
          description: 'Lista de fraccionamientos paginada',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  items: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Fraccionamiento' }
                  },
                  total: { type: 'integer', example: 1 },
                  page: { type: 'integer', example: 1 },
                  pageSize: { type: 'integer', example: 10 },
                  totalPages: { type: 'integer', example: 1 }
                }
              }
            }
          }
        }
      }
    },
    post: {
      summary: 'Crear un nuevo fraccionamiento',
      tags: ['Fraccionamientos'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateFraccionamientoInput' }
          }
        }
      },
      responses: {
        '201': {
          description: 'Fraccionamiento creado exitosamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Fraccionamiento' }
                }
              }
            }
          }
        },
        '400': { description: 'Error de validación en los datos' },
        '409': { description: 'Conflicto: Ya existe un fraccionamiento con ese nombre o slug' }
      }
    }
  },
  '/api/v1/fraccionamientos/{id}': {
    get: {
      summary: 'Obtener un fraccionamiento por ID',
      tags: ['Fraccionamientos'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'ID del fraccionamiento (MongoDB ObjectId)'
        }
      ],
      responses: {
        '200': {
          description: 'Detalle del fraccionamiento',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Fraccionamiento' }
                }
              }
            }
          }
        },
        '404': { description: 'Fraccionamiento no encontrado' }
      }
    },
    put: {
      summary: 'Actualizar un fraccionamiento',
      tags: ['Fraccionamientos'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'ID del fraccionamiento'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateFraccionamientoInput' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Fraccionamiento actualizado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Fraccionamiento' }
                }
              }
            }
          }
        },
        '404': { description: 'Fraccionamiento no encontrado' }
      }
    },
    delete: {
      summary: 'Eliminar un fraccionamiento',
      tags: ['Fraccionamientos'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'ID del fraccionamiento'
        }
      ],
      responses: {
        '204': { description: 'Fraccionamiento eliminado exitosamente' },
        '404': { description: 'Fraccionamiento no encontrado' }
      }
    }
  }
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
  },
  CreateFraccionamientoInput: {
    type: 'object',
    required: ['nombre', 'estado', 'ciudad', 'direccion', 'telefono', 'correo'],
    properties: {
      slug: { type: 'string', example: 'residencial-los-olivos', description: 'Opcional (se genera automáticamente si no se envía)' },
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
      estatus: { type: 'string', enum: ['activo', 'inactivo'], default: 'activo' }
    }
  },
  UpdateFraccionamientoInput: {
    type: 'object',
    properties: {
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
      estatus: { type: 'string', enum: ['activo', 'inactivo'] }
    }
  }
}

