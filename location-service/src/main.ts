import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // HTTP Server
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  
  // RabbitMQ Microservice
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
  //     queue: 'location_queue',
  //     queueOptions: {
  //       durable: false,
  //     },
  //   },
  // });

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log('Location Service is running at: http://localhost:3001');
}
bootstrap();