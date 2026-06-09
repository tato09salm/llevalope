import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const METODOS_PAGO = ['TARJETA', 'YAPE', 'PLIN', 'TRANSFERENCIA', 'CONTRA_ENTREGA', 'PAYPAL'] as const;
const ESTADOS_PEDIDO = [
  'PENDIENTE',
  'CONFIRMADO',
  'EN_PREPARACION',
  'ENVIADO',
  'EN_CAMINO',
  'ENTREGADO',
  'CANCELADO',
  'DEVUELTO',
] as const;

export class PedidoItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  varianteId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CrearPedidoDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  items: PedidoItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  direccionId?: number;

  @IsOptional()
  @IsIn(METODOS_PAGO)
  metodoPago?: (typeof METODOS_PAGO)[number];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cupon?: string;
}

export class ListarPedidosAdminDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite?: number = 20;

  @IsOptional()
  @IsIn(ESTADOS_PEDIDO)
  estado?: (typeof ESTADOS_PEDIDO)[number];
}

export class ActualizarEstadoPedidoDto {
  @IsIn(ESTADOS_PEDIDO)
  estado: (typeof ESTADOS_PEDIDO)[number];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}

