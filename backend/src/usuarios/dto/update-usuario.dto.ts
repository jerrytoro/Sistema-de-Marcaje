import { IsString, IsOptional, IsEnum, IsBoolean, MinLength } from 'class-validator';
type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';

/**
 * DTO para actualizar un usuario
 * Todos los campos son opcionales
 */
export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsEnum(['ADMIN', 'RRHH', 'FUNCIONARIO'], { message: 'Rol inválido' })
  @IsOptional()
  rol?: RolUsuario;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  // Datos del funcionario
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
}
