import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const ESTADOS_ORDEN_COMPRA = [
  'BORRADOR',
  'ENVIADA',
  'CONFIRMADA',
  'EN_TRANSITO',
  'RECIBIDA_PARCIAL',
  'RECIBIDA',
  'CANCELADA',
] as const;

const limpiarOpcional = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

export class CrearProveedorDto {
  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsString()
  @Length(11, 11)
  ruc: string;

  @IsOptional()
  @Transform(limpiarOpcional)
  @IsString()
  @MaxLength(100)
  contacto?: string;

  @IsOptional()
  @Transform(limpiarOpcional)
  @IsEmail()
  correo?: string;

  @IsOptional()
  @Transform(limpiarOpcional)
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @Transform(limpiarOpcional)
  @IsString()
  @MaxLength(500)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  pais?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @Transform(limpiarOpcional)
  @IsString()
  @MaxLength(2000)
  notas?: string;
}

export class ActualizarEstadoOrdenDto {
  @IsString()
  @IsIn(ESTADOS_ORDEN_COMPRA)
  estado: (typeof ESTADOS_ORDEN_COMPRA)[number];
}

export class CrearOrdenCompraItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productoId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  varianteId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidadPedida: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioUnit: number;
}

export class CrearOrdenCompraDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  proveedorId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CrearOrdenCompraItemDto)
  items: CrearOrdenCompraItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notas?: string;
}

