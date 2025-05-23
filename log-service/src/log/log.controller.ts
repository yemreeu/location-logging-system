import { Controller, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { LogService } from './log.service';

@Controller()
export class LogController {
  constructor(
    private readonly logService: LogService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @MessagePattern('get_logs')
  async handleGetLogs(data: {
    userId?: string;
    areaId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { userId, areaId, limit = 100, offset = 0 } = data;
    const cacheKey = `logs:${userId || 'all'}:${areaId || 'all'}:${limit}:${offset}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const logs = await this.logService.findAll(userId, areaId, limit, offset);
    await this.cacheManager.set(cacheKey, logs, 300); // 5 dakika cache
    return logs;
  }

  @MessagePattern('get_log_stats')
  async handleGetLogStats(data: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { userId, startDate, endDate } = data;
    const cacheKey = `log_stats:${userId || 'all'}:${startDate || ''}:${endDate || ''}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const stats = await this.logService.getStats(userId, startDate, endDate);
    await this.cacheManager.set(cacheKey, stats, 600); // 10 dakika cache
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
