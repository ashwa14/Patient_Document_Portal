import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 4000;
  const corsOrigin = configService.get('CORS_ORIGIN') || 'http://localhost:3000';

  // Enable CORS with detailed logging
  console.log(`🌐 CORS enabled for origin: ${corsOrigin}`);
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Ensure uploads directory exists
  const uploadDir = configService.get('UPLOAD_DIR') || './uploads';
  const uploadPath = path.resolve(uploadDir);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log(`Created uploads directory at ${uploadPath}`);
  }

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

