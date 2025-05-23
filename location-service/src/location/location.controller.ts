import { Controller, Post, Body, Get, Query, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MessagePattern, ClientProxy } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create.location.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('locations')
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    @Inject('AREA_SERVICE') private areaClient: ClientProxy,
    @Inject('LOG_SERVICE') private logClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @ApiBody({
    schema: {
      example: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        latitude: 41.1612,
        longitude: 29.0292,
      },
    },
  })
  @Post()
  async create(@Body() createLocationDto: CreateLocationDto) {
    // Save location
    const location = await this.locationService.create(createLocationDto);

    // Check if location is within any predefined areas (async)
    this.checkLocationInAreas(location);

    return { success: true, locationId: location.id };
  }

  @Get()
  async findAll(
    @Query('userId') userId?: string,
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
  ) {
    const cacheKey = `locations:${userId}:${limit}:${offset}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const locations = await this.locationService.findAll(userId, limit, offset);
    await this.cacheManager.set(cacheKey, locations, 300); // 5 minutes

    return locations;
  }

  private async checkLocationInAreas(location: any) {
    try {
      // Get all areas from Area Service
      const areas = await this.areaClient.send('get_all_areas', {}).toPromise();

      for (const area of areas) {
        if (
          this.isPointInPolygon(
            { lat: location.latitude, lng: location.longitude },
            area.boundaries,
          )
        ) {
          // Emit event to Log Service
          this.logClient.emit('location_entered_area', {
            userId: location.userId,
            areaId: area.id,
            locationId: location.id,
            areaName: area.name,
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Error checking location in areas:', error);
    }
  }

  private isPointInPolygon(
    point: { lat: number; lng: number },
    polygon: any[],
  ): boolean {
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].lng > point.lng !== polygon[j].lng > point.lng &&
        point.lat <
          ((polygon[j].lat - polygon[i].lat) * (point.lng - polygon[i].lng)) /
            (polygon[j].lng - polygon[i].lng) +
            polygon[i].lat
      ) {
        return true;
      }
    }
    return false;
  }

  @MessagePattern('get_user_locations')
  async getUserLocations(data: { userId: string; limit?: number }) {
    return this.locationService.findAll(data.userId, data.limit);
  }
}
