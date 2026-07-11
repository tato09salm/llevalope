import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const METODOS_PAGO = ['TARJETA', 'YAPE', 'PLIN', 'TRANSFERENCIA', 'CONTRA_ENTREGA', 'PAYPAL'] as const;
const TIPOS_ENVIO = ['STANDARD', 'EXPRESS'] as const;
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

export class DatosPagoDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroOperacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  voucher?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  ultimos4?: string;
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

  @IsOptional()
  @IsIn(TIPOS_ENVIO)
  tipoEnvio?: (typeof TIPOS_ENVIO)[number] = 'STANDARD';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  checkoutToken?: string;

  // Metadata de la simulación de pago (no se persiste en tablas de tarjetas
  // reales; solo se usa para decidir estadoPago y quedar registrada en notas
  // / historial del pedido).
  @IsOptional()
  @ValidateNested()
  @Type(() => DatosPagoDto)
  datosPago?: DatosPagoDto;
}

export class SimularPagoDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroOperacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  voucher?: string;
}

export class PreviewCheckoutDto {
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
  @IsString()
  @MaxLength(50)
  cupon?: string;

  @IsOptional()
  @IsIn(TIPOS_ENVIO)
  tipoEnvio?: (typeof TIPOS_ENVIO)[number] = 'STANDARD';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  reservarStock?: boolean = false;
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