import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AreaLog } from './entities';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(AreaLog)
    private areaLogRepository: Repository<AreaLog>,
  ) {}

  async createAreaLog(data: {
    userId: string;
    areaId: string;
    locationId: string;
    areaName?: string;
    latitude?: number;
    longitude?: number;
    timestamp?: Date;
  }): Promise<AreaLog> {
    const log = this.areaLogRepository.create({
      userId: data.userId,
      areaId: data.areaId,
      locationId: data.locationId,
      areaName: data.areaName,
      latitude: data.latitude,
      longitude: data.longitude,
      createdAt: data.timestamp || new Date(),
    });
    
    return this.areaLogRepository.save(log);
  }

  async findAll(
    userId?: string,
    areaId?: string,
    limit = 100,
    offset = 0,
  ): Promise<AreaLog[]> {
    const query = this.areaLogRepository.createQueryBuilder('log');
    
    if (userId) {
      query.andWhere('log.userId = :userId', { userId });
    }
    
    if (areaId) {
      query.andWhere('log.areaId = :areaId', { areaId });
    }
    
    return query
      .orderBy('log.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  async getStats(userId?: string, startDate?: string, endDate?: string) {
    const query = this.areaLogRepository.createQueryBuilder('log');
    
    if (userId) {
      query.andWhere('log.userId = :userId', { userId });
    }
    
    if (startDate) {
      query.andWhere('log.createdAt >= :startDate', { startDate });
    }
    
    if (endDate) {
      query.andWhere('log.createdAt <= :endDate', { endDate });
    }

    const totalLogs = await query.getCount();
    
    const areaStats = await query
      .select('log.areaId', 'areaId')
      .addSelect('log.areaName', 'areaName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.areaId')
      .addGroupBy('log.areaName')
      .orderBy('count', 'DESC')
      .getRawMany();

    const userStats = await query
      .select('log.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.userId')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      totalLogs,
      areaStats,
      userStats,
    };
  }
}