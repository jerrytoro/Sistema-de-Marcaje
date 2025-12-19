import { IsOptional, IsString, IsInt, IsDateString, IsBoolean, IsEnum } from 'class-validator';

// Definir TipoMarcaje
type TipoMarcaje = 'INGRESO_MANANA' | 'SALIDA_DESCANSO' | 'INGRESO_TARDE' | 'SALIDA_FINAL';

/**
 * DTO para actualizar una asistencia
 * Todos los campos son opcionales
 */
export class UpdateAsistenciaDto {
  @IsDateString({}, { message: 'La fecha debe estar en formato ISO (YYYY-MM-DD)' })
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsOptional()
  horaMarcaje?: string;

  @IsEnum(['INGRESO_MANANA', 'SALIDA_DESCANSO', 'INGRESO_TARDE', 'SALIDA_FINAL'])
  @IsOptional()
  tipoMarcaje?: TipoMarcaje;

  @IsInt()
  @IsOptional()
  minutosTardanza?: number;

  @IsBoolean()
  @IsOptional()
  verificado?: boolean;

  @IsString()
  @IsOptional()
  observacion?: string;
}