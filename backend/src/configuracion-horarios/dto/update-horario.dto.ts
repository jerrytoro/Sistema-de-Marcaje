import { IsString, IsInt, IsOptional, Matches, Min, Max } from 'class-validator';

/**
 * DTO para actualizar configuración de horario
 */
export class UpdateHorarioDto {
  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora debe estar en formato HH:MM (00:00 - 23:59)',
  })
  horaProgramada?: string;

  @IsInt({ message: 'La tolerancia debe ser un número entero' })
  @IsOptional()
  @Min(0, { message: 'La tolerancia no puede ser negativa' })
  @Max(60, { message: 'La tolerancia no puede ser mayor a 60 minutos' })
  toleranciaMinutos?: number;
}

/**
 * DTO para actualizar todos los horarios
 */
export class UpdateAllHorariosDto {
  @IsOptional()
  INGRESO_MANANA?: UpdateHorarioDto;

  @IsOptional()
  SALIDA_DESCANSO?: UpdateHorarioDto;

  @IsOptional()
  INGRESO_TARDE?: UpdateHorarioDto;

  @IsOptional()
  SALIDA_FINAL?: UpdateHorarioDto;
}
