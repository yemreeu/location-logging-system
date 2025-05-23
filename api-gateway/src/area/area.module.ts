import { Module } from '@nestjs/common';
import { AreaController } from './area.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
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
    ]),
  ],
  controllers: [AreaController],
})
export class AreaModule {}
