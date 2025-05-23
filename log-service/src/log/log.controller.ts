import { Controller, Get, Query, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventPattern } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { LogService } from './log.service';

@Controller('logs')
export class LogController {
  constructor(
    private readonly logService: LogService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  async findAll(
    @Query('userId') userId?: string,
    @Query('areaId') areaId?: string,
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
  ) {
    const cacheKey = `logs:${userId || 'all'}:${areaId || 'all'}:${limit}:${offset}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const logs = await this.logService.findAll(userId, areaId, limit, offset);
    await this.cacheManager.set(cacheKey, logs, 300); // 5 minutes
    
    return logs;
  }

  @Get('stats')
  async getStats(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const cacheKey = `log_stats:${userId || 'all'}:${startDate || ''}:${endDate || ''}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const stats = await this.logService.getStats(userId, startDate, endDate);
    await this.cacheManager.set(cacheKey, stats, 600); // 10 minutes
    
    return stats;
  }

  @EventPattern('location_entered_area')
  async handleLocationEnteredArea(data: {
    userId: string;
    areaId: string;
    locationId: string;
    areaName?: string;
    latitude?: number;
    longitude?: number;
    timestamp: Date;
  }) {
    try {
      await this.logService.createAreaLog(data);
      console.log(`Area entry logged: User ${data.userId} entered area ${data.areaId}`);
    } catch (error) {
      console.error('Error logging area entry:', error);
    }
  }
}