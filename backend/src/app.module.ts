import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { FuncionariosModule } from './funcionarios/funcionarios.module';
import { ConfiguracionHorariosModule } from './configuracion-horarios/configuracion-horarios.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { ReportesModule } from './reportes/reportes.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { FacialRecognitionModule } from './facial-recognition/facial-recognition.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ScheduledTasksModule } from './scheduled-tasks/scheduled-tasks.module';

/**
 * AppModule
 * Módulo raíz de la aplicación
 */
@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Módulo de base de datos (Prisma)
    DatabaseModule,

    // Módulo de autenticación
    AuthModule,

    // Módulo de usuarios
    UsuariosModule,

    // Módulo de funcionarios
    FuncionariosModule,

    // Módulo de configuración de horarios
    ConfiguracionHorariosModule,

    // Módulo de asistencias
    AsistenciasModule,

    // Módulo de reportes
    ReportesModule,

    // ... otros módulos
    FacialRecognitionModule,

    // ... otros módulos
    NotificationsModule,

    // ... otros módulos
    ScheduledTasksModule,
  ],
  controllers: [],
  providers: [
    // Guard global de autenticación JWT
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
