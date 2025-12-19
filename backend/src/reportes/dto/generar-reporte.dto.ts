import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';

/**
 * DTO para generar un reporte mensual
 */
export class GenerarReporteDto {
  @IsInt({ message: 'El ID del funcionario debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del funcionario es requerido' })
  funcionarioId: number;

  @IsInt({ message: 'El año debe ser un número entero' })
  @IsNotEmpty({ message: 'El año es requerido' })
  @Min(2020, { message: 'El año debe ser mayor o igual a 2020' })
  @Max(2100, { message: 'El año debe ser menor o igual a 2100' })
  anio: number;

  @IsInt({ message: 'El mes debe ser un número entero' })
  @IsNotEmpty({ message: 'El mes es requerido' })
  @Min(1, { message: 'El mes debe estar entre 1 y 12' })
  @Max(12, { message: 'El mes debe estar entre 1 y 12' })
  mes: number;
}
