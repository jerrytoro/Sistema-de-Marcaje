import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';

/**
 * Función principal que inicializa la aplicación NestJS
 */
async function bootstrap() {
  // Crear la aplicación NestJS
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Configurar validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma los tipos automáticamente
    }),
  );

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // Habilitar CORS *****
  app.enableCors();
  
  // Servir archivos estáticos (fotos) *****
  app.use('/uploads', express.static('uploads'));
  
  //await app.listen(3000);
  // Puerto de la aplicación
  const port = process.env.PORT || 3000;

  // Iniciar el servidor
  await app.listen(port);

  console.log('');
  console.log('🚀 ================================================');
  console.log(`✅ Servidor corriendo en: http://localhost:${port}`);
  console.log(`📡 API disponible en: http://localhost:${port}/api`);
  console.log('🗄️  Base de datos: PostgreSQL');
  console.log('================================================');
  console.log('');
}

bootstrap();