import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { AreaLog } from './entities/area-log.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register(), TypeOrmModule.forFeature([AreaLog])],
  controllers: [LogController],
  providers: [LogService],
})
export class LogModule {}