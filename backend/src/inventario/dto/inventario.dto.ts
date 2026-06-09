import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const TIPOS_MOVIMIENTO = ['ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION'] as const;

export class MovimientosInventarioQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  varianteId?: number;
}

export class AjustarStockDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  varianteId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number;

  @IsString()
  @MaxLength(300)
  motivo: string;

  @IsIn(TIPOS_MOVIMIENTO)
  tipo: (typeof TIPOS_MOVIMIENTO)[number];
}

