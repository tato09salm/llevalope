import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://llevalope.pe',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  const puerto = process.env.PORT || 3001;
  await app.listen(puerto);

  console.log(`🚀 LlevaloPe API corriendo en: http://localhost:${puerto}/api`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
