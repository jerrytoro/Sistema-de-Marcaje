import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';

/**
 * Decorator para especificar roles permitidos en una ruta
 * Uso: @Roles(RolUsuario.ADMIN, RolUsuario.RRHH)
 */
export const Roles = (...roles: RolUsuario[]) => SetMetadata('roles', roles);
