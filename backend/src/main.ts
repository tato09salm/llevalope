import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const logger = new Logger('Bootstrap');

  // Aumentar límite de tamaño de solicitudes (20mb para soportar imágenes base64 DreamIA)
  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ extended: true, limit: '20mb' }));

  // Middleware de logging de solicitudes
  app.use((req, res, next) => {
    logger.log(`${req.method} ${req.url}`);
    res.on('finish', () => {
      logger.log(`${req.method} ${req.url} - ${res.statusCode}`);
    });
    next();
  });

  // Prefijo global de API
  app.setGlobalPrefix('api');

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro global de excepciones (temporalmente comentado para debugging)
  // app.useGlobalFilters(new AllExceptionsFilter());

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'https://llevalope.pe',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const puerto = process.env.PORT || 3001;
  await app.listen(puerto);

  logger.log(`🚀 LlevaloPe API corriendo en: http://localhost:${puerto}/api`);
  logger.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
