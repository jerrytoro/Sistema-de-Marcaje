import { IsString, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO para actualizar un funcionario
 * Todos los campos son opcionales
 */
export class UpdateFuncionarioDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsOptional()
  dependencia?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
