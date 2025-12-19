import { IsString, IsNotEmpty, MinLength, IsEnum, IsOptional, IsBoolean } from 'class-validator';
type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';

/**
 * DTO para crear un nuevo usuario
 */
export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El username es requerido' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsEnum(['ADMIN', 'RRHH', 'FUNCIONARIO'], { message: 'Rol inválido. Debe ser: ADMIN, RRHH o FUNCIONARIO' })
  @IsOptional()
  rol?: RolUsuario;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  // Datos del funcionario
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;

  @IsString()
  @IsNotEmpty({ message: 'El cargo es requerido' })
  cargo: string;

  @IsString()
  @IsNotEmpty({ message: 'La dependencia es requerida' })
  dependencia: string;
}
