import { IsString, IsNotEmpty, MinLength, IsIn, IsOptional } from 'class-validator';

// Definir RolUsuario como type
type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';

/**
 * DTO para Registro de Usuario
 */
export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El username es requerido' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsIn(['ADMIN', 'RRHH', 'FUNCIONARIO'], { message: 'Rol inválido' })
  @IsOptional()
  rol?: RolUsuario;

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