import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * DatabaseModule
 * Módulo global que proporciona el servicio de Prisma a toda la aplicación
 * Al ser @Global, no necesitas importarlo en cada módulo
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
