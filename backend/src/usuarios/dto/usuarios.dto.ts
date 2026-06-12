import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ActualizarPerfilDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MaxLength(100)
  apellido: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}

export class AgregarCarritoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productoId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  varianteId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad?: number = 1;
}

export class ActualizarCantidadCarritoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class DireccionUsuarioDto {
  @IsString()
  @MaxLength(50)
  alias: string;

  @IsString()
  @MaxLength(200)
  nombreCompleto: string;

  @IsString()
  @MaxLength(20)
  telefono: string;

  @IsString()
  @MaxLength(100)
  departamento: string;

  @IsString()
  @MaxLength(100)
  provincia: string;

  @IsString()
  @MaxLength(100)
  distrito: string;

  @IsString()
  @MaxLength(500)
  direccion: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  referencia?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  predeterminada?: boolean;
}

