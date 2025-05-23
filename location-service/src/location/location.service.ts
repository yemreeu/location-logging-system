import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create.location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.locationRepository.create(createLocationDto);
    return this.locationRepository.save(location);
  }

  async findAll(userId?: string, limit = 100, offset = 0): Promise<Location[]> {
    const query = this.locationRepository.createQueryBuilder('location');
    
    if (userId) {
      query.where('location.userId = :userId', { userId });
    }
    
    return query
      .orderBy('location.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  async findByUserId(userId: string, limit = 100): Promise<Location[]> {
    return this.locationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}