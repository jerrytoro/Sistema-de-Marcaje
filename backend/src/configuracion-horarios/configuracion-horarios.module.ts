import { Module } from '@nestjs/common';
import { ConfiguracionHorariosService } from './configuracion-horarios.service';
import { ConfiguracionHorariosController } from './configuracion-horarios.controller';

/**
 * Módulo de Configuración de Horarios
 */
@Module({
  controllers: [ConfiguracionHorariosController],
  providers: [ConfiguracionHorariosService],
  exports: [ConfiguracionHorariosService],
})
export class ConfiguracionHorariosModule {}
