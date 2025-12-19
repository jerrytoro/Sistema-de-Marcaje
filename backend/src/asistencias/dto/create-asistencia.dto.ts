import { IsInt, IsNotEmpty, IsDateString, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';

// Definir TipoMarcaje
type TipoMarcaje = 'INGRESO_MANANA' | 'SALIDA_DESCANSO' | 'INGRESO_TARDE' | 'SALIDA_FINAL';

/**
 * DTO para registrar una asistencia (marcaje individual)
 */
export class CreateAsistenciaDto {
  @IsInt({ message: 'El ID del funcionario debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del funcionario es requerido' })
  funcionarioId: number;

  @IsDateString({}, { message: 'La fecha debe estar en formato ISO (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha es requerida' })
  fecha: string;

  @IsString()
  @IsNotEmpty({ message: 'La hora de marcaje es requerida (formato HH:MM)' })
  horaMarcaje: string;

  @IsEnum(['INGRESO_MANANA', 'SALIDA_DESCANSO', 'INGRESO_TARDE', 'SALIDA_FINAL'], { 
    message: 'Tipo de marcaje inválido' 
  })
  @IsNotEmpty({ message: 'El tipo de marcaje es requerido' })
  tipoMarcaje: TipoMarcaje;

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