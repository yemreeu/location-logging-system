import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'area_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('Martı Location API')
    .setDescription('Area servisinin Swagger dökümantasyonu')
    .setVersion('1.0')
    .addTag('areas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/area/docs', app, document);

  await app.listen(3002);
  console.log('Area Service is running at: http://localhost:3002');
}
bootstrap();
