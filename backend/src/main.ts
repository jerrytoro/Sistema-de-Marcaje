import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

process.env.TZ = 'America/La_Paz';
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

  const config = new DocumentBuilder()
    .setTitle('API GAMC')
    .setDescription('Descripción de la API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customCss: `
      .swagger-ui { background-color: #ffffff; }
      body { background-color: #ffffff; }
    `,
  });

  // Iniciar el servidor
  await app.listen(port);

}

bootstrap();