import { IsIn, IsString, MaxLength } from 'class-validator';

const CATEGORIAS_TICKET = ['CONSULTA', 'RECLAMO', 'DEVOLUCION', 'PAGO', 'ENVIO', 'PRODUCTO', 'OTRO'] as const;
const PRIORIDADES_TICKET = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'] as const;
const ESTADOS_TICKET = ['ABIERTO', 'EN_ATENCION', 'PENDIENTE_CLIENTE', 'RESUELTO', 'CERRADO'] as const;

export class CrearTicketDto {
  @IsString()
  @MaxLength(300)
  asunto: string;

  @IsString()
  @MaxLength(5000)
  descripcion: string;

  @IsIn(CATEGORIAS_TICKET)
  categoria: (typeof CATEGORIAS_TICKET)[number];

  @IsIn(PRIORIDADES_TICKET)
  prioridad: (typeof PRIORIDADES_TICKET)[number];
}

export class ResponderTicketDto {
  @IsString()
  @MaxLength(5000)
  mensaje: string;
}

export class ActualizarEstadoTicketDto {
  @IsIn(ESTADOS_TICKET)
  estado: (typeof ESTADOS_TICKET)[number];
}

