import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { Location } from './entities/location.entity';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Location]),
    ClientsModule.register([
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
  ],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
