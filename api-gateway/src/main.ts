import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();
  
  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Location Logging API')
    .setDescription('API for location logging and area monitoring')
    .setVersion('1.0')
    .addTag('locations')
    .addTag('areas')
    .addTag('logs')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('API Gateway is running on port 3000');
  console.log('Swagger documentation available at http://localhost:3000/api');
}
bootstrap();