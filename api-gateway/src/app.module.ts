import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { LocationModule } from './location/location.module';
import { AreaModule } from './area/area.module';
import { LogModule } from './log/log.module';

console.log(
  'process.env.LOCATION_SERVICE_HOST',
  process.env.LOCATION_SERVICE_HOST,
);
console.log(
  'process.env.LOCATION_SERVICE_PORT',
  process.env.LOCATION_SERVICE_PORT,
);

@Module({
  imports: [
    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Caching
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      ttl: 300, // 5 minutes
    }),

    // Microservice Clients
    ClientsModule.register([
      {
        name: 'LOCATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'location_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'AREA_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'area_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'LOG_SERVICE',
        transport: Transport.RMQ,
         options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'log_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),

    LocationModule,
    AreaModule,
    LogModule,
  ],
})
export class AppModule {}
