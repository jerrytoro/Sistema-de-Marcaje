import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO para Login
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'El username es requerido' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
